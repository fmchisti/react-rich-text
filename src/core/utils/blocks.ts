import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { BlockType } from '../types';
import { LIST_TYPES } from '../types';

/**
 * Check whether a block type is currently active at the selection.
 */
export function isBlockActive(
  editor: Editor,
  blockType: BlockType,
  level?: number
): boolean {
  const { selection } = editor;
  if (!selection) return false;

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => {
        if (!SlateElement.isElement(n)) return false;
        if (!Editor.isBlock(editor, n)) return false;
        if (n.type !== blockType) return false;
        if (blockType === 'heading' && level !== undefined) {
          return 'level' in n && n.level === level;
        }
        return true;
      },
    })
  );

  return !!match;
}

/**
 * Toggle a block type at the current selection.
 * For list types, wraps/unwraps the selection.
 * For heading blocks, accepts a level parameter.
 */
export function toggleBlock(
  editor: Editor,
  blockType: BlockType,
  level?: number
): void {
  const isActive = isBlockActive(editor, blockType, level);
  const isList = LIST_TYPES.includes(blockType);

  // Unwrap any existing list wrappers first
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type as BlockType),
    split: true,
  });

  if (isActive) {
    // Deactivate -> revert to paragraph
    Transforms.setNodes(editor, { type: 'paragraph' } as any);
  } else if (isList) {
    // Activate list: set children to list-item then wrap
    Transforms.setNodes(editor, { type: 'list-item' } as any);
    const block = { type: blockType, children: [] } as any;
    Transforms.wrapNodes(editor, block);
  } else if (blockType === 'heading' && level !== undefined) {
    Transforms.setNodes(editor, { type: 'heading', level } as any);
  } else {
    Transforms.setNodes(editor, { type: blockType } as any);
  }
}
