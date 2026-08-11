import { createEditor, Transforms, Element as SlateElement } from 'slate';
import { describe, expect, it } from 'vitest';
import type { Align } from '../types';
import { getBlockAlign, setBlockAlign } from './alignment';

function makeEditor() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: 'align me' }] }];
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 8 },
  });
  return editor;
}

describe('alignment tools', () => {
  const alignments: Align[] = ['left', 'center', 'right', 'justify'];

  alignments.forEach((alignment) => {
    it(`sets ${alignment} alignment`, () => {
      const editor = makeEditor();
      setBlockAlign(editor, alignment);

      expect(getBlockAlign(editor)).toBe(alignment);
      const [block] = editor.children;
      expect(SlateElement.isElement(block) && 'align' in block && block.align).toBe(alignment);
    });
  });

  it('does nothing without a selection', () => {
    const editor = makeEditor();
    editor.selection = null;
    setBlockAlign(editor, 'center');

    expect(getBlockAlign(editor)).toBeUndefined();
  });
});
