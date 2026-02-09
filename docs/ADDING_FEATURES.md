# Adding More Features

This guide shows how to extend **fc-react-rich-editor** with custom behavior and UI without forking the package.

---

## 1. Custom context menu items (e.g. “Callout”, “Divider”)

**No plugin required.** Use the slash menu config.

1. Add entries to **`slashMenu.customCommands`** with a unique `id`, `label`, optional `description`, `category`, `keywords`, and `action: { type: 'custom', customId: 'your-id' }`.
2. In **`slashMenu.onContextMenuCommand(customId, editor)`**, handle `customId` and use the `editor` to insert nodes or run transforms.

**Example:** Insert a callout block when the user chooses “Callout” from the right-click menu.

```tsx
import { Transforms } from 'fc-react-rich-editor';
import type { CustomContextMenuCommand, SlashMenuConfig } from 'fc-react-rich-editor';

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

const slashConfig: SlashMenuConfig = {
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

<RichTextEditor value={value} onChange={setValue} slashMenu={slashConfig} />
```

Custom commands are merged with built-in ones and are searchable in the context menu. Use `category`: `'text' | 'list' | 'media' | 'insert' | 'custom'` for grouping.

---

## 2. Custom Slate behavior (plugins)

To change **editor behavior** (e.g. paste handling, void elements, normalization), write an **editor plugin** and pass it via the `plugins` prop.

- **Signature:** `(editor: RichTextEditor) => RichTextEditor`
- **Type:** `import type { EditorPlugin } from 'fc-react-rich-editor'`
- Plugins run **after** all built-in plugins. You can override `insertData`, `isVoid`, `isInline`, `insertText`, etc.

**Example:** Replace “…” with “...” on insert.

```tsx
import type { EditorPlugin } from 'fc-react-rich-editor';

const withEllipsis: EditorPlugin = (editor) => {
  const { insertText } = editor;
  editor.insertText = (text) => {
    insertText(text === '…' ? '...' : text);
  };
  return editor;
};

<RichTextEditor plugins={[withEllipsis]} value={value} onChange={setValue} />
```

Full details and examples: **[PLUGINS.md](PLUGINS.md)**.

---

## 3. New element types (custom blocks or inlines)

To add a **new node type** (e.g. a custom “callout” or “embed” block):

1. **Define the shape** in your app (e.g. `type: 'callout'`, `children`, and any custom fields). If you use the package’s `CustomElement` union, you’ll need to extend it via module augmentation or use your own element type.
2. **Register behavior** with a plugin if needed (e.g. mark the node as void with `editor.isVoid`).
3. **Render it** with `renderElement`. Return your JSX for your type; return `undefined` to fall back to the default renderer.
4. **Serialization** – If you use the built-in HTML/Markdown serializers, extend them or provide your own so the new type is serialized/deserialized correctly.

**Example:** A simple callout block (no plugin if it’s not void).

```tsx
<RichTextEditor
  renderElement={({ element, attributes, children }) => {
    if (element.type === 'callout') {
      return (
        <div {...attributes} style={{ borderLeft: '4px solid #3b82f6', paddingLeft: 12, margin: '8px 0' }}>
          {children}
        </div>
      );
    }
    return undefined;
  }}
/>
```

If the block is **void** (no editable text inside), use a plugin to mark it:

```tsx
const withCallout: EditorPlugin = (editor) => {
  const { isVoid } = editor;
  editor.isVoid = (el) => (el.type === 'callout' ? true : isVoid(el));
  return editor;
};
```

Then insert it with `Transforms.insertNodes(editor, { type: 'callout', children: [{ text: '' }] })` (and any extra fields).

---

## 4. Custom toolbar and hovering toolbar

- **Toolbar** – Set `toolbar` to an object with `groups` and `items`. Each item can be `{ type: 'mark', mark: 'bold' }`, `{ type: 'heading-select' }`, `{ type: 'link' }`, `{ type: 'image' }`, `{ type: 'video' }`, `{ type: 'variable' }`, `{ type: 'table' }`, `{ type: 'align', align: 'left' }`, etc. Use `type: 'divider'` for a separator.
- **Hovering toolbar** – Set `hoveringToolbar` to an object and toggle which items appear (`bold`, `italic`, `link`, `fontColor`, `alignLeft`, etc.) and set `order` to control order and visibility.

This lets you add, remove, or reorder buttons without writing new components.

---

## 5. Theming

Use the **`theme`** prop to override any token (e.g. `fontFamily`, `fontSize`, `focusRingColor`, `toolbarBg`, `linkColor`, `borderRadius`). All theme keys are listed on `RichTextTheme` in the package types. No extra CSS is required unless you want to add your own.

---

## 6. Image upload

Implement **`onImageUpload`**: the editor calls it with the selected `File` and expects a **Promise&lt;string&gt;** (the image URL). Upload the file in your handler (e.g. to your server or S3) and return the URL. The editor will insert the image with that URL.

---

## 7. Custom HTML / Markdown

The built-in serializers only know about the built-in element types. For **custom types** you can:

- **Wrap the serializers** – Call the built-in serializer, then post-process the string to inject or replace markup for your types.
- **Fork or extend** – Copy the serializer source and add cases for your types, or pass a custom serialize function if the API supports it in the future.

---

## Summary

| What you want | Where to look |
|---------------|----------------|
| New right-click menu items | `slashMenu.customCommands` + `onContextMenuCommand` |
| New editor behavior | Editor **plugins** → [PLUGINS.md](PLUGINS.md) |
| New block/inline type | **Plugin** (if void) + **renderElement** (+ serialization if needed) |
| Change toolbar / hovering toolbar | `toolbar` and `hoveringToolbar` config |
| Change look | `theme` prop |
| Image upload | `onImageUpload` prop |

For plugin details and built-in plugin list, see **[PLUGINS.md](PLUGINS.md)**.
