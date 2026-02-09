import { Editor } from 'slate';
import type { MarkType } from '../types';

/**
 * Check whether a mark is currently active at the selection.
 */
export function isMarkActive(editor: Editor, mark: MarkType): boolean {
  const marks = Editor.marks(editor);
  return marks ? marks[mark] === true : false;
}

/**
 * Toggle a mark on or off at the current selection.
 */
export function toggleMark(editor: Editor, mark: MarkType): void {
  const isActive = isMarkActive(editor, mark);
  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
}
