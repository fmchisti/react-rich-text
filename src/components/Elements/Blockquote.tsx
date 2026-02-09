import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { BlockquoteElement } from '../../core/types';

export function Blockquote({ attributes, children, element }: RenderElementProps) {
  const el = element as BlockquoteElement;
  const style = el.align ? { textAlign: el.align } : undefined;
  return (
    <blockquote className="rte-blockquote" {...attributes} style={style}>
      {children}
    </blockquote>
  );
}
