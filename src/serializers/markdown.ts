import { Text, Element as SlateElement, type Descendant } from 'slate';
import type {
  CustomElement,
  FormattedText,
  HeadingElement,
  ImageElement,
  LinkElement,
  CodeBlockElement,
  VariableElement,
  VideoElement,
} from '../core/types';
import { normalizeLinkUrl } from '../core/utils/url';

// ---------------------------------------------------------------------------
// Serialize: Slate JSON -> Markdown
// ---------------------------------------------------------------------------

function serializeText(node: FormattedText): string {
  if (!node.text) return '';
  let text = node.code
    ? wrapInlineCode(node.text)
    : escapeMarkdownText(node.text);

  if (node.bold) text = `**${text}**`;
  if (node.italic) text = `*${text}*`;
  if (node.strikethrough) text = `~~${text}~~`;
  // Underline has no standard Markdown equivalent; skip

  return text;
}

function serializeNode(node: Descendant, listDepth = 0): string {
  if (Text.isText(node)) {
    return serializeText(node as FormattedText);
  }

  const element = node as CustomElement;
  const children = element.children
    .map((child) => serializeNode(child, listDepth))
    .join('');

  switch (element.type) {
    case 'paragraph':
      return `${escapeMarkdownBlockStart(children)}\n\n`;

    case 'heading': {
      const el = element as HeadingElement;
      const hashes = '#'.repeat(el.level);
      return `${hashes} ${children}\n\n`;
    }

    case 'blockquote':
      return children
        .trimEnd()
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') + '\n\n';

    case 'code-block': {
      const el = element as CodeBlockElement;
      const language = /^[a-zA-Z0-9_+-]+$/.test(el.language ?? '') ? el.language : '';
      const rawCode = element.children
        .map((child) => Text.isText(child) ? child.text : serializeNode(child, listDepth))
        .join('');
      const longestFence = Math.max(2, ...Array.from(rawCode.matchAll(/`+/g), (match) => match[0].length));
      const fence = '`'.repeat(longestFence + 1);
      return `${fence}${language}\n${rawCode}\n${fence}\n\n`;
    }

    case 'bulleted-list':
      return element.children
        .map((child) => serializeNode(child, listDepth))
        .join('') + '\n';

    case 'numbered-list':
      return element.children
        .map((child, i) => {
          const indent = '  '.repeat(listDepth);
          const content = (SlateElement.isElement(child) && child.type === 'list-item')
            ? (child as any).children.map((c: Descendant) => serializeNode(c, listDepth + 1)).join('')
            : serializeNode(child, listDepth + 1);
          return `${indent}${i + 1}. ${content.trim()}\n`;
        })
        .join('');

    case 'list-item': {
      const indent = '  '.repeat(Math.max(0, listDepth - 1));
      return `${indent}- ${children.trim()}\n`;
    }

    case 'link': {
      const el = element as LinkElement;
      const safeUrl = normalizeLinkUrl(el.url);
      return safeUrl ? `[${children}](${escapeMarkdownDestination(safeUrl)})` : children;
    }

    case 'image': {
      const el = element as ImageElement;
      return `![${escapeMarkdownText(el.alt ?? '')}](${escapeMarkdownDestination(el.url)})\n\n`;
    }

    case 'variable': {
      const el = element as VariableElement;
      return `{{${el.name}}}`;
    }

    case 'video': {
      const el = element as VideoElement;
      const label = escapeMarkdownText(el.caption?.trim() || 'Video');
      const safeUrl = normalizeLinkUrl(el.url);
      return safeUrl ? `[${label}](${escapeMarkdownDestination(safeUrl)})\n\n` : `${label}\n\n`;
    }

    default:
      return `${children}\n\n`;
  }
}

/**
 * Serialize a Slate document to a Markdown string.
 */
function serialize(value: Descendant[]): string {
  return value
    .map((node) => serializeNode(node))
    .join('')
    .trim();
}

// ---------------------------------------------------------------------------
// Deserialize: Markdown -> Slate JSON (basic)
// ---------------------------------------------------------------------------

/**
 * Basic Markdown to Slate JSON deserializer.
 * Handles headings, bold, italic, code, links, images, lists, blockquotes.
 *
 * For full-featured Markdown parsing, consider using a dedicated library
 * like `remark` and converting the AST to Slate nodes.
 */
function deserialize(markdown: string): Descendant[] {
  const lines = markdown.split('\n');
  const result: Descendant[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Code block
    const fenceMatch = line.match(/^(`{3,})([a-zA-Z0-9_+-]*)\s*$/);
    if (fenceMatch) {
      const fence = fenceMatch[1];
      const language = fenceMatch[2] || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== fence) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++; // skip closing fence
      result.push({
        type: 'code-block',
        language,
        children: [{ text: codeLines.join('\n') }],
      });
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      result.push({
        type: 'heading',
        level,
        children: parseInline(headingMatch[2]),
      });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      result.push({
        type: 'blockquote',
        children: [{ type: 'paragraph', children: parseInline(quoteLines.join(' ')) }],
      });
      continue;
    }

    // Unordered list
    if (/^[-*]\s/.test(line)) {
      const items: Descendant[] = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i])) {
        items.push({
          type: 'list-item',
          children: parseInline(lines[i].replace(/^[-*]\s/, '')),
        });
        i++;
      }
      result.push({ type: 'bulleted-list', children: items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: Descendant[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push({
          type: 'list-item',
          children: parseInline(lines[i].replace(/^\d+\.\s/, '')),
        });
        i++;
      }
      result.push({ type: 'numbered-list', children: items });
      continue;
    }

    // Image (standalone line), including escaped brackets in alt text.
    const image = parseStandaloneImage(line);
    if (image) {
      result.push({
        type: 'image',
        alt: image.alt,
        url: image.url,
        children: [{ text: '' as const }],
      } as any);
      i++;
      continue;
    }

    // Paragraph
    result.push({
      type: 'paragraph',
      children: parseInline(line),
    });
    i++;
  }

  return result.length > 0
    ? result
    : [{ type: 'paragraph', children: [{ text: '' }] }];
}

/**
 * Parse inline Markdown to Slate text nodes.
 * Handles: **bold**, *italic*, ~~strikethrough~~, `code`, [links](url)
 */
function parseInline(text: string): Descendant[] {
  const nodes = parseInlineSegment(text);
  return nodes.length > 0 ? nodes : [{ text: '' }];
}

function parseInlineSegment(source: string): Descendant[] {
  const nodes: Descendant[] = [];
  let buffer = '';
  let index = 0;

  const flushText = () => {
    if (!buffer) return;
    nodes.push({ text: buffer });
    buffer = '';
  };

  while (index < source.length) {
    if (source[index] === '\\' && index + 1 < source.length && isMarkdownEscapable(source[index + 1])) {
      buffer += source[index + 1];
      index += 2;
      continue;
    }

    if (source[index] === '`') {
      const fenceLength = countRun(source, index, '`');
      const fence = '`'.repeat(fenceLength);
      const closingIndex = findUnescapedToken(source, fence, index + fenceLength);
      if (closingIndex >= 0) {
        flushText();
        nodes.push({
          text: source.slice(index + fenceLength, closingIndex),
          code: true,
        });
        index = closingIndex + fenceLength;
        continue;
      }
    }

    if (source[index] === '[') {
      const labelEnd = findUnescapedToken(source, ']', index + 1);
      if (labelEnd >= 0 && source[labelEnd + 1] === '(') {
        const destinationEnd = findUnescapedToken(source, ')', labelEnd + 2);
        if (destinationEnd >= 0) {
          flushText();
          const labelNodes = parseInlineSegment(source.slice(index + 1, labelEnd));
          const url = normalizeLinkUrl(unescapeMarkdown(source.slice(labelEnd + 2, destinationEnd)));
          if (url) {
            nodes.push({ type: 'link', url, children: labelNodes } as any);
          } else {
            nodes.push(...labelNodes);
          }
          index = destinationEnd + 1;
          continue;
        }
      }
    }

    const mark = getOpeningMark(source, index);
    if (mark) {
      const closingIndex = findUnescapedToken(source, mark.delimiter, index + mark.delimiter.length);
      if (closingIndex > index + mark.delimiter.length) {
        flushText();
        const markedNodes = parseInlineSegment(
          source.slice(index + mark.delimiter.length, closingIndex)
        );
        nodes.push(...applyInlineMarks(markedNodes, mark.marks));
        index = closingIndex + mark.delimiter.length;
        continue;
      }
    }

    buffer += source[index];
    index++;
  }

  flushText();
  return nodes;
}

function escapeMarkdownText(text: string): string {
  return text.replace(/([\\`*_[\]{}<>!|~])/g, '\\$1');
}

function escapeMarkdownBlockStart(text: string): string {
  return text.replace(/^(\s*)(#{1,6} |> |[-+] |\d+\. )/, (_match, whitespace: string, marker: string) => {
    return `${whitespace}\\${marker}`;
  });
}

function escapeMarkdownDestination(url: string): string {
  return encodeURI(url).replace(/\(/g, '%28').replace(/\)/g, '%29');
}

function wrapInlineCode(text: string): string {
  const longestFence = Math.max(0, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length));
  const fence = '`'.repeat(longestFence + 1);
  return `${fence}${text}${fence}`;
}

function parseStandaloneImage(line: string): { alt: string; url: string } | null {
  if (!line.startsWith('![')) return null;
  const altEnd = findUnescapedToken(line, ']', 2);
  if (altEnd < 0 || line[altEnd + 1] !== '(') return null;
  const destinationEnd = findUnescapedToken(line, ')', altEnd + 2);
  if (destinationEnd !== line.length - 1) return null;
  return {
    alt: unescapeMarkdown(line.slice(2, altEnd)),
    url: unescapeMarkdown(line.slice(altEnd + 2, destinationEnd)),
  };
}

function getOpeningMark(
  source: string,
  index: number
): { delimiter: string; marks: Partial<FormattedText> } | null {
  if (source.startsWith('~~', index)) return { delimiter: '~~', marks: { strikethrough: true } };
  if (source.startsWith('***', index)) return { delimiter: '***', marks: { bold: true, italic: true } };
  if (source.startsWith('**', index)) return { delimiter: '**', marks: { bold: true } };
  if (source[index] === '*') return { delimiter: '*', marks: { italic: true } };
  return null;
}

function applyInlineMarks(nodes: Descendant[], marks: Partial<FormattedText>): Descendant[] {
  return nodes.map((node) => {
    if (Text.isText(node)) return { ...node, ...marks };
    return { ...node, children: applyInlineMarks(node.children, marks) } as Descendant;
  });
}

function findUnescapedToken(source: string, token: string, fromIndex: number): number {
  let index = source.indexOf(token, fromIndex);
  while (index >= 0) {
    if (!isEscapedAt(source, index)) return index;
    index = source.indexOf(token, index + token.length);
  }
  return -1;
}

function isEscapedAt(source: string, index: number): boolean {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && source[cursor] === '\\'; cursor--) slashCount++;
  return slashCount % 2 === 1;
}

function countRun(source: string, index: number, character: string): number {
  let length = 0;
  while (source[index + length] === character) length++;
  return length;
}

function isMarkdownEscapable(character: string): boolean {
  return /[\\`*_[\]{}()#+\-.!<>|~]/.test(character);
}

function unescapeMarkdown(value: string): string {
  return value.replace(/\\([\\`*_[\]{}()#+\-.!<>|~])/g, '$1');
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const markdownSerializer = { serialize, deserialize };
