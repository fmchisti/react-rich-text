# React Rich Text

An advanced, open-source, **100% customizable** rich text editor for React with full TypeScript support. Built on [Slate.js](https://docs.slatejs.org/).

## Features

- **TypeScript-first** - Full type safety with Slate module augmentation
- **Ready-to-use** - Beautiful default UI with toolbar, formatting, and more
- **100% Customizable** - Override any element renderer, leaf renderer, toolbar button, or theme token
- **Plugin System** - Extend the editor with custom Slate plugins
- **Theming** - CSS custom properties for zero-runtime-cost theming
- **Serializers** - Built-in HTML, Markdown, and plain text serialization
- **Headless Mode** - Use the `useRichTextEditor` hook for full control over rendering
- **Lightweight** - No CSS-in-JS runtime, tree-shakeable exports

## Installation

```bash
npm install @richtext/react-rich-text
```

## Quick Start

```tsx
import { RichTextEditor } from '@richtext/react-rich-text';

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

**Styles:** When you use `RichTextEditor`, your bundler will include the editor styles automatically. You do **not** need to import CSS yourself. If you use only headless APIs (e.g. `useRichTextEditor`) or need to load styles in a custom way, you can import them explicitly:

```tsx
import '@richtext/react-rich-text/styles.css';
```

## Customization

### Custom Theme

```tsx
<RichTextEditor
  theme={{
    fontFamily: '"Inter", sans-serif',
    fontSize: '16px',
    focusRingColor: '#3b82f6',
    borderRadius: '12px',
  }}
/>
```

### Custom Toolbar

```tsx
<RichTextEditor
  toolbar={{
    groups: [
      {
        items: [
          { type: 'mark', mark: 'bold' },
          { type: 'mark', mark: 'italic' },
        ],
      },
      {
        items: [
          { type: 'heading-select' },
          { type: 'link' },
          { type: 'image' },
        ],
      },
    ],
  }}
/>
```

### Custom Plugins

The editor receives a `plugins` prop: an array of functions that extend the Slate editor. Each plugin receives the editor and returns it (optionally after overriding methods). See **[docs/PLUGINS.md](docs/PLUGINS.md)** for the full contributor guide.

```tsx
import type { EditorPlugin } from '@richtext/react-rich-text';

const withMyFeature: EditorPlugin = (editor) => {
  const { insertText } = editor;
  editor.insertText = (text) => {
    // custom logic here
    insertText(text);
  };
  return editor;
};

<RichTextEditor plugins={[withMyFeature]} />
```

### Headless Mode

```tsx
import { useRichTextEditor } from '@richtext/react-rich-text';

function MyEditor() {
  const { editor, value, onChange, renderElement, renderLeaf } = useRichTextEditor();

  return (
    <Slate editor={editor} initialValue={value} onChange={onChange}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
}
```

## Serialization

```tsx
import { htmlSerializer, markdownSerializer } from '@richtext/react-rich-text';

// Slate JSON -> HTML
const html = htmlSerializer.serialize(editorValue);

// HTML -> Slate JSON
const slateValue = htmlSerializer.deserialize(htmlString);

// Slate JSON -> Markdown
const markdown = markdownSerializer.serialize(editorValue);
```

## License

MIT
