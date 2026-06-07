import type { BaseRange, Editor } from 'slate';
import { Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

/** Deep-clone a Slate range for later restoration. */
export function cloneRange(selection: BaseRange | null): BaseRange | null {
  if (!selection) return null;
  return {
    anchor: { path: [...selection.anchor.path], offset: selection.anchor.offset },
    focus: { path: [...selection.focus.path], offset: selection.focus.offset },
  };
}

/** Restore a previously saved selection and focus the editor. */
export function restoreSelection(editor: Editor, selection: BaseRange | null): boolean {
  if (!selection) return false;
  try {
    Transforms.select(editor, selection);
    ReactEditor.focus(editor);
    return true;
  } catch {
    return false;
  }
}
