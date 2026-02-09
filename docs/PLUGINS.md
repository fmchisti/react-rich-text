# Writing Plugins

The editor **accepts custom plugins** via the `plugins` prop. Plugins are applied when the editor is created (at mount), after all built-in plugins, so you can override or extend any behavior.

---

## 1. Passing plugins

### With `<RichTextEditor>`

```tsx
import { RichTextEditor, type EditorPlugin } from 'fc-react-rich-editor';

const withMyPlugin: EditorPlugin = (editor) => {
  // extend or override editor methods
  return editor;
};

<RichTextEditor
  value={value}
  onChange={setValue}
  plugins={[withMyPlugin]}
/>
```

### With headless `useRichTextEditor`

```tsx
import { useRichTextEditor, type EditorPlugin } from 'fc-react-rich-editor';

const { editor, ...rest } = useRichTextEditor({
  plugins: [withMyPlugin],
});
```

**Important:** The editor is created once (in `useMemo` with empty deps). The `plugins` array is only used at mount; changing `plugins` later will not re-apply or replace the editor. Keep the same plugin list for the lifetime of the component, or remount the editor when plugins change.

---

## 2. Plugin type

From the package types:

```ts
import type { RichTextEditor } from 'fc-react-rich-editor';

export type EditorPlugin = (editor: RichTextEditor) => RichTextEditor;
```

- **Argument:** The current editor (after all previous plugins have been applied).
- **Return:** The same or a new editor instance. Usually you mutate the editor and return it.

---

## 3. How plugins are applied

In `createRichTextEditor(plugins)`:

1. Built-in plugins run first (in order):  
   `withReact` → `withHistory` → `withInlines` → `withImages` → `withLinks` → `withVariables` → `withShortcuts`
2. Your `plugins` run after, in array order:  
   `editor = plugin(editor)` for each plugin.

So your plugin receives the fully wired editor and can override any method or add new ones.

---

## 4. Minimal plugin example

Override or wrap an editor method, then return the editor:

```ts
import type { EditorPlugin } from 'fc-react-rich-editor';

const withNoOp: EditorPlugin = (editor) => {
  return editor;
};
```

---

## 5. Overriding editor behavior

A common pattern is to wrap an existing method and call it when appropriate:

```ts
import type { EditorPlugin } from 'fc-react-rich-editor';

const withCustomInsertText: EditorPlugin = (editor) => {
  const { insertText } = editor;

  editor.insertText = (text: string) => {
    // Custom logic (e.g. transform input, block in certain cases)
    if (text === '…') {
      editor.insertText('...');
      return;
    }
    insertText(text);
  };

  return editor;
};
```

You can override `insertData`, `isInline`, `isVoid`, `normalizeNode`, etc. See [Slate’s Editor interface](https://docs.slatejs.org/api/nodes/editor) and the built-in plugins in `src/core/plugins/` for examples.

---

## 6. Adding a new element type (e.g. custom block)

Plugins only change **editor behavior**. To add a **new element type** you also need:

1. **Extend types** (in your app or in a shared types file that augments Slate’s `CustomTypes`):
   - Add your element type to your document model (e.g. `type: 'my-block'`).
   - If you use the package’s `CustomElement`, you’d extend that union or use your own.

2. **Register in the editor** (so the editor knows how to treat it):
   - Use a plugin if the new type needs special behavior (e.g. `isVoid`, `isInline`, normalization).
   - Example: mark the node as void so it doesn’t allow inline editing:
   ```ts
   const withMyBlock: EditorPlugin = (editor) => {
     const { isVoid } = editor;
     editor.isVoid = (element) =>
       element.type === 'my-block' ? true : isVoid(element);
     return editor;
   };
   ```

3. **Render it** with `renderElement`:
   ```tsx
   <RichTextEditor
     plugins={[withMyBlock]}
     renderElement={({ element, attributes, children }) => {
       if (element.type === 'my-block') {
         return <div {...attributes}>{children}</div>;
       }
       return undefined; // fall back to default
     }}
   />
   ```

4. **Serialization (optional):** If you use the built-in HTML/Markdown serializers, you’ll need to extend them (or provide your own) so your custom type is serialized and deserialized correctly.

---

## 7. Built-in plugins (reference)

| Plugin         | Role |
|----------------|------|
| `withReact`    | React rendering (Slate React) |
| `withHistory`  | Undo/redo (Slate History) |
| `withInlines`  | Marks link, variable as inline |
| `withImages`   | Void images + paste handling |
| `withLinks`    | Paste/type link detection |
| `withVariables`| Inline variables + `{{…}}` detection |
| `withShortcuts`| Markdown-style shortcuts (#, >, -, etc.) |

Tables and other features are implemented via transforms and components; they do not use a `withTables` editor plugin. You can add a `with*` plugin if you need custom normalization or selection rules for tables.

---

## 8. Testing your plugin

- Use the **playground** (`playground/`) and pass your plugin in `plugins={[withMyPlugin]}`.
- For unit tests, create an editor with `createRichTextEditor([withMyPlugin])` and assert on the editor’s behavior (e.g. `editor.insertText('…')` then check the document).

---

## Summary

| Question | Answer |
|----------|--------|
| Does the editor accept plugins? | **Yes**, via the `plugins` prop on `RichTextEditor` and the `plugins` option of `useRichTextEditor`. |
| When are they applied? | At editor creation (mount). The same editor instance is reused; changing `plugins` later does not re-apply them. |
| What’s the signature? | `(editor: RichTextEditor) => RichTextEditor`. |
| Where do I get the type? | `import type { EditorPlugin } from 'fc-react-rich-editor'`. |

For real examples, see `src/core/plugins/` (e.g. `withShortcuts.ts`, `withInlines.ts`).

---

## 9. Adding custom context menu items (no plugin needed)

Plugins only extend the **Slate editor**; they don’t add UI. To add **new right-click context menu items**, use the **config API** (no plugin).

### API

- **`slashMenu.customCommands`** – array of custom commands.
- **`slashMenu.onContextMenuCommand`** – called when a custom command is chosen: `(customId: string, editor: RichTextEditor) => void`.

### Example

```tsx
import { Transforms } from 'slate';
import {
  RichTextEditor,
  type CustomContextMenuCommand,
  type SlashMenuConfig,
} from 'fc-react-rich-editor';

const customCommands: CustomContextMenuCommand[] = [
  {
    id: 'insert-callout',
    label: 'Callout',
    description: 'Insert a callout box',
    category: 'insert',
    keywords: ['callout', 'box', 'alert'],
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
    action: { type: 'custom', customId: 'insert-callout' },
  },
];

const slashMenuConfig: SlashMenuConfig = {
  enabled: true,
  customCommands,
  onContextMenuCommand(customId, editor) {
    if (customId === 'insert-callout') {
      Transforms.insertNodes(editor, {
        type: 'paragraph',
        children: [{ text: 'Callout content...' }],
      });
    }
  },
};

<RichTextEditor
  value={value}
  onChange={setValue}
  slashMenu={slashMenuConfig}
/>
```

Custom commands are **merged** with the built-in list, filtered by the context menu search, and grouped by `category` (use `category: 'custom'` or any of `'text' | 'list' | 'media' | 'insert' | 'custom'`). You get the **editor** in the callback so you can insert nodes, run transforms, or open modals.
