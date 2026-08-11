import React from 'react';
import { useReadOnly, type RenderElementProps } from 'slate-react';
import type { LinkElement as LinkElementType } from '../../core/types';
import { normalizeLinkUrl } from '../../core/utils/url';

export function LinkElement({ attributes, children, element }: RenderElementProps) {
  const el = element as LinkElementType;
  const safeUrl = normalizeLinkUrl(el.url);
  const readOnly = useReadOnly();

  return (
    <a
      {...attributes}
      href={safeUrl ?? undefined}
      className="rte-link"
      title={safeUrl ?? undefined}
      onClick={(e) => {
        if (readOnly) return;
        e.preventDefault();
        // Allow cmd/ctrl+click to open links
        if (safeUrl && (e.metaKey || e.ctrlKey)) {
          window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {children}
    </a>
  );
}
