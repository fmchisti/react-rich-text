import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { LinkElement as LinkElementType } from '../../core/types';

export function LinkElement({ attributes, children, element }: RenderElementProps) {
  const el = element as LinkElementType;

  return (
    <a
      {...attributes}
      href={el.url}
      className="rte-link"
      title={el.url}
      onClick={(e) => {
        // Allow cmd/ctrl+click to open links
        if (e.metaKey || e.ctrlKey) {
          window.open(el.url, '_blank', 'noopener,noreferrer');
        }
      }}
    >
      {children}
    </a>
  );
}
