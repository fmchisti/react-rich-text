import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { ParagraphElement } from '../../core/types';

export function Paragraph({ attributes, children, element }: RenderElementProps) {
  const el = element as ParagraphElement;
  const style = el.align ? { textAlign: el.align } : undefined;
  return (
    <p {...attributes} style={style}>
      {children}
    </p>
  );
}
