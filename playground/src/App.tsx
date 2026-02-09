import React, { useState, useCallback, useMemo } from "react";
import {
  RichTextEditor,
  htmlSerializer,
  markdownSerializer,
  Transforms,
  type Descendant,
  type CustomContextMenuCommand,
  type SlashMenuConfig,
} from "@richtext/react-rich-text";
// Styles are included by RichTextEditor. Package users do not need to import CSS.

const customCommands: CustomContextMenuCommand[] = [
  {
    id: "insert-callout",
    label: "Callout",
    description: "Insert a callout box",
    category: "insert",
    keywords: ["callout", "box", "alert"],
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="2"/>',
    action: { type: "custom", customId: "insert-callout" },
  },
];

const INITIAL_VALUE: Descendant[] = [
  {
    type: "heading",
    level: 1,
    children: [{ text: "React Rich Text Editor" }],
  },
  {
    type: "paragraph",
    children: [
      { text: "A fully " },
      { text: "customizable", bold: true },
      { text: ", " },
      { text: "open-source", italic: true },
      { text: " rich text editor for React with complete TypeScript support." },
    ],
  },
  {
    type: "heading",
    level: 2,
    children: [{ text: "Features" }],
  },
  {
    type: "bulleted-list",
    children: [
      {
        type: "list-item",
        children: [
          { text: "Bold", bold: true },
          { text: ", " },
          { text: "Italic", italic: true },
          { text: ", " },
          { text: "Underline", underline: true },
          { text: ", " },
          { text: "Strikethrough", strikethrough: true },
          { text: ", " },
          { text: "Inline Code", code: true },
        ],
      },
      {
        type: "list-item",
        children: [{ text: "Headings (H1 through H6)" }],
      },
      {
        type: "list-item",
        children: [{ text: "Ordered and unordered lists" }],
      },
      {
        type: "list-item",
        children: [{ text: "Blockquotes and code blocks" }],
      },
      {
        type: "list-item",
        children: [
          {
            text: "Links, images, and video embeds (YouTube, Vimeo, Loom, etc.)",
          },
        ],
      },
      {
        type: "list-item",
        children: [
          {
            text: "Template variables: type {{name}} or use the toolbar dropdown",
          },
        ],
      },
      {
        type: "list-item",
        children: [
          { text: "Hovering toolbar: select text to see " },
          { text: "bold", bold: true },
          { text: ", italic, link, and " },
          { text: "font color", fontColor: "#e06666" },
          { text: " controls" },
        ],
      },
      {
        type: "list-item",
        children: [
          {
            text: "Markdown shortcuts (type # for heading, > for quote, etc.)",
          },
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [{ text: "Blockquote Example" }],
  },
  {
    type: "blockquote",
    children: [
      {
        type: "paragraph",
        children: [
          {
            text: "The best way to predict the future is to invent it.",
            italic: true,
          },
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [{ text: "Code Block Example" }],
  },
  {
    type: "code-block",
    language: "typescript",
    children: [
      {
        text: 'import { RichTextEditor } from "@richtext/react-rich-text";\n\nfunction App() {\n  return <RichTextEditor placeholder="Start writing..." />;\n}',
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [{ text: "Variable / Template Example" }],
  },
  {
    type: "paragraph",
    children: [
      { text: "Dear " },
      { type: "variable", name: "name", children: [{ text: "" }] } as any,
      { text: ", your order #" },
      { type: "variable", name: "order_id", children: [{ text: "" }] } as any,
      { text: " has been shipped to " },
      { type: "variable", name: "email", children: [{ text: "" }] } as any,
      { text: "." },
    ],
  },
  {
    type: "heading",
    level: 3,
    children: [{ text: "Video Embed Example" }],
  },
  {
    type: "video",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    embedUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    provider: "youtube",
    caption: "YouTube video embed — paste any video URL via the toolbar",
    children: [{ text: "" }],
  } as any,
  {
    type: "paragraph",
    children: [
      { text: "Try the " },
      { text: "toolbar buttons", bold: true },
      { text: " above, or use " },
      { text: "keyboard shortcuts", code: true },
      { text: " like Ctrl+B for bold and Ctrl+I for italic!" },
    ],
  },
];

export default function App() {
  const [value, setValue] = useState<Descendant[]>(INITIAL_VALUE);
  const [showOutput, setShowOutput] = useState<
    "json" | "html" | "markdown" | null
  >(null);

  const handleChange = useCallback((newValue: Descendant[]) => {
    setValue(newValue);
  }, []);

  const slashMenuConfig: SlashMenuConfig = useMemo(
    () => ({
      enabled: true,
      customCommands,
      onContextMenuCommand(customId, editor) {
        if (customId === "insert-callout") {
          Transforms.insertNodes(editor, {
            type: "paragraph",
            children: [{ text: "Callout content..." }],
          });
        }
      },
    }),
    []
  );

  const getOutput = () => {
    if (showOutput === "json") return JSON.stringify(value, null, 2);
    if (showOutput === "html") return htmlSerializer.serialize(value);
    if (showOutput === "markdown") return markdownSerializer.serialize(value);
    return "";
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>React Rich Text</h1>
        <p style={styles.subtitle}>
          Advanced, open-source, 100% customizable rich text editor for React
        </p>
      </header>

      <main style={styles.main}>
        <section style={styles.editorSection}>
          <RichTextEditor
            value={value}
            toolbar={false}
            onChange={handleChange}
            placeholder='Start writing something amazing...'
            autoFocus
            minHeight={300}
            slashMenu={slashMenuConfig}
            variables={[
              "name",
              "email",
              "company",
              "date",
              "phone",
              "order_id",
              "address",
              "amount",
            ]}
            theme={{
              fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          />
        </section>

        <section style={styles.outputSection}>
          <div style={styles.outputButtons}>
            <button
              style={{
                ...styles.outputBtn,
                ...(showOutput === "json" ? styles.outputBtnActive : {}),
              }}
              onClick={() =>
                setShowOutput(showOutput === "json" ? null : "json")
              }
            >
              JSON
            </button>
            <button
              style={{
                ...styles.outputBtn,
                ...(showOutput === "html" ? styles.outputBtnActive : {}),
              }}
              onClick={() =>
                setShowOutput(showOutput === "html" ? null : "html")
              }
            >
              HTML
            </button>
            <button
              style={{
                ...styles.outputBtn,
                ...(showOutput === "markdown" ? styles.outputBtnActive : {}),
              }}
              onClick={() =>
                setShowOutput(showOutput === "markdown" ? null : "markdown")
              }
            >
              Markdown
            </button>
          </div>

          {showOutput && <pre style={styles.output}>{getOutput()}</pre>}
        </section>
      </main>

      <footer style={styles.footer}>
        <p>MIT License | Built with Slate.js + React + TypeScript</p>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  header: {
    textAlign: "center",
    padding: "40px 20px 20px",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: 700,
    color: "#1e293b",
    margin: 0,
  },
  subtitle: {
    fontSize: "1.1rem",
    color: "#64748b",
    marginTop: "8px",
  },
  main: {
    flex: 1,
    maxWidth: "840px",
    width: "100%",
    margin: "0 auto",
    padding: "20px",
  },
  editorSection: {
    marginBottom: "24px",
  },
  outputSection: {
    marginTop: "16px",
  },
  outputButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "12px",
  },
  outputBtn: {
    padding: "8px 20px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    background: "white",
    color: "#374151",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  outputBtnActive: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "white",
  },
  output: {
    background: "#1e293b",
    color: "#e2e8f0",
    padding: "20px",
    borderRadius: "12px",
    fontSize: "0.85rem",
    lineHeight: 1.6,
    overflow: "auto",
    maxHeight: "400px",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    color: "#94a3b8",
    fontSize: "0.85rem",
  },
};
