import { createEditor as slateCreateEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withInlines } from './plugins/withInlines';
import { withImages } from './plugins/withImages';
import { withLinks } from './plugins/withLinks';
import { withShortcuts } from './plugins/withShortcuts';
import { withVariables } from './plugins/withVariables';
import type { EditorPlugin, RichTextEditor } from './types';

/**
 * Create a fully-configured rich text editor instance.
 *
 * Built-in plugin application order:
 * 1. withReact     - React rendering integration
 * 2. withHistory   - Undo/redo support
 * 3. withInlines   - Inline element types (links, variables)
 * 4. withImages    - Void image elements + paste support
 * 5. withLinks     - Auto-link detection on paste/type
 * 6. withVariables - Inline variable elements + {{...}} auto-detection
 * 7. withShortcuts - Markdown-style shortcuts
 * 8. ...userPlugins - Any additional user-supplied plugins
 *
 * @param plugins - Additional editor plugins to apply after built-ins
 * @returns A configured Slate editor instance
 */
export function createRichTextEditor(
  plugins: EditorPlugin[] = []
): RichTextEditor {
  let editor = withShortcuts(
    withVariables(
      withLinks(
        withImages(
          withInlines(
            withHistory(
              withReact(slateCreateEditor())
            )
          )
        )
      )
    )
  ) as RichTextEditor;

  // Apply user-supplied plugins last so they can override anything
  for (const plugin of plugins) {
    editor = plugin(editor);
  }

  return editor;
}
