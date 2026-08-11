import { createEditor, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import { getCurrentFontColor, setFontColor } from './fontColor';

function makeEditor() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: 'color me' }] }];
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 8 },
  });
  return editor;
}

describe('font color tool', () => {
  it('starts with the default text color', () => {
    expect(getCurrentFontColor(makeEditor())).toBeNull();
  });

  it('applies a selected font color', () => {
    const editor = makeEditor();
    setFontColor(editor, '#e06666');

    expect(getCurrentFontColor(editor)).toBe('#e06666');
    expect((editor.children[0] as any).children[0].fontColor).toBe('#e06666');
  });

  it('clears the selected font color', () => {
    const editor = makeEditor();
    setFontColor(editor, '#e06666');
    setFontColor(editor, null);

    expect(getCurrentFontColor(editor)).toBeNull();
    expect((editor.children[0] as any).children[0].fontColor).toBeUndefined();
  });
});
