import { Editor, Element as SlateElement, Range, Transforms } from 'slate';
import { LIST_TYPES, type BlockType } from '../types';

/**
 * Adds conventional Enter behavior to list items.
 *
 * - Enter in a non-empty item delegates to Slate and creates another item.
 * - Enter in an empty top-level item exits the list into a paragraph.
 * - Enter in an empty nested item outdents it by one list level.
 */
export function withLists(editor: Editor): Editor {
  const { insertBreak } = editor;

  editor.insertBreak = () => {
    const { selection } = editor;
    if (!selection || !Range.isCollapsed(selection)) {
      insertBreak();
      return;
    }

    const listItemEntry = Editor.above(editor, {
      at: selection,
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        node.type === 'list-item',
    });

    if (!listItemEntry) {
      insertBreak();
      return;
    }

    const [listItem, listItemPath] = listItemEntry;
    if (!SlateElement.isElement(listItem) || !Editor.isEmpty(editor, listItem)) {
      insertBreak();
      return;
    }

    const listEntry = Editor.above(editor, {
      at: listItemPath,
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        LIST_TYPES.includes(node.type as BlockType),
    });

    if (!listEntry) {
      insertBreak();
      return;
    }

    const [, listPath] = listEntry;
    const isNestedList = Boolean(
      Editor.above(editor, {
        at: listPath,
        match: (node) =>
          !Editor.isEditor(node) &&
          SlateElement.isElement(node) &&
          LIST_TYPES.includes(node.type as BlockType),
      })
    );

    Transforms.unwrapNodes(editor, {
      at: selection,
      match: (node) =>
        !Editor.isEditor(node) &&
        SlateElement.isElement(node) &&
        LIST_TYPES.includes(node.type as BlockType),
      split: true,
    });

    if (!isNestedList) {
      Transforms.setNodes(
        editor,
        { type: 'paragraph' } as any,
        {
          at: editor.selection ?? selection,
          match: (node) =>
            !Editor.isEditor(node) &&
            SlateElement.isElement(node) &&
            node.type === 'list-item',
        }
      );
    }
  };

  return editor;
}
