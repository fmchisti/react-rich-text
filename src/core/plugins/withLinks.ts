import { Editor, Transforms, Range, Element as SlateElement } from 'slate';

/**
 * Plugin that provides link insertion / removal helpers.
 */
export function withLinks(editor: Editor): Editor {
  const { insertData, insertText } = editor;

  /**
   * Auto-detect pasted URLs and wrap them in link elements.
   */
  editor.insertData = (data: DataTransfer) => {
    const text = data.getData('text/plain');

    if (text && isUrl(text)) {
      if (editor.selection && !Range.isCollapsed(editor.selection)) {
        // Wrap selected text in a link
        wrapLink(editor, text);
      } else {
        // Insert a link node with the URL as text
        insertLink(editor, text, text);
      }
    } else {
      insertData(data);
    }
  };

  /**
   * Auto-detect typed URLs ending with space.
   */
  editor.insertText = (text: string) => {
    if (text === ' ') {
      const { selection } = editor;
      if (selection && Range.isCollapsed(selection)) {
        const [start] = Range.edges(selection);
        const wordBefore = Editor.before(editor, start, { unit: 'word' });
        if (wordBefore) {
          const range = Editor.range(editor, wordBefore, start);
          const beforeText = Editor.string(editor, range);
          if (isUrl(beforeText)) {
            Transforms.select(editor, range);
            wrapLink(editor, beforeText);
            Transforms.collapse(editor, { edge: 'end' });
          }
        }
      }
    }
    insertText(text);
  };

  return editor;
}

/**
 * Check whether a link is currently active at the selection.
 */
export function isLinkActive(editor: Editor): boolean {
  const [link] = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
    })
  );
  return !!link;
}

/**
 * Wrap the current selection in a link element.
 */
export function wrapLink(editor: Editor, url: string): void {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
  }

  const { selection } = editor;
  const isCollapsed = selection && Range.isCollapsed(selection);

  const link = {
    type: 'link' as const,
    url,
    children: isCollapsed ? [{ text: url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link as any);
  } else {
    Transforms.wrapNodes(editor, link as any, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
}

/**
 * Remove the link element at the current selection.
 */
export function unwrapLink(editor: Editor): void {
  Transforms.unwrapNodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === 'link',
  });
}

/**
 * Insert a new link with specified text and URL.
 */
export function insertLink(editor: Editor, url: string, text?: string): void {
  if (editor.selection) {
    wrapLink(editor, url);
  } else {
    Transforms.insertNodes(editor, {
      type: 'link',
      url,
      children: [{ text: text ?? url }],
    } as any);
  }
}

/**
 * Simple URL detection.
 */
function isUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}
