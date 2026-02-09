import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ModalAnchorPos } from '../InputModal';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LinkModalProps {
  /** Whether the modal is visible */
  open: boolean;
  /** Whether the user has text selected (hides the name field if true) */
  hasSelection?: boolean;
  /** Position relative to .rte-root where the popover should appear */
  anchorPos?: ModalAnchorPos;
  /** Called when user submits */
  onSubmit: (url: string, text: string) => void;
  /** Called when user cancels or presses Escape */
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Link icon (inline)
// ---------------------------------------------------------------------------

const LinkIconSmall = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LinkModal({ open, hasSelection = false, anchorPos, onSubmit, onCancel }: LinkModalProps) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const urlRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset & focus when modal opens
  useEffect(() => {
    if (open) {
      setUrl('');
      setText('');
      requestAnimationFrame(() => {
        if (hasSelection) {
          urlRef.current?.focus();
        } else {
          textRef.current?.focus();
        }
      });
    }
  }, [open, hasSelection]);

  // Clamp panel position to stay within the container
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

  // Escape key
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
    if (url.trim()) {
      onSubmit(url.trim(), text.trim());
    }
  }, [url, text, onSubmit]);

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
      aria-labelledby="rte-link-modal-title"
    >
      <div ref={panelRef} className="rte-modal">
        {/* Header */}
        <div className="rte-modal-header">
          <span className="rte-modal-icon"><LinkIconSmall /></span>
          <h3 id="rte-link-modal-title" className="rte-modal-title">
            Insert Link
          </h3>
        </div>

        {/* Body */}
        <div className="rte-modal-body">
          {!hasSelection && (
            <div className="rte-modal-field">
              <label className="rte-modal-label" htmlFor="rte-link-text">
                Display Text
              </label>
              <input
                ref={textRef}
                id="rte-link-text"
                type="text"
                className="rte-modal-input"
                placeholder="Enter link text..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    urlRef.current?.focus();
                  }
                }}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          )}

          <div className="rte-modal-field">
            <label className="rte-modal-label" htmlFor="rte-link-url">
              URL
            </label>
            <input
              ref={urlRef}
              id="rte-link-url"
              type="url"
              className="rte-modal-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <p className="rte-modal-helper">
            {hasSelection
              ? 'The selected text will be turned into a clickable link'
              : 'Enter the text to display and the destination URL'}
          </p>
        </div>

        {/* Footer */}
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
            disabled={!url.trim()}
          >
            Insert Link
          </button>
        </div>
      </div>
    </div>
  );
}
