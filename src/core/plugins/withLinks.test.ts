import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';
import { describe, expect, it } from 'vitest';
import { withInlines } from './withInlines';
import { insertLink, withLinks } from './withLinks';

function createLinkEditor() {
  const editor = withLinks(withInlines(createEditor()));
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  return editor;
}

describe('withLinks', () => {
  it('preserves display text for a collapsed selection', () => {
    const editor = createLinkEditor();
    insertLink(editor, 'https://example.com', 'Example site');

    const [link] = Array.from(Editor.nodes(editor, {
      at: [],
      match: (node) => SlateElement.isElement(node) && node.type === 'link',
    }));
    expect((link[0] as any).url).toBe('https://example.com/');
    expect(Editor.string(editor, link[1])).toBe('Example site');
  });

  it('normalizes pasted bare domains', () => {
    const editor = createLinkEditor();
    editor.insertData({ getData: () => 'example.com' } as DataTransfer);

    const [link] = Array.from(Editor.nodes(editor, {
      at: [],
      match: (node) => SlateElement.isElement(node) && node.type === 'link',
    }));
    expect((link[0] as any).url).toBe('https://example.com/');
    expect(Editor.string(editor, link[1])).toBe('example.com');
  });

  it('rejects executable schemes', () => {
    const editor = createLinkEditor();
    insertLink(editor, 'javascript:alert(1)', 'Unsafe');
    expect(Array.from(Editor.nodes(editor, {
      at: [],
      match: (node) => SlateElement.isElement(node) && node.type === 'link',
    }))).toHaveLength(0);
  });
});
