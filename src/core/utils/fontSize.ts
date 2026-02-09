import { Editor } from 'slate';

/**
 * Predefined font size scale (in pixels).
 * Covers a wide range from tiny to display-level.
 */
export const FONT_SIZE_SCALE = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72, 96,
] as const;

/** The default font size when no mark is applied (matches CSS base) */
export const DEFAULT_FONT_SIZE = 16;

/** Minimum allowed font size */
export const MIN_FONT_SIZE = 1;

/** Maximum allowed font size */
export const MAX_FONT_SIZE = 200;

/**
 * Get the current font size at the selection.
 * Returns the fontSize mark value, or DEFAULT_FONT_SIZE if none is set.
 */
export function getCurrentFontSize(editor: Editor): number {
  const marks = Editor.marks(editor);
  return (marks?.fontSize as number) ?? DEFAULT_FONT_SIZE;
}

/**
 * Set a specific font size on the current selection.
 * Pass `null` to remove the fontSize mark (revert to default).
 */
export function setFontSize(editor: Editor, size: number | null): void {
  if (size === null || size === DEFAULT_FONT_SIZE) {
    Editor.removeMark(editor, 'fontSize');
  } else {
    const clamped = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, Math.round(size)));
    Editor.addMark(editor, 'fontSize', clamped);
  }
}

/**
 * Increase font size to the next step in the scale.
 * If the current size is between scale steps, jumps to the next larger step.
 * If beyond the scale, increments by 2px.
 */
export function increaseFontSize(editor: Editor): void {
  const current = getCurrentFontSize(editor);
  const nextStep = FONT_SIZE_SCALE.find((s) => s > current);
  const newSize = nextStep ?? Math.min(current + 2, MAX_FONT_SIZE);
  setFontSize(editor, newSize);
}

/**
 * Decrease font size to the previous step in the scale.
 * If the current size is between scale steps, jumps to the next smaller step.
 * If below the scale, decrements by 2px.
 */
export function decreaseFontSize(editor: Editor): void {
  const current = getCurrentFontSize(editor);
  // Find the largest scale value smaller than current
  const prevStep = [...FONT_SIZE_SCALE].reverse().find((s) => s < current);
  const newSize = prevStep ?? Math.max(current - 2, MIN_FONT_SIZE);
  setFontSize(editor, newSize);
}
