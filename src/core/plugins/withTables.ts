import { Editor, Transforms, Element as SlateElement, Path } from 'slate';

const emptyParagraph = () => ({
  type: 'paragraph' as const,
  children: [{ text: '' }],
});

const emptyCell = () => ({
  type: 'table-cell' as const,
  children: [emptyParagraph()],
});

const emptyRow = (colCount: number) => ({
  type: 'table-row' as const,
  children: Array.from({ length: colCount }, emptyCell),
});

const MIN_COLS = 2;
const MAX_COLS = 6;
const MIN_ROWS = 2;
const MAX_ROWS = 10;
const MAX_COLS_AFTER_INSERT = 12;
const MAX_ROWS_AFTER_INSERT = 50;
const DEFAULT_COL_WIDTH_PX = 120;

export type TableSelection = {
  tablePath: Path;
  rowIndex: number;
  colIndex: number;
  rows: number;
  cols: number;
};

/**
 * Insert a table at the current selection.
 * @param editor - Slate editor
 * @param rows - Number of rows (clamped to MIN_ROWS–MAX_ROWS, default 3)
 * @param cols - Number of columns (clamped to MIN_COLS–MAX_COLS, default 3)
 */
export function insertTable(
  editor: Editor,
  rows: number = 3,
  cols: number = 3
): void {
  const r = Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows));
  const c = Math.max(MIN_COLS, Math.min(MAX_COLS, cols));
  const table = {
    type: 'table' as const,
    colWidths: Array.from({ length: c }, () => DEFAULT_COL_WIDTH_PX),
    children: Array.from({ length: r }, () => emptyRow(c)),
  };
  Transforms.insertNodes(editor, table as any);
}

export { MIN_COLS, MAX_COLS, MIN_ROWS, MAX_ROWS };

/**
 * Check if the current selection is inside a table.
 */
export function isInTable(editor: Editor): boolean {
  const matches = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        SlateElement.isElement(n) && (n as any).type === 'table',
    })
  );
  return matches.length > 0;
}

/**
 * Get table dimensions (row count, col count) at the current selection.
 * Returns null if not in a table.
 */
export function getTableDimensions(editor: Editor): { rows: number; cols: number } | null {
  const match = Array.from(
    Editor.nodes(editor, {
      match: (n) =>
        SlateElement.isElement(n) && (n as any).type === 'table',
    })
  )[0];
  if (!match) return null;
  const [table] = match;
  if (!SlateElement.isElement(table)) return null;
  const rowCount = (table as any).children?.length ?? 0;
  const firstRow = (table as any).children?.[0];
  const colCount = SlateElement.isElement(firstRow) ? (firstRow as any).children?.length ?? 0 : 0;
  return { rows: rowCount, cols: colCount };
}

/**
 * Get the current table selection (table path, row index, col index).
 * Returns null if selection is not inside a table cell.
 */
export function getTableSelection(editor: Editor): TableSelection | null {
  const { selection } = editor;
  if (!selection) return null;
  const path = selection.anchor.path;
  if (path.length < 3) return null;
  const tablePath = path.slice(0, 1);
  const [tableNode] = Editor.node(editor, tablePath);
  if (!SlateElement.isElement(tableNode) || (tableNode as any).type !== 'table') return null;
  const rowIndex = path[1];
  const colIndex = path[2];
  const dims = getTableDimensions(editor);
  if (!dims) return null;
  return {
    tablePath,
    rowIndex,
    colIndex,
    rows: dims.rows,
    cols: dims.cols,
  };
}

/**
 * Insert a row above the current cell. Does nothing if not in a table or at max rows.
 */
export function insertRowAbove(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.rows >= MAX_ROWS_AFTER_INSERT) return false;
  const newRow = emptyRow(sel.cols);
  Transforms.insertNodes(editor, newRow as any, { at: [...sel.tablePath, sel.rowIndex] });
  return true;
}

/**
 * Insert a row below the current cell.
 */
export function insertRowBelow(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.rows >= MAX_ROWS_AFTER_INSERT) return false;
  const newRow = emptyRow(sel.cols);
  Transforms.insertNodes(editor, newRow as any, { at: [...sel.tablePath, sel.rowIndex + 1] });
  return true;
}

/**
 * Insert a column to the left of the current cell. Updates colWidths. Does nothing if at max columns.
 */
