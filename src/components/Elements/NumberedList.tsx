import React from 'react';
import type { RenderElementProps } from 'slate-react';

export function NumberedList({ attributes, children }: RenderElementProps) {
  return <ol {...attributes}>{children}</ol>;
}
