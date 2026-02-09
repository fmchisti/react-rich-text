import { Editor, Transforms, Range, Point, Element as SlateElement } from 'slate';

/**
 * Plugin that enables inline variable elements.
 *
 * Features:
 * - Auto-detects `{{variableName}}` patterns as the user types
 *   and converts them into variable elements.
 * - Ensures variable elements are treated as inline voids.
 */
export function withVariables(editor: Editor): Editor {
  const { insertText, isInline, isVoid } = editor;

  // Variables are inline void elements (like mentions)
  editor.isInline = (element) => {
    return SlateElement.isElement(element) && element.type === 'variable'
      ? true
      : isInline(element);
  };

  editor.isVoid = (element) => {
    return SlateElement.isElement(element) && element.type === 'variable'
      ? true
      : isVoid(element);
  };

  /**
   * Auto-detect `{{name}}` patterns when the user types `}}`.
   */
  editor.insertText = (text: string) => {
    if (text === '}') {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const { anchor } = selection;
        const block = Editor.above(editor, {
          match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        });

        if (block) {
          const [, blockPath] = block;
          const blockStart = Editor.start(editor, blockPath);

          // Get all text from block start to cursor
          const range = { anchor, focus: blockStart };
          const beforeText = Editor.string(editor, range);
          const fullText = beforeText + '}';

          // Look for the pattern {{...}} at the end
          const match = fullText.match(/\{\{([a-zA-Z_][\w.]*)\}$/);

          if (match) {
            const varName = match[1];
            const matchLength = match[0].length + 1; // +1 for the closing }

            // Calculate start point of the match
            const startOffset = anchor.offset - (matchLength - 2); // -2 because we haven't inserted `}` yet
            // We need to go back from the anchor by (beforeText match length)
            const textBeforeMatch = beforeText.slice(0, -(matchLength - 1));

            // Find the position of `{{` in the current text node
            const matchStart = fullText.lastIndexOf('{{' + varName + '}');
            if (matchStart >= 0) {
              // Delete the `{{name}` text and the `}` we're about to type
              const deleteStart = Editor.before(editor, anchor, {
                distance: matchLength - 1,
                unit: 'character',
              });

              if (deleteStart) {
                // First insert the closing `}` so the full pattern exists
                insertText(text);

                // Now select the entire `{{name}}` pattern
                const newAnchor = editor.selection?.anchor;
                if (newAnchor) {
                  const patternStart = Editor.before(editor, newAnchor, {
                    distance: matchLength,
                    unit: 'character',
                  });

                  if (patternStart) {
                    Transforms.select(editor, {
                      anchor: patternStart,
                      focus: newAnchor,
                    });
                    Transforms.delete(editor);

                    // Insert the variable element
                    insertVariable(editor, varName);
                    return;
                  }
                }
              }
            }
          }
        }
      }
    }

    insertText(text);
  };

  return editor;
}

/**
 * Insert a variable element at the current selection.
 *
 * @param editor - The Slate editor instance
 * @param name - The variable name (without braces), e.g. "name", "email"
 */
export function insertVariable(editor: Editor, name: string): void {
  const variable = {
    type: 'variable' as const,
    name,
    children: [{ text: '' as const }],
  };

  Transforms.insertNodes(editor, variable as any);
  Transforms.move(editor);
}
