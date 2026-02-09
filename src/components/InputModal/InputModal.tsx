import React, { useEffect, useRef, useState, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalAnchorPos {
  top: number;
  left: number;
}

export interface InputModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Modal title */
  title: string;
  /** Position relative to .rte-root where the popover should appear */
  anchorPos?: ModalAnchorPos;
  /** Input placeholder */
  placeholder?: string;
  /** Label above the input */
  label?: string;
  /** Input type */
  inputType?: 'url' | 'text';
  /** Submit button text */
  submitText?: string;
  /** Cancel button text */
  cancelText?: string;
  /** Helper/description text below the input */
  helperText?: string;
  /** Error message to display */
  error?: string;
  /** Called when user submits */
  onSubmit: (value: string) => void;
  /** Called when user cancels or presses Escape */
  onCancel: () => void;
  /** Optional icon to show in the header */
  icon?: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function InputModal({
  open,
  title,
  anchorPos,
  placeholder = '',
  label,
  inputType = 'url',
  submitText = 'Insert',
  cancelText = 'Cancel',
  helperText,
  error,
  onSubmit,
  onCancel,
  icon,
}: InputModalProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setValue('');
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [open]);

  // Clamp panel position to stay within the container
  useEffect(() => {
    if (!open || !panelRef.current || !overlayRef.current) return;
    const panel = panelRef.current;
    const container = overlayRef.current;
    const cRect = container.getBoundingClientRect();
    const pRect = panel.getBoundingClientRect();

    let top = anchorPos?.top ?? 0;
    let left = anchorPos?.left ?? 0;

    // Clamp right edge
    if (left + pRect.width > cRect.width - 8) {
      left = Math.max(8, cRect.width - pRect.width - 8);
    }
    // Clamp left
    if (left < 8) left = 8;
    // Clamp bottom edge
    if (top + pRect.height > cRect.height - 8) {
      top = Math.max(8, cRect.height - pRect.height - 8);
    }
    // Clamp top
    if (top < 8) top = 8;

    panel.style.top = `${top}px`;
    panel.style.left = `${left}px`;
  }, [open, anchorPos]);

  // Handle Escape key
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
    if (value.trim()) {
      onSubmit(value.trim());
    }
  }, [value, onSubmit]);

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
      aria-labelledby="rte-modal-title"
    >
      <div ref={panelRef} className="rte-modal">
        {/* Header */}
        <div className="rte-modal-header">
          {icon && <span className="rte-modal-icon">{icon}</span>}
          <h3 id="rte-modal-title" className="rte-modal-title">{title}</h3>
        </div>

        {/* Body */}
        <div className="rte-modal-body">
          {label && (
            <label className="rte-modal-label" htmlFor="rte-modal-input">
              {label}
            </label>
          )}
          <input
            ref={inputRef}
            id="rte-modal-input"
            type={inputType}
            className={`rte-modal-input${error ? ' rte-modal-input--error' : ''}`}
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            autoComplete="off"
            spellCheck={false}
          />
          {error && <p className="rte-modal-error">{error}</p>}
          {helperText && !error && <p className="rte-modal-helper">{helperText}</p>}
        </div>

        {/* Footer */}
        <div className="rte-modal-footer">
          <button
            type="button"
            className="rte-modal-btn rte-modal-btn--cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="rte-modal-btn rte-modal-btn--submit"
            onClick={handleSubmit}
            disabled={!value.trim()}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
}
