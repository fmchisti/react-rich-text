import { describe, it, expect } from 'vitest';
import { createEditor, Transforms, Element as SlateElement } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { isBlockActive, toggleBlock } from './blocks';

function makeEditor(text = 'hello world') {
  const editor = withHistory(withReact(createEditor()));
  editor.children = [
    { type: 'paragraph', children: [{ text }] },
  ];
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: text.length },
  });
  return editor;
}

describe('isBlockActive', () => {
  it('detects paragraph as active by default', () => {
    const editor = makeEditor();
    expect(isBlockActive(editor, 'paragraph')).toBe(true);
  });

  it('returns false for non-active block types', () => {
    const editor = makeEditor();
    expect(isBlockActive(editor, 'heading')).toBe(false);
    expect(isBlockActive(editor, 'blockquote')).toBe(false);
  });
});

describe('toggleBlock', () => {
  it('converts paragraph to blockquote', () => {
    const editor = makeEditor();
    toggleBlock(editor, 'blockquote');
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('blockquote');
  });

  it('converts blockquote back to paragraph', () => {
    const editor = makeEditor();
    toggleBlock(editor, 'blockquote');
    toggleBlock(editor, 'blockquote');
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('paragraph');
  });

  it('converts to heading with a level', () => {
    const editor = makeEditor();
    toggleBlock(editor, 'heading', 2);
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('heading');
    expect(SlateElement.isElement(node) && 'level' in node && node.level).toBe(2);
  });

  it('wraps selection in bulleted list', () => {
    const editor = makeEditor();
    toggleBlock(editor, 'bulleted-list');
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('bulleted-list');
  });

  it('wraps selection in numbered list', () => {
    const editor = makeEditor();
    toggleBlock(editor, 'numbered-list');
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('numbered-list');
  });
});