export function insertColumnLeft(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.cols >= MAX_COLS_AFTER_INSERT) return false;
  const [tableNode] = Editor.node(editor, sel.tablePath);
  const table = tableNode as any;
  const colWidths = Array.isArray(table.colWidths) && table.colWidths.length === sel.cols
    ? [...table.colWidths]
    : Array.from({ length: sel.cols }, () => DEFAULT_COL_WIDTH_PX);
  colWidths.splice(sel.colIndex, 0, DEFAULT_COL_WIDTH_PX);
  for (let r = 0; r < sel.rows; r++) {
    Transforms.insertNodes(editor, emptyCell() as any, {
      at: [...sel.tablePath, r, sel.colIndex],
    });
  }
  Transforms.setNodes(editor, { colWidths } as any, { at: sel.tablePath });
  return true;
}

/**
 * Insert a column to the right of the current cell.
 */
export function insertColumnRight(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.cols >= MAX_COLS_AFTER_INSERT) return false;
  const [tableNode] = Editor.node(editor, sel.tablePath);
  const table = tableNode as any;
  const colWidths = Array.isArray(table.colWidths) && table.colWidths.length === sel.cols
    ? [...table.colWidths]
    : Array.from({ length: sel.cols }, () => DEFAULT_COL_WIDTH_PX);
  colWidths.splice(sel.colIndex + 1, 0, DEFAULT_COL_WIDTH_PX);
  for (let r = 0; r < sel.rows; r++) {
    Transforms.insertNodes(editor, emptyCell() as any, {
      at: [...sel.tablePath, r, sel.colIndex + 1],
    });
  }
  Transforms.setNodes(editor, { colWidths } as any, { at: sel.tablePath });
  return true;
}

/**
 * Delete the current row. Does nothing if only one row (use deleteTable instead).
 */
export function deleteRow(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.rows <= 1) return false;
  Transforms.removeNodes(editor, { at: [...sel.tablePath, sel.rowIndex] });
  return true;
}

/**
 * Delete the current column. Does nothing if only two columns (MIN_COLS).
 */
export function deleteColumn(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel || sel.cols <= MIN_COLS) return false;
  const [tableNode] = Editor.node(editor, sel.tablePath);
  const table = tableNode as any;
  const colWidths = Array.isArray(table.colWidths) && table.colWidths.length === sel.cols
    ? [...table.colWidths]
    : null;
  if (colWidths) {
    colWidths.splice(sel.colIndex, 1);
    Transforms.setNodes(editor, { colWidths } as any, { at: sel.tablePath });
  }
  for (let r = sel.rows - 1; r >= 0; r--) {
    Transforms.removeNodes(editor, { at: [...sel.tablePath, r, sel.colIndex] });
  }
  return true;
}

/**
 * Remove the entire table containing the selection.
 */
export function deleteTable(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel) return false;
  Transforms.removeNodes(editor, { at: sel.tablePath });
  return true;
}

/**
 * Move selection to the next table cell (Tab). If at last cell, inserts a new row and moves there.
 * Returns true if handled (caller should preventDefault).
 */
export function selectNextTableCell(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel) return false;

  const { tablePath, rowIndex, colIndex, rows, cols } = sel;
  let nextRow = rowIndex;
  let nextCol = colIndex + 1;

  if (nextCol >= cols) {
    nextCol = 0;
    nextRow += 1;
  }
  if (nextRow >= rows) {
    // At last cell: insert row below and go to first cell of new row
    insertRowBelow(editor);
    nextRow = rowIndex + 1;
    nextCol = 0;
  }

  const cellPath = [...tablePath, nextRow, nextCol];
  try {
    const start = Editor.start(editor, cellPath);
    Transforms.select(editor, start);
    return true;
  } catch {
    return false;
  }
}

/**
 * Move selection to the previous table cell (Shift+Tab). Does nothing if at first cell.
 * Returns true if handled (caller should preventDefault).
 */
export function selectPreviousTableCell(editor: Editor): boolean {
  const sel = getTableSelection(editor);
  if (!sel) return false;

  const { tablePath, rowIndex, colIndex, rows, cols } = sel;
  let prevRow = rowIndex;
  let prevCol = colIndex - 1;

  if (prevCol < 0) {
    prevCol = cols - 1;
    prevRow -= 1;
  }
  if (prevRow < 0) return false; // already at first cell

  const cellPath = [...tablePath, prevRow, prevCol];
  try {
    const start = Editor.start(editor, cellPath);
    Transforms.select(editor, start);
    return true;
  } catch {
    return false;
  }
}
