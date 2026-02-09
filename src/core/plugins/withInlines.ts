import { Editor, Element as SlateElement } from 'slate';
import { INLINE_TYPES, type BlockType } from '../types';

/**
 * Plugin that teaches the editor which element types are inline.
 * Without this, elements like `link` would be treated as blocks.
 */
export function withInlines(editor: Editor): Editor {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return SlateElement.isElement(element) &&
      INLINE_TYPES.includes(element.type as BlockType)
      ? true
      : isInline(element);
  };

  return editor;
}
