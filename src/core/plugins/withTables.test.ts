import { createEditor, Editor, Element as SlateElement, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import {
  deleteColumn,
  deleteRow,
  deleteTable,
  getTableDimensions,
  insertColumnLeft,
  insertColumnRight,
  insertRowAbove,
  insertRowBelow,
  insertTable,
  isInTable,
  selectNextTableCell,
  selectPreviousTableCell,
} from './withTables';

function makeTableEditor(rows = 3, cols = 3) {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  insertTable(editor, rows, cols);
  const tableIndex = editor.children.findIndex(
    (node) => SlateElement.isElement(node) && node.type === 'table'
  );
  if (tableIndex < 0) throw new Error('Expected a table to be inserted');

  const selectCell = (row: number, col: number) => {
    Transforms.select(editor, Editor.start(editor, [tableIndex, row, col]));
  };
  selectCell(0, 0);
  return { editor, tableIndex, selectCell };
}

describe('table tools', () => {
  it('inserts a table with requested dimensions', () => {
    const { editor } = makeTableEditor(4, 5);
    expect(getTableDimensions(editor)).toEqual({ rows: 4, cols: 5 });
    expect(isInTable(editor)).toBe(true);
  });

  it('clamps a table to the minimum dimensions', () => {
    const { editor } = makeTableEditor(1, 1);
    expect(getTableDimensions(editor)).toEqual({ rows: 2, cols: 2 });
  });

  it('clamps a table to the maximum insertion dimensions', () => {
    const { editor } = makeTableEditor(20, 20);
    expect(getTableDimensions(editor)).toEqual({ rows: 10, cols: 6 });
  });

  it('inserts a row above the current cell', () => {
    const { editor, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(insertRowAbove(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 4, cols: 3 });
  });

  it('inserts a row below the current cell', () => {
    const { editor, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(insertRowBelow(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 4, cols: 3 });
  });

  it('inserts a column to the left of the current cell', () => {
    const { editor, tableIndex, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(insertColumnLeft(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 3, cols: 4 });
    expect((editor.children[tableIndex] as any).colWidths).toHaveLength(4);
  });

  it('inserts a column to the right of the current cell', () => {
    const { editor, tableIndex, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(insertColumnRight(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 3, cols: 4 });
    expect((editor.children[tableIndex] as any).colWidths).toHaveLength(4);
  });

  it('deletes the current row', () => {
    const { editor, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(deleteRow(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 2, cols: 3 });
  });

  it('deletes the current column', () => {
    const { editor, tableIndex, selectCell } = makeTableEditor();
    selectCell(1, 1);
    expect(deleteColumn(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 3, cols: 2 });
    expect((editor.children[tableIndex] as any).colWidths).toHaveLength(2);
  });

  it('deletes the entire table', () => {
    const { editor, tableIndex } = makeTableEditor();
    expect(deleteTable(editor)).toBe(true);
    expect(editor.children[tableIndex]).not.toMatchObject({ type: 'table' });
  });

  it('moves to the next table cell', () => {
    const { editor, tableIndex } = makeTableEditor();
    expect(selectNextTableCell(editor)).toBe(true);
    expect(editor.selection?.anchor.path.slice(0, 3)).toEqual([tableIndex, 0, 1]);
  });

  it('moves to the previous table cell', () => {
    const { editor, tableIndex, selectCell } = makeTableEditor();
    selectCell(1, 0);
    expect(selectPreviousTableCell(editor)).toBe(true);
    expect(editor.selection?.anchor.path.slice(0, 3)).toEqual([tableIndex, 0, 2]);
  });

  it('adds a row when moving forward from the last cell', () => {
    const { editor, tableIndex, selectCell } = makeTableEditor();
    selectCell(2, 2);
    expect(selectNextTableCell(editor)).toBe(true);
    expect(getTableDimensions(editor)).toEqual({ rows: 4, cols: 3 });
    expect(editor.selection?.anchor.path.slice(0, 3)).toEqual([tableIndex, 3, 0]);
  });
});
