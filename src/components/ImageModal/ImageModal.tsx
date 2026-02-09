import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { ModalAnchorPos } from '../InputModal/InputModal';

export interface ImageModalProps {
  open: boolean;
  anchorPos?: ModalAnchorPos;
  /** Called when user submits a URL (paste link and Insert) */
  onSubmit: (url: string) => void;
  onCancel: () => void;
  /**
   * When provided, shows an "Upload file" option.
   * Callback receives the file; upload it and return the image URL.
   */
  onImageUpload?: (file: File) => Promise<string>;
}

export function ImageModal({
  open,
  anchorPos,
  onSubmit,
  onCancel,
  onImageUpload,
}: ImageModalProps) {
  const [url, setUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setUrl('');
      setUploadError('');
      setUploading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
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
    if (left + pRect.width > cRect.width - 8) left = Math.max(8, cRect.width - pRect.width - 8);
    if (left < 8) left = 8;
    if (top + pRect.height > cRect.height - 8) top = Math.max(8, cRect.height - pRect.height - 8);
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

  const handleSubmitUrl = useCallback(() => {
    if (url.trim()) {
      onSubmit(url.trim());
    }
  }, [url, onSubmit]);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !onImageUpload) return;
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file (PNG, JPG, GIF, etc.)');
        return;
      }
      setUploadError('');
      setUploading(true);
      onImageUpload(file)
        .then((imageUrl) => {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          onSubmit(imageUrl);
        })
        .catch((err) => {
          setUploading(false);
          setUploadError(err?.message ?? 'Upload failed');
          if (fileInputRef.current) fileInputRef.current.value = '';
        });
    },
    [onImageUpload, onSubmit]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onCancel();
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
      aria-labelledby="rte-image-modal-title"
    >
      <div ref={panelRef} className="rte-modal">
        <div className="rte-modal-header">
          <h3 id="rte-image-modal-title" className="rte-modal-title">
            Insert image
          </h3>
        </div>

        <div className="rte-modal-body">
          <label className="rte-modal-label" htmlFor="rte-image-url-input">
            Image URL
          </label>
          <input
            ref={inputRef}
            id="rte-image-url-input"
            type="url"
            className="rte-modal-input"
            placeholder="https://example.com/photo.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmitUrl();
              }
            }}
            autoComplete="off"
            spellCheck={false}
            disabled={uploading}
          />
          <p className="rte-modal-helper">Paste a direct link to an image (PNG, JPG, GIF, SVG, or WebP)</p>

          {onImageUpload && (
            <>
              <div className="rte-modal-divider" style={{ margin: '12px 0', borderTop: '1px solid var(--rte-border-color, #e5e7eb)' }} />
              <label className="rte-modal-label">Or upload a file</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="rte-modal-input"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ padding: '6px' }}
              />
              {uploading && <p className="rte-modal-helper" style={{ marginTop: 6 }}>Uploading…</p>}
              {uploadError && <p className="rte-modal-error">{uploadError}</p>}
            </>
          )}
        </div>

        <div className="rte-modal-footer">
          <button type="button" className="rte-modal-btn rte-modal-btn--cancel" onClick={onCancel} disabled={uploading}>
            Cancel
          </button>
          <button
            type="button"
            className="rte-modal-btn rte-modal-btn--submit"
            onClick={handleSubmitUrl}
            disabled={!url.trim() || uploading}
          >
            Insert
          </button>
        </div>
      </div>
    </div>
  );
}
