import { Text, type Descendant, Element as SlateElement } from 'slate';
import type {
  CustomElement,
  FormattedText,
  HeadingElement,
  ImageElement,
  LinkElement,
  CodeBlockElement,
  VariableElement,
  VideoElement,
  TableCellElement,
  TableElement,
  Align,
} from '../core/types';

// ---------------------------------------------------------------------------
// Serialize: Slate JSON -> HTML
// ---------------------------------------------------------------------------

function serializeText(node: FormattedText): string {
  let text = escapeHtml(node.text);
  if (!text && !node.bold && !node.italic && !node.underline && !node.strikethrough && !node.code && !node.fontSize && !node.fontColor) {
    return text;
  }
  if (node.code) text = `<code>${text}</code>`;
  if (node.bold) text = `<strong>${text}</strong>`;
  if (node.italic) text = `<em>${text}</em>`;
  if (node.underline) text = `<u>${text}</u>`;
  if (node.strikethrough) text = `<s>${text}</s>`;

  // Build inline style string for fontSize and fontColor
  const styles: string[] = [];
  if (node.fontSize) styles.push(`font-size:${node.fontSize}px`);
  if (node.fontColor) styles.push(`color:${node.fontColor}`);
  if (styles.length > 0) {
    text = `<span style="${styles.join(';')}">${text}</span>`;
  }

  return text;
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) {
    return serializeText(node as FormattedText);
  }

  const element = node as CustomElement;
  const children = element.children.map(serializeNode).join('');

  switch (element.type) {
    case 'paragraph': {
      const alignStyle = (element as any).align ? ` style="text-align:${(element as any).align}"` : '';
      return `<p${alignStyle}>${children}</p>`;
    }
    case 'heading': {
      const el = element as HeadingElement;
      const alignStyle = el.align ? ` style="text-align:${el.align}"` : '';
      return `<h${el.level}${alignStyle}>${children}</h${el.level}>`;
    }
    case 'blockquote': {
      const alignStyle = (element as any).align ? ` style="text-align:${(element as any).align}"` : '';
      return `<blockquote${alignStyle}>${children}</blockquote>`;
    }
    case 'code-block': {
      const el = element as CodeBlockElement;
      const langAttr = el.language ? ` class="language-${el.language}"` : '';
      return `<pre><code${langAttr}>${children}</code></pre>`;
    }
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'list-item': {
      const alignStyle = (element as any).align ? ` style="text-align:${(element as any).align}"` : '';
      return `<li${alignStyle}>${children}</li>`;
    }
    case 'link': {
      const el = element as LinkElement;
      return `<a href="${escapeHtml(el.url)}">${children}</a>`;
    }
    case 'image': {
      const el = element as ImageElement;
      return `<img src="${escapeHtml(el.url)}" alt="${escapeHtml(el.alt ?? '')}" />`;
    }
    case 'variable': {
      const el = element as VariableElement;
      return `<span data-variable="${escapeHtml(el.name)}">{{${escapeHtml(el.name)}}}</span>`;
    }
    case 'video': {
      const el = element as VideoElement;
      if (el.provider === 'direct') {
        return `<div data-video-provider="${el.provider}" data-video-url="${escapeHtml(el.url)}"><video src="${escapeHtml(el.embedUrl)}" controls></video>${el.caption ? `<p>${escapeHtml(el.caption)}</p>` : ''}</div>`;
      }
      return `<div data-video-provider="${el.provider}" data-video-url="${escapeHtml(el.url)}"><iframe src="${escapeHtml(el.embedUrl)}" frameborder="0" allowfullscreen></iframe>${el.caption ? `<p>${escapeHtml(el.caption)}</p>` : ''}</div>`;
    }
    case 'table': {
      const table = element as TableElement;
      const colWidthsAttr =
        table.colWidths?.length &&
        table.colWidths.every((w) => typeof w === 'number')
          ? ` data-col-widths="${escapeHtml(JSON.stringify(table.colWidths))}"`
          : '';
      return `<table class="rte-table"${colWidthsAttr}><tbody>${children}</tbody></table>`;
    }
    case 'table-row':
      return `<tr>${children}</tr>`;
    case 'table-cell': {
      const cell = element as TableCellElement;
      const tag = cell.header ? 'th' : 'td';
      return `<${tag} class="rte-table-cell">${children}</${tag}>`;
    }
    default:
      return `<p>${children}</p>`;
  }
}

