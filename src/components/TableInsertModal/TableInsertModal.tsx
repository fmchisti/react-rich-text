import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ModalAnchorPos } from '../InputModal/InputModal';

const MIN_COLS = 2;
const MAX_COLS = 6;
const MIN_ROWS = 2;
const MAX_ROWS = 10;

const ROW_OPTIONS = Array.from({ length: MAX_ROWS - MIN_ROWS + 1 }, (_, i) => ({
  value: String(MIN_ROWS + i),
  label: `${MIN_ROWS + i} row${MIN_ROWS + i === 1 ? '' : 's'}`,
}));

const COL_OPTIONS = Array.from({ length: MAX_COLS - MIN_COLS + 1 }, (_, i) => ({
  value: String(MIN_COLS + i),
  label: `${MIN_COLS + i} column${MIN_COLS + i === 1 ? '' : 's'}`,
}));

export interface TableInsertModalProps {
  open: boolean;
  anchorPos?: ModalAnchorPos;
  onSubmit: (rows: number, cols: number) => void;
  onCancel: () => void;
}

export function TableInsertModal({
  open,
  anchorPos,
  onSubmit,
  onCancel,
}: TableInsertModalProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setRows(3);
      setCols(3);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !panelRef.current || !overlayRef.current) return;
    const panel = panelRef.current;
    const container = overlayRef.current;
    const cRect = container.getBoundingClientRect();
    const pRect = panel.getBoundingClientRect();

    let top = anchorPos?.top ?? 0;
    let left = anchorPos?.left ?? 0;

    if (left + pRect.width > cRect.width - 8) {
      left = Math.max(8, cRect.width - pRect.width - 8);
    }
    if (left < 8) left = 8;
    if (top + pRect.height > cRect.height - 8) {
      top = Math.max(8, cRect.height - pRect.height - 8);
    }
    if (top < 8) top = 8;

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }, [open, anchorPos]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  const handleSubmit = useCallback(() => {
    onSubmit(rows, cols);
  }, [rows, cols, onSubmit]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        onCancel();
      }
    },
    [onCancel]
  );

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="rte-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rte-table-insert-title"
    >
      <div ref={panelRef} className="rte-modal">
        <div className="rte-modal-header">
          <h3 id="rte-table-insert-title" className="rte-modal-title">
            Insert table
          </h3>
        </div>

        <div className="rte-modal-body">
          <div className="rte-modal-field">
            <label className="rte-modal-label" htmlFor="rte-table-rows">
              Rows
            </label>
            <select
              id="rte-table-rows"
              className="rte-modal-input rte-modal-select"
              value={String(rows)}
              onChange={(e) => setRows(Number(e.target.value))}
            >
              {ROW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="rte-modal-field">
            <label className="rte-modal-label" htmlFor="rte-table-cols">
              Columns
            </label>
            <select
              id="rte-table-cols"
              className="rte-modal-input rte-modal-select"
              value={String(cols)}
              onChange={(e) => setCols(Number(e.target.value))}
            >
              {COL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rte-modal-footer">
          <button
            type="button"
            className="rte-modal-btn rte-modal-btn--cancel"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rte-modal-btn rte-modal-btn--submit"
            onClick={handleSubmit}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
