import { Text, type Descendant } from 'slate';
import type { CustomElement } from '../core/types';

/**
 * Serialize a Slate document to plain text.
 * This is a lossy conversion -- all formatting information is discarded.
 */
function serialize(value: Descendant[]): string {
  return value.map(serializeNode).join('\n').trim();
}

function serializeNode(node: Descendant): string {
  if (Text.isText(node)) {
    return node.text;
  }

  const element = node as CustomElement;
  const children = element.children.map(serializeNode).join('');

  switch (element.type) {
    case 'paragraph':
    case 'heading':
    case 'blockquote':
    case 'code-block':
      return children + '\n';

    case 'bulleted-list':
    case 'numbered-list':
      return children;

    case 'list-item':
      return '  ' + children + '\n';

    case 'image':
      return `[Image: ${element.alt ?? element.url}]\n`;

    case 'link':
      return children;

    case 'variable':
      return `{{${element.name}}}`;

    case 'video':
      return `[Video: ${element.url}]\n`;

    default:
      return children;
  }
}

export const plaintextSerializer = { serialize };
