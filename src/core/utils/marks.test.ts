import { describe, it, expect } from 'vitest';
import { createEditor, Transforms, Editor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { isMarkActive, toggleMark } from './marks';
import type { MarkType } from '../types';

function makeEditor(text = 'hello world') {
  const editor = withHistory(withReact(createEditor()));
  editor.children = [
    { type: 'paragraph', children: [{ text }] },
  ];
  // Select all text
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: text.length },
  });
  return editor;
}

describe('isMarkActive', () => {
  it('returns false when no mark is active', () => {
    const editor = makeEditor();
    expect(isMarkActive(editor, 'bold')).toBe(false);
    expect(isMarkActive(editor, 'italic')).toBe(false);
  });

  it('returns true after toggling a mark on', () => {
    const editor = makeEditor();
    toggleMark(editor, 'bold');
    expect(isMarkActive(editor, 'bold')).toBe(true);
  });
});

describe('toggleMark', () => {
  it('turns a mark on', () => {
    const editor = makeEditor();
    toggleMark(editor, 'italic');
    expect(isMarkActive(editor, 'italic')).toBe(true);
  });

  it('turns a mark off after toggling twice', () => {
    const editor = makeEditor();
    toggleMark(editor, 'bold');
    toggleMark(editor, 'bold');
    expect(isMarkActive(editor, 'bold')).toBe(false);
  });

  it('handles multiple marks independently', () => {
    const editor = makeEditor();
    toggleMark(editor, 'bold');
    toggleMark(editor, 'italic');
    expect(isMarkActive(editor, 'bold')).toBe(true);
    expect(isMarkActive(editor, 'italic')).toBe(true);
    expect(isMarkActive(editor, 'underline')).toBe(false);
  });

  const marks: MarkType[] = ['bold', 'italic', 'underline', 'strikethrough', 'code'];
  marks.forEach((mark) => {
    it(`works for ${mark}`, () => {
      const editor = makeEditor();
      toggleMark(editor, mark);
      expect(isMarkActive(editor, mark)).toBe(true);
    });
  });
});
