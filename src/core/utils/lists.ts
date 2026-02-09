import { Editor, Transforms, Element as SlateElement, Path, Node } from 'slate';
import { LIST_TYPES, type BlockType } from '../types';

/**
 * Indent the current list item (increase nesting depth).
 */
export function indentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection) return;

  const [listItemEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
    })
  );

  if (!listItemEntry) return;

  const [, listItemPath] = listItemEntry;

  // Find the parent list
  const parentEntry = Editor.parent(editor, listItemPath);
  if (!parentEntry) return;

  const [parentNode] = parentEntry;
  if (!SlateElement.isElement(parentNode)) return;

  const parentType = parentNode.type as BlockType;
  if (!LIST_TYPES.includes(parentType)) return;

  // Wrap the current list item in a new sub-list of the same type
  Transforms.wrapNodes(
    editor,
    { type: parentType, children: [] } as any,
    { at: listItemPath }
  );
}

/**
 * Outdent the current list item (decrease nesting depth).
 */
export function outdentListItem(editor: Editor): void {
  const { selection } = editor;
  if (!selection) return;

  const [listItemEntry] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'list-item',
    })
  );

  if (!listItemEntry) return;

  const [, listItemPath] = listItemEntry;

  // Check if we're in a nested list (grandparent is also a list)
  if (listItemPath.length < 2) return;

  const parentPath = Path.parent(listItemPath);
  const parentNode = Node.get(editor, parentPath);

  if (!SlateElement.isElement(parentNode)) return;
  if (!LIST_TYPES.includes(parentNode.type as BlockType)) return;

  // Check grandparent is also a list item (nested)
  const grandParentPath = Path.parent(parentPath);
  if (grandParentPath.length < 1) return;

  const grandParentNode = Node.get(editor, grandParentPath);
  if (!SlateElement.isElement(grandParentNode)) return;

  // Lift the node out of its parent list
  Transforms.liftNodes(editor, { at: listItemPath });
}
