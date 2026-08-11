import { createEditor, Element as SlateElement, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import { withShortcuts } from './withShortcuts';

function applyShortcut(shortcut: string) {
  const editor = withShortcuts(createEditor());
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  editor.insertText(shortcut);
  editor.insertText(' ');
  return editor;
}

describe('Markdown shortcut tools', () => {
  [1, 2, 3, 4, 5, 6].forEach((level) => {
    it(`converts ${'#'.repeat(level)} into heading ${level}`, () => {
      const editor = applyShortcut('#'.repeat(level));
      const [node] = editor.children;

      expect(SlateElement.isElement(node) && node.type).toBe('heading');
      expect(SlateElement.isElement(node) && 'level' in node && node.level).toBe(level);
    });
  });

  it('converts > into a blockquote', () => {
    const [node] = applyShortcut('>').children;
    expect(SlateElement.isElement(node) && node.type).toBe('blockquote');
  });

  ['-', '*'].forEach((shortcut) => {
    it(`converts ${shortcut} into a bulleted list`, () => {
      const [node] = applyShortcut(shortcut).children;
      expect(SlateElement.isElement(node) && node.type).toBe('bulleted-list');
    });
  });

  it('converts 1. into a numbered list', () => {
    const [node] = applyShortcut('1.').children;
    expect(SlateElement.isElement(node) && node.type).toBe('numbered-list');
  });

  it('converts triple backticks into a code block', () => {
    const [node] = applyShortcut('```').children;
    expect(SlateElement.isElement(node) && node.type).toBe('code-block');
  });

  it('keeps unknown prefixes as normal paragraph text', () => {
    const editor = applyShortcut('unknown');
    const [node] = editor.children;
    expect(SlateElement.isElement(node) && node.type).toBe('paragraph');
    expect((node as any).children[0].text).toBe('unknown ');
  });
});
