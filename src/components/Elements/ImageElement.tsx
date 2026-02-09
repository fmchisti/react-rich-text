import React from 'react';
import { useSelected, useFocused, type RenderElementProps } from 'slate-react';
import type { ImageElement as ImageElementType } from '../../core/types';

export function ImageElement({ attributes, children, element }: RenderElementProps) {
  const el = element as ImageElementType;
  const selected = useSelected();
  const focused = useFocused();
  const isHighlighted = selected && focused;

  return (
    <div {...attributes}>
      {/* Void elements must render children even though they're empty */}
      <div contentEditable={false}>
        <div className={`rte-image-wrapper${isHighlighted ? ' rte-image--selected' : ''}`}>
          <img
            src={el.url}
            alt={el.alt || ''}
            className="rte-image"
            draggable={false}
          />
        </div>
      </div>
      {children}
    </div>
  );
}
