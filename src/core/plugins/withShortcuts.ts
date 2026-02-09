import { Editor, Transforms, Range, Element as SlateElement, Point } from 'slate';
import type { BlockType } from '../types';

/**
 * Markdown-style shortcuts mapping.
 * Typing these patterns at the start of a line followed by a space
 * will transform the block.
 */
const SHORTCUTS: Record<string, { type: BlockType; level?: number }> = {
  '#': { type: 'heading', level: 1 },
  '##': { type: 'heading', level: 2 },
  '###': { type: 'heading', level: 3 },
  '####': { type: 'heading', level: 4 },
  '#####': { type: 'heading', level: 5 },
  '######': { type: 'heading', level: 6 },
  '>': { type: 'blockquote' },
  '-': { type: 'bulleted-list' },
  '*': { type: 'bulleted-list' },
  '1.': { type: 'numbered-list' },
  '```': { type: 'code-block' },
};

/**
 * Plugin that converts Markdown-style shortcuts into block elements.
 * e.g. typing "# " at the start of a line creates an h1.
 */
export function withShortcuts(editor: Editor): Editor {
  const { insertText } = editor;

  editor.insertText = (text: string) => {
    const { selection } = editor;

    if (text === ' ' && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (block) {
        const [blockNode, blockPath] = block;
        const start = Editor.start(editor, blockPath);

        // Only process if we're in a plain paragraph
        if (
          SlateElement.isElement(blockNode) &&
          blockNode.type === 'paragraph'
        ) {
          const range = { anchor, focus: start };
          const beforeText = Editor.string(editor, range);
          const shortcut = SHORTCUTS[beforeText];

          if (shortcut) {
            // Delete the shortcut text
            Transforms.select(editor, range);
            Transforms.delete(editor);

            const { type, level } = shortcut;

            if (type === 'heading' && level) {
              Transforms.setNodes(
                editor,
                { type: 'heading', level } as any,
                { at: blockPath }
              );
            } else if (
              type === 'bulleted-list' ||
              type === 'numbered-list'
            ) {
              Transforms.setNodes(
                editor,
                { type: 'list-item' } as any,
                { at: blockPath }
              );
              Transforms.wrapNodes(
                editor,
                { type, children: [] } as any,
                { at: blockPath }
              );
            } else {
              Transforms.setNodes(
                editor,
                { type } as any,
                { at: blockPath }
              );
            }

            return;
          }
        }
      }
    }

    insertText(text);
  };

  return editor;
}
