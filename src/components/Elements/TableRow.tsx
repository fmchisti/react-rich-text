import React from 'react';
import type { RenderElementProps } from 'slate-react';

export function TableRow({ attributes, children }: RenderElementProps) {
  return <tr {...attributes}>{children}</tr>;
}
