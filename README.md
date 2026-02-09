# fc-react-rich-editor

A full-featured, customizable rich text editor for React with TypeScript support. Built on [Slate.js](https://docs.slatejs.org/).

## Features

- **TypeScript-first** – Full type safety and Slate module augmentation
- **Ready-to-use UI** – Toolbar, hovering toolbar, right-click context menu (slash menu)
- **Blocks & formatting** – Paragraphs, headings, blockquote, code block, bulleted/numbered lists, text alignment
- **Marks** – Bold, italic, underline, strikethrough, inline code, font size, font color
- **Images** – Insert by URL or upload (via callback), resize (drag corner), align left/center/right
- **Tables** – Insert 2–6 columns, resizable columns, add/remove rows and columns, Tab navigation
- **Media** – Links, variables (`{{name}}`), video embeds (YouTube, Vimeo, etc.)
- **Custom commands** – Add your own context menu items (e.g. “Insert callout”) without writing a plugin
- **Plugins** – Extend the Slate editor with custom behavior
- **Theming** – CSS custom properties; override fonts, colors, radii
- **Serialization** – HTML and Markdown serialize/deserialize
- **Headless** – Use the `useRichTextEditor` hook for full control over rendering

## Installation

```bash
npm install fc-react-rich-editor
```

**Peer dependencies:** React 18+ and React DOM.

## Quick start

```tsx
import { useState } from 'react';
import { RichTextEditor } from 'fc-react-rich-editor';

function App() {
  const [value, setValue] = useState([
    { type: 'paragraph', children: [{ text: 'Hello, World!' }] },
  ]);

  return (
    <RichTextEditor
      value={value}
      onChange={setValue}
      placeholder="Start writing..."
    />
  );
}
```

Styles are included with the component. For headless usage or custom CSS entry, import explicitly:

```tsx
import 'fc-react-rich-editor/styles.css';
```

## Usage

### Basic props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `Descendant[]` | Controlled editor value (Slate JSON) |
| `defaultValue` | `Descendant[]` | Uncontrolled initial value |
| `onChange` | `(value: Descendant[]) => void` | Called when content changes |
| `placeholder` | `string` | Placeholder text |
| `readOnly` | `boolean` | Read-only mode |
| `autoFocus` | `boolean` | Focus editor on mount |
| `minHeight` | `number \| string` | Min height of the editable area (e.g. `200` or `"20rem"`) |
| `className` / `style` | — | Root container class and style |
| `editorClassName` | `string` | Class on the editable area |

### Images: upload, resize, align

**Insert by URL** – Use the toolbar image button or context menu; paste an image URL.

**Insert by upload** – Provide `onImageUpload`. The editor will show an “Upload” option; your callback uploads the file and returns the image URL.

```tsx
<RichTextEditor
  value={value}
  onChange={setValue}
  onImageUpload={async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const { url } = await res.json();
    return url; // must return the final image URL
  }}
/>
```

**Resize** – Select an image; a resize handle appears at the bottom-right corner. Drag to change width (80px–1200px).

**Align** – When an image is selected, use the alignment bar (left / center / right) below the image.

### Tables

- **Insert** – Toolbar or context menu → “Table” → choose rows (2–10) and columns (2–6).
- **Resize columns** – Drag the column borders in the table header.
- **Add/remove** – Right-click a cell for “Insert row above/below”, “Insert column left/right”, “Delete row/column”, “Delete table”.
- **Navigation** – Tab moves to the next cell; Shift+Tab to the previous cell.

### Video

Use the video button and paste a URL. Supports YouTube, Vimeo, Dailymotion, Loom, Wistia, or direct `.mp4` / `.webm` / `.ogg` links.

### Variables

Pass a list of variable names; users can insert them as chips (e.g. `{{name}}`, `{{email}}`).

```tsx
<RichTextEditor
  value={value}
  onChange={setValue}
  variables={['name', 'email', 'company']}
/>
```

### Slash menu (context menu) and custom commands

Right-click in the editor to open the context menu for inserting blocks and media. You can add **custom commands** (e.g. “Callout”, “Divider”) without writing a plugin:

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

<RichTextEditor
  value={value}
  onChange={setValue}
  slashMenu={slashConfig}
/>
```

### Toolbar and hovering toolbar

- **Toolbar** – `toolbar={true}` (default), `toolbar={false}`, or a [ToolbarConfig](https://github.com/fmchisti/react-rich-text) object with `groups` and `items` (marks, heading select, link, image, video, variable, table, alignment, etc.).
- **Hovering toolbar** – Shown when text is selected. Use `hoveringToolbar={true}` (default), `hoveringToolbar={false}`, or an object to toggle items (bold, italic, link, font color, alignment, etc.) and set `order`.

### Theming

Override theme tokens via the `theme` prop:

```tsx
<RichTextEditor
  theme={{
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    focusRingColor: '#3b82f6',
    borderRadius: '8px',
    toolbarBg: '#f9fafb',
    linkColor: '#2563eb',
    // ... see RichTextTheme in types
  }}
/>
```

### Serialization

```tsx
import {
  htmlSerializer,
  markdownSerializer,
} from 'fc-react-rich-editor';

// Slate value → HTML
const html = htmlSerializer.serialize(value);

// HTML → Slate value
const slateValue = htmlSerializer.deserialize(htmlString);

// Slate value → Markdown
const markdown = markdownSerializer.serialize(value);
```

### Live HTML / Markdown output

You can get HTML or Markdown on every change without calling the serializer yourself:

```tsx
<RichTextEditor
  value={value}
  onChange={setValue}
  onHTMLChange={(html) => console.log(html)}
  onMarkdownChange={(md) => console.log(md)}
/>
```

### Headless mode

Build your own UI around the same editor logic:

```tsx
import { Slate } from 'slate-react';
import { useRichTextEditor } from 'fc-react-rich-editor';

function MyEditor() {
  const { editor, value, onChange, renderElement, renderLeaf } = useRichTextEditor();

  return (
    <Slate editor={editor} value={value} onChange={onChange}>
      <Editable
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Write something..."
      />
    </Slate>
  );
}
```

### Custom renderers

Override how elements or leaves are rendered; return `undefined` to fall back to the default:

```tsx
<RichTextEditor
  renderElement={({ element, attributes, children }) => {
    if (element.type === 'paragraph') {
      return <p {...attributes} className="my-paragraph">{children}</p>;
    }
    return undefined;
  }}
  renderLeaf={({ leaf, attributes, children }) => {
    if (leaf.bold) {
      return <strong {...attributes}>{children}</strong>;
    }
    return undefined;
  }}
/>
```

### Plugins

Pass an array of **editor plugins** to extend Slate behavior (e.g. custom `insertData`, `isVoid`, or new helpers):

```tsx
import type { EditorPlugin } from 'fc-react-rich-editor';

const withMyFeature: EditorPlugin = (editor) => {
  const { insertText } = editor;
  editor.insertText = (text) => {
    // custom logic
    insertText(text);
  };
  return editor;
};

<RichTextEditor plugins={[withMyFeature]} value={value} onChange={setValue} />
```

See **[docs/PLUGINS.md](docs/PLUGINS.md)** for the full plugin guide and **[docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md)** for extending the editor with new features.

## Adding more features

You can extend the editor in several ways without forking the package:

| Goal | How |
|------|-----|
| New context menu items | Use `slashMenu.customCommands` and `onContextMenuCommand`. See [Custom commands](#slash-menu-context-menu-and-custom-commands) above and [docs/PLUGINS.md](docs/PLUGINS.md#9-adding-custom-context-menu-items-no-plugin-needed). |
| New Slate behavior / node types | Write an **editor plugin** and pass it in `plugins`. See [docs/PLUGINS.md](docs/PLUGINS.md). |
| Custom block or inline rendering | Use `renderElement` (and optionally a plugin for `isVoid` / normalization). See [docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md). |
| Custom toolbar / hovering toolbar | Use `toolbar` and `hoveringToolbar` config objects. |
| New theme | Use the `theme` prop. |

For a short “how to add features” guide, see **[docs/ADDING_FEATURES.md](docs/ADDING_FEATURES.md)**.

## Exports

The package exports the main component, hooks, serializers, types, and Slate utilities so you don’t need to install `slate` for basic use:

- **Components:** `RichTextEditor`, `ThemeProvider`
- **Hooks:** `useRichTextEditor`
- **Serializers:** `htmlSerializer`, `markdownSerializer`
- **Utils:** `createRichTextEditor`, `getBlockAlign`, `setBlockAlign`, `Transforms` (re-export from Slate)
- **Types:** `Descendant`, `RichTextEditorProps`, `EditorPlugin`, `CustomElement`, `ImageElement`, `ImageAlign`, `ToolbarConfig`, `SlashMenuConfig`, `CustomContextMenuCommand`, etc.

## Author

**Fahim Mahmud Chisti**

- GitHub: [@fmchisti](https://github.com/fmchisti)
- Website: [fahimcode.com](https://fahimcode.com/)

## License

MIT
