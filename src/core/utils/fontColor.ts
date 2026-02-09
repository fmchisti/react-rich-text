import { Editor } from 'slate';

/**
 * Default color palette for the font color picker.
 */
export const DEFAULT_FONT_COLORS = [
  // Row 1 – basics
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  // Row 2 – vivid
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  // Row 3 – warm
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
  // Row 4 – medium
  '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
  // Row 5 – rich
  '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
  // Row 6 – dark
  '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
  // Row 7 – deep
  '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
  // Row 8 – darkest
  '#5b0f00', '#660000', '#783f04', '#7f6011', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130',
] as const;

/**
 * Get the current font color from editor marks.
 * Returns `null` if no custom color is set (default text color).
 */
export function getCurrentFontColor(editor: Editor): string | null {
  const marks = Editor.marks(editor);
  return (marks?.fontColor as string) ?? null;
}

/**
 * Set the font color on the current selection.
 * Pass `null` to remove the color and revert to default.
 */
export function setFontColor(editor: Editor, color: string | null): void {
  if (color === null) {
    Editor.removeMark(editor, 'fontColor');
  } else {
    Editor.addMark(editor, 'fontColor', color);
  }
}
