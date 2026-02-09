import { describe, it, expect } from 'vitest';
import { createEditor, Transforms, Editor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import {
  getCurrentFontSize,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
  DEFAULT_FONT_SIZE,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  FONT_SIZE_SCALE,
} from './fontSize';

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

describe('getCurrentFontSize', () => {
  it('returns DEFAULT_FONT_SIZE when no mark is set', () => {
    const editor = makeEditor();
    expect(getCurrentFontSize(editor)).toBe(DEFAULT_FONT_SIZE);
  });

  it('returns the mark value after setFontSize', () => {
    const editor = makeEditor();
    setFontSize(editor, 24);
    expect(getCurrentFontSize(editor)).toBe(24);
  });
});

describe('setFontSize', () => {
  it('sets a specific font size', () => {
    const editor = makeEditor();
    setFontSize(editor, 32);
    expect(getCurrentFontSize(editor)).toBe(32);
  });

  it('removes the mark when set to null', () => {
    const editor = makeEditor();
    setFontSize(editor, 32);
    setFontSize(editor, null);
    expect(getCurrentFontSize(editor)).toBe(DEFAULT_FONT_SIZE);
  });

  it('removes the mark when set to DEFAULT_FONT_SIZE', () => {
    const editor = makeEditor();
    setFontSize(editor, 32);
    setFontSize(editor, DEFAULT_FONT_SIZE);
    expect(getCurrentFontSize(editor)).toBe(DEFAULT_FONT_SIZE);
  });

  it('clamps to MIN_FONT_SIZE', () => {
    const editor = makeEditor();
    setFontSize(editor, -5);
    expect(getCurrentFontSize(editor)).toBe(MIN_FONT_SIZE);
  });

  it('clamps to MAX_FONT_SIZE', () => {
    const editor = makeEditor();
    setFontSize(editor, 999);
    expect(getCurrentFontSize(editor)).toBe(MAX_FONT_SIZE);
  });

  it('rounds fractional values', () => {
    const editor = makeEditor();
    setFontSize(editor, 14.7);
    expect(getCurrentFontSize(editor)).toBe(15);
  });
});

describe('increaseFontSize', () => {
  it('increases from default (16) to next scale step (18)', () => {
    const editor = makeEditor();
    increaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(18);
  });

  it('steps through the scale correctly', () => {
    const editor = makeEditor();
    setFontSize(editor, 12);
    increaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(14);
  });

  it('increments by 2 when beyond the scale', () => {
    const editor = makeEditor();
    setFontSize(editor, 100);
    increaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(102);
  });

  it('does not exceed MAX_FONT_SIZE', () => {
    const editor = makeEditor();
    setFontSize(editor, MAX_FONT_SIZE);
    increaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(MAX_FONT_SIZE);
  });
});

describe('decreaseFontSize', () => {
  it('decreases from default (16) to previous scale step (14)', () => {
    const editor = makeEditor();
    decreaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(14);
  });

  it('steps through the scale correctly', () => {
    const editor = makeEditor();
    setFontSize(editor, 24);
    decreaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(20);
  });

  it('decrements by 2 when below the scale', () => {
    const editor = makeEditor();
    setFontSize(editor, 5);
    decreaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(3);
  });

  it('does not go below MIN_FONT_SIZE', () => {
    const editor = makeEditor();
    setFontSize(editor, MIN_FONT_SIZE);
    decreaseFontSize(editor);
    expect(getCurrentFontSize(editor)).toBe(MIN_FONT_SIZE);
  });
});

describe('FONT_SIZE_SCALE', () => {
  it('is sorted in ascending order', () => {
    for (let i = 1; i < FONT_SIZE_SCALE.length; i++) {
      expect(FONT_SIZE_SCALE[i]).toBeGreaterThan(FONT_SIZE_SCALE[i - 1]);
    }
  });

  it('contains the default font size', () => {
    expect(FONT_SIZE_SCALE).toContain(DEFAULT_FONT_SIZE);
  });
});
