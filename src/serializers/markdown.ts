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

// ---------------------------------------------------------------------------
// Serialize: Slate JSON -> Markdown
// ---------------------------------------------------------------------------

function serializeText(node: FormattedText): string {
  let text = node.text;
  if (!text) return '';

  if (node.code) text = `\`${text}\``;
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
      return `${children}\n\n`;

    case 'heading': {
      const el = element as HeadingElement;
      const hashes = '#'.repeat(el.level);
      return `${hashes} ${children}\n\n`;
    }

    case 'blockquote':
      return children
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n') + '\n\n';

    case 'code-block': {
      const el = element as CodeBlockElement;
      return `\`\`\`${el.language ?? ''}\n${children}\n\`\`\`\n\n`;
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
      return `[${children}](${el.url})`;
    }

    case 'image': {
      const el = element as ImageElement;
      return `![${el.alt ?? ''}](${el.url})\n\n`;
    }

    case 'variable': {
      const el = element as VariableElement;
      return `{{${el.name}}}`;
    }

    case 'video': {
      const el = element as VideoElement;
      const caption = el.caption ? ` "${el.caption}"` : '';
      return `[![Video](${el.embedUrl})](${el.url}${caption})\n\n`;
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
    if (line.startsWith('```')) {
      const language = line.slice(3).trim() || undefined;
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
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

    // Image (standalone line)
    const imgMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imgMatch) {
      result.push({
        type: 'image',
        alt: imgMatch[1],
        url: imgMatch[2],
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
  const nodes: Descendant[] = [];
  // Regex matches: bold, italic, strikethrough, code, links
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`(.+?)`|\[(.+?)\]\((.+?)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      nodes.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      // Bold: **text**
      nodes.push({ text: match[2], bold: true });
    } else if (match[3]) {
      // Italic: *text*
      nodes.push({ text: match[3], italic: true });
    } else if (match[4]) {
      // Strikethrough: ~~text~~
      nodes.push({ text: match[4], strikethrough: true });
    } else if (match[5]) {
      // Code: `text`
      nodes.push({ text: match[5], code: true });
    } else if (match[6] && match[7]) {
      // Link: [text](url)
      nodes.push({
        type: 'link',
        url: match[7],
        children: [{ text: match[6] }],
      } as any);
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining plain text
  if (lastIndex < text.length) {
    nodes.push({ text: text.slice(lastIndex) });
  }

  return nodes.length > 0 ? nodes : [{ text: '' }];
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const markdownSerializer = { serialize, deserialize };
