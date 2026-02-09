import { Editor, Transforms, Element as SlateElement } from 'slate';
import { VOID_TYPES, type BlockType } from '../types';

/**
 * Plugin that handles image void elements.
 * - Marks image elements as void (not editable inline).
 * - Provides an `insertImage` command on the editor.
 */
export function withImages(editor: Editor): Editor {
  const { isVoid, insertData } = editor;

  editor.isVoid = (element) => {
    return SlateElement.isElement(element) &&
      VOID_TYPES.includes(element.type as BlockType)
      ? true
      : isVoid(element);
  };

  /**
   * Handle pasted images from clipboard.
   */
  editor.insertData = (data: DataTransfer) => {
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
          const url = reader.result as string;
          insertImage(editor, url);
        });
        reader.readAsDataURL(file);
      }
    } else {
      // Check for pasted image URL
      const text = data.getData('text/plain');
      if (text && isImageUrl(text)) {
        insertImage(editor, text);
      } else {
        insertData(data);
      }
    }
  };

  return editor;
}

/**
 * Insert an image element at the current selection.
 */
export function insertImage(editor: Editor, url: string, alt?: string): void {
  const image = {
    type: 'image' as const,
    url,
    alt: alt ?? '',
    children: [{ text: '' as const }],
  };
  Transforms.insertNodes(editor, image as any);
  // Insert a paragraph after so the cursor has somewhere to go
  Transforms.insertNodes(editor, {
    type: 'paragraph',
    children: [{ text: '' }],
  } as any);
}

/**
 * Simple check if a string looks like an image URL.
 */
function isImageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return /\.(png|jpe?g|gif|svg|webp|bmp|ico)(\?.*)?$/i.test(parsed.pathname);
  } catch {
    return false;
  }
}
