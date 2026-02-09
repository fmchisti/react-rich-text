import React from 'react';
import type { RenderElementProps } from 'slate-react';

export function DefaultElement({ attributes, children }: RenderElementProps) {
  return <p {...attributes}>{children}</p>;
}
