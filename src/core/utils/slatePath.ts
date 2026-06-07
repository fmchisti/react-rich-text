import type { Editor, Node } from 'slate';
import { ReactEditor } from 'slate-react';

/** Find a node's path, returning null if the node is detached (findPath throws). */
export function safeFindPath(editor: Editor, node: Node): number[] | null {
  try {
    return ReactEditor.findPath(editor, node);
  } catch {
    return null;
  }
}
