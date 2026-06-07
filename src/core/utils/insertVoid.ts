import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { Editor as SlateEditor } from 'slate';

const NO_TRAILING_PARAGRAPH = new Set([
  'list-item',
  'blockquote',
  'table',
  'table-row',
  'table-cell',
]);

/**
 * Whether a trailing empty paragraph should be inserted after a void block.
 * Skips list items, blockquotes, and table structures where an extra block breaks layout.
 */
export function shouldInsertTrailingParagraph(editor: SlateEditor): boolean {
  const { selection } = editor;
  if (!selection) return true;

  for (const [node] of Editor.levels(editor, { at: selection })) {
    if (SlateElement.isElement(node) && NO_TRAILING_PARAGRAPH.has(node.type as string)) {
      return false;
    }
  }
  return true;
}

/** Insert an empty paragraph after the current block so the user can keep typing. */
export function insertTrailingParagraph(editor: SlateEditor): void {
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  } as any);
}