/**
 * Serialize a Slate document (array of Descendants) to an HTML string.
 */
function serialize(value: Descendant[]): string {
  return value.map(serializeNode).join('\n');
}

// ---------------------------------------------------------------------------
// Deserialize: HTML -> Slate JSON
// ---------------------------------------------------------------------------

function deserializeNode(el: Node): Descendant | Descendant[] | null {
  if (el.nodeType === Node.TEXT_NODE) {
    const text = el.textContent ?? '';
    return { text };
  }

  if (el.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const htmlEl = el as HTMLElement;
  let children = Array.from(htmlEl.childNodes)
    .map(deserializeNode)
    .flat()
    .filter((n): n is Descendant => n !== null);

  if (children.length === 0) {
    children = [{ text: '' }];
  }

  const blockAlign = (): Align | undefined => {
    const styleStr = htmlEl.getAttribute('style') ?? '';
    const v = parseTextAlignFromStyle(styleStr);
    return v ?? undefined;
  };

  switch (htmlEl.nodeName) {
    case 'BODY':
      return children;
    case 'P': {
      const align = blockAlign();
      return { type: 'paragraph', children, ...(align && { align }) };
    }
    case 'H1': {
      const align = blockAlign();
      return { type: 'heading', level: 1, children, ...(align && { align }) };
    }
    case 'H2': {
      const align = blockAlign();
      return { type: 'heading', level: 2, children, ...(align && { align }) };
    }
    case 'H3': {
      const align = blockAlign();
      return { type: 'heading', level: 3, children, ...(align && { align }) };
    }
    case 'H4': {
      const align = blockAlign();
      return { type: 'heading', level: 4, children, ...(align && { align }) };
    }
    case 'H5': {
      const align = blockAlign();
      return { type: 'heading', level: 5, children, ...(align && { align }) };
    }
    case 'H6': {
      const align = blockAlign();
      return { type: 'heading', level: 6, children, ...(align && { align }) };
    }
    case 'BLOCKQUOTE': {
      const align = blockAlign();
      return { type: 'blockquote', children, ...(align && { align }) };
    }
    case 'PRE':
      return { type: 'code-block', children: [{ text: htmlEl.textContent ?? '' }] };
    case 'UL':
      return { type: 'bulleted-list', children };
    case 'OL':
      return { type: 'numbered-list', children };
    case 'LI': {
      const align = blockAlign();
      return { type: 'list-item', children, ...(align && { align }) };
    }
    case 'TABLE': {
      const colWidthsRaw = htmlEl.getAttribute('data-col-widths');
      let colWidths: number[] | undefined;
      if (colWidthsRaw) {
        try {
          const parsed = JSON.parse(colWidthsRaw) as unknown;
          if (Array.isArray(parsed) && parsed.every((w) => typeof w === 'number')) {
            colWidths = parsed;
          }
        } catch {
          /* ignore */
        }
      }
      return { type: 'table', children, ...(colWidths && { colWidths }) };
    }
    case 'TBODY':
      return children;
    case 'TR':
      return { type: 'table-row', children };
    case 'TD': {
      const cellChildren: Descendant[] = children.length === 0 ? [{ type: 'paragraph', children: [{ text: '' }] }] : children;
      return { type: 'table-cell', children: cellChildren } as Descendant;
    }
    case 'TH': {
      const thChildren: Descendant[] = children.length === 0 ? [{ type: 'paragraph', children: [{ text: '' }] }] : children;
      return { type: 'table-cell', header: true, children: thChildren } as Descendant;
    }
    case 'A': {
      const url = htmlEl.getAttribute('href') ?? '';
      return { type: 'link', url, children };
    }
    case 'IMG': {
      const src = htmlEl.getAttribute('src') ?? '';
      const alt = htmlEl.getAttribute('alt') ?? '';
      return { type: 'image', url: src, alt, children: [{ text: '' as const }] } as any;
    }
    case 'STRONG':
    case 'B':
      return children.map((child) =>
        Text.isText(child) ? { ...child, bold: true } : child
      );
    case 'EM':
    case 'I':
      return children.map((child) =>
        Text.isText(child) ? { ...child, italic: true } : child
      );
    case 'U':
      return children.map((child) =>
        Text.isText(child) ? { ...child, underline: true } : child
      );
    case 'S':
    case 'DEL':
    case 'STRIKE':
      return children.map((child) =>
        Text.isText(child) ? { ...child, strikethrough: true } : child
      );
    case 'CODE':
      return children.map((child) =>
        Text.isText(child) ? { ...child, code: true } : child
      );
    case 'BR':
      return { text: '\n' };
    case 'DIV': {
      // Check for video element
      const videoProvider = htmlEl.getAttribute('data-video-provider');
      const videoUrl = htmlEl.getAttribute('data-video-url');
      if (videoProvider && videoUrl) {
        const iframe = htmlEl.querySelector('iframe');
        const video = htmlEl.querySelector('video');
        const embedUrl = iframe?.getAttribute('src') ?? video?.getAttribute('src') ?? videoUrl;
        const captionEl = htmlEl.querySelector('p');
        const caption = captionEl?.textContent ?? '';
        return {
          type: 'video',
          url: videoUrl,
          embedUrl,
          provider: videoProvider,
          caption,
          children: [{ text: '' as const }],
        } as any;
      }
      return children.length === 1 ? children[0] : children;
    }
    case 'SPAN': {
      // Check for variable element
      const varName = htmlEl.getAttribute('data-variable');
      if (varName) {
        return { type: 'variable', name: varName, children: [{ text: '' as const }] } as any;
      }

      // Check for inline styles (font-size, color)
      const styleStr = htmlEl.getAttribute('style') ?? '';
      const fontSize = parseFontSizeFromStyle(styleStr);
      const fontColor = parseFontColorFromStyle(styleStr);
      if (fontSize || fontColor) {
        return children.map((child) => {
          if (!Text.isText(child)) return child;
          const marks: Record<string, any> = {};
          if (fontSize) marks.fontSize = fontSize;
          if (fontColor) marks.fontColor = fontColor;
          return { ...child, ...marks };
        });
      }
      // Transparent wrapper
      return children.length === 1 ? children[0] : children;
    }
    default:
      return children;
  }
}

/**
 * Deserialize an HTML string to Slate JSON.
 */
function deserialize(html: string): Descendant[] {
  const defaultDoc: Descendant[] = [{ type: 'paragraph', children: [{ text: '' }] }];

  if (!html.trim()) return defaultDoc;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const result = deserializeNode(doc.body);

  if (Array.isArray(result)) {
    const elements = result.length > 0 ? result : defaultDoc;
    // Ensure top-level nodes are elements, wrap bare text nodes in paragraphs
    return elements.map((node) =>
      Text.isText(node)
        ? { type: 'paragraph' as const, children: [node] }
        : node
    );
  }
  if (result) {
    return Text.isText(result)
      ? [{ type: 'paragraph', children: [result] }]
      : [result];
  }
  return defaultDoc;
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

/**
 * Extract a font-size pixel value from an inline style string.
 * Returns the numeric px value or null.
 */
function parseFontSizeFromStyle(style: string): number | null {
  const match = style.match(/font-size:\s*(\d+(?:\.\d+)?)px/);
  return match ? Math.round(parseFloat(match[1])) : null;
}

/**
 * Extract text-align from an inline style string.
 * Returns a valid Align value or null.
 */
function parseTextAlignFromStyle(style: string): Align | null {
  const match = style.match(/(?:^|;)\s*text-align:\s*(\w+)/);
  if (!match) return null;
  const v = match[1].toLowerCase();
  if (v === 'left' || v === 'center' || v === 'right' || v === 'justify') return v;
  return null;
}

/**
 * Extract a color value from an inline style string.
 * Matches `color: #hex` or `color: rgb(...)` etc.
 */
function parseFontColorFromStyle(style: string): string | null {
  // Match `color:` but not `background-color:` or `border-color:`
  const match = style.match(/(?:^|;)\s*color:\s*([^;]+)/);
  return match ? match[1].trim() : null;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const htmlSerializer = { serialize, deserialize };
