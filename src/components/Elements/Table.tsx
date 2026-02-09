import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSlate } from 'slate-react';
import { ReactEditor } from 'slate-react';
import { Transforms } from 'slate';
import type { RenderElementProps } from 'slate-react';
import type { TableElement as TableElementType } from '../../core/types';

const MIN_COL_WIDTH_PX = 24;

function TableInner({ attributes, children, element }: RenderElementProps) {
  const editor = useSlate();
  const tableRef = useRef<HTMLTableElement>(null);
  const slateRefRef = useRef<React.Ref<HTMLTableElement> | null>(null);
  slateRefRef.current = (attributes as { ref?: React.Ref<HTMLTableElement> }).ref ?? null;

  const tableEl = element as TableElementType;
  const rows = tableEl.children ?? [];
  const colCount = rows.length > 0 ? (rows[0] as any)?.children?.length ?? 0 : 0;
  const baseWidths: number[] = useMemo(
    () =>
      colCount <= 0
        ? []
        : (tableEl.colWidths?.length === colCount
            ? tableEl.colWidths
            : Array.from({ length: colCount }, () => 120)) ?? [],
    [tableEl.colWidths, colCount]
  );

  const tablePath = useMemo(
    () => ReactEditor.findPath(editor, element),
    [editor, element]
  );

  const [resizeState, setResizeState] = useState<{
    colIndex: number;
    startX: number;
    startWidths: number[];
    tableTop: number;
    tableHeight: number;
  } | null>(null);
  const [liveWidths, setLiveWidths] = useState<number[] | null>(null);
  const [resizeLineX, setResizeLineX] = useState<number | null>(null);
  const latestWidthsRef = useRef<number[]>(baseWidths);
  const rafRef = useRef<number | null>(null);
  const pendingMoveRef = useRef<MouseEvent | null>(null);

  const displayWidths: number[] = liveWidths ?? baseWidths;
  latestWidthsRef.current = displayWidths;

  const handleResizeStart = useCallback(
    (colIndex: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const table = tableRef.current;
      const rect = table?.getBoundingClientRect();
      setResizeState(
        rect
          ? {
              colIndex,
              startX: e.clientX,
              startWidths: [...displayWidths],
              tableTop: rect.top,
              tableHeight: rect.height,
            }
          : { colIndex, startX: e.clientX, startWidths: [...displayWidths], tableTop: 0, tableHeight: 0 }
      );
      setResizeLineX(e.clientX);
      setLiveWidths(null);
      document.body.classList.add('rte-table-resizing');
    },
    [displayWidths]
  );

  useEffect(() => {
    if (resizeState === null) return;

    const { colIndex, startX, startWidths, tableTop, tableHeight } = resizeState;
    const minW = MIN_COL_WIDTH_PX;
    const path = [...tablePath];

    const applyMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const next = startWidths.slice();
      const a = next[colIndex] + deltaX;
      const b = next[colIndex + 1] - deltaX;
      if (a >= minW && b >= minW) {
        next[colIndex] = a;
        next[colIndex + 1] = b;
        setLiveWidths(next);
        latestWidthsRef.current = next;
      }
      setResizeLineX(e.clientX);
    };

    const onMouseMove = (e: MouseEvent) => {
      pendingMoveRef.current = e;
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const ev = pendingMoveRef.current;
        if (ev) {
          pendingMoveRef.current = null;
          applyMove(ev);
        }
      });
    };

    const onMouseUp = () => {
      document.body.classList.remove('rte-table-resizing');
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingMoveRef.current = null;
      const final = latestWidthsRef.current;
      setResizeState(null);
      setResizeLineX(null);
      setLiveWidths(null);
      Transforms.setNodes(
        editor,
        { colWidths: final } as Partial<TableElementType>,
        { at: path }
      );
    };

    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.classList.remove('rte-table-resizing');
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [resizeState, editor, tablePath]);

  const resizeLine =
    resizeState !== null && resizeLineX !== null
      ? createPortal(
          <div
            className="rte-table-resize-line"
            style={{
              position: 'fixed',
              left: resizeLineX,
              top: resizeState.tableTop,
              height: resizeState.tableHeight,
            }}
            aria-hidden
          />,
          document.body
        )
      : null;

  const setTableRef = useCallback((el: HTMLTableElement | null) => {
    (tableRef as React.MutableRefObject<HTMLTableElement | null>).current = el;
    const attrRef = slateRefRef.current;
    if (typeof attrRef === 'function') attrRef(el);
    else if (attrRef) (attrRef as React.MutableRefObject<HTMLTableElement | null>).current = el;
  }, []);

  const { ref: _slateRef, ...tableAttributes } = attributes as { ref?: React.Ref<HTMLTableElement>; [k: string]: unknown };

  if (colCount <= 0) {
    return (
      <table ref={setTableRef} className="rte-table" {...tableAttributes} style={{ tableLayout: 'fixed', width: '100%' }}>
        <tbody>{children}</tbody>
      </table>
    );
  }

  return (
    <>
      <table
        ref={setTableRef}
        className="rte-table"
        {...tableAttributes}
        style={{ tableLayout: 'fixed', width: '100%' }}
      >
      <colgroup>
        {displayWidths.map((w, i) => (
          <col key={i} style={{ width: `${w}px`, minWidth: `${w}px` }} />
        ))}
      </colgroup>
      <tbody>
        <tr className="rte-table-resize-row" contentEditable={false}>
          {displayWidths.map((w, i) => (
            <td
              key={i}
              className="rte-table-resize-cell"
              style={{ width: `${w}px`, minWidth: `${w}px` }}
            >
              {i < colCount - 1 && (
                <div
                  className="rte-table-resize-handle"
                  onMouseDown={(e) => handleResizeStart(i, e)}
                  title="Drag to resize column"
                />
              )}
            </td>
          ))}
        </tr>
        {children}
      </tbody>
    </table>
      {resizeLine}
    </>
  );
}

export const Table = React.memo(TableInner);
