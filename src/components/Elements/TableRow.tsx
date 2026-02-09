import React from 'react';
import type { RenderElementProps } from 'slate-react';

function TableRowInner({ attributes, children }: RenderElementProps) {
  return <tr {...attributes}>{children}</tr>;
}

export const TableRow = React.memo(TableRowInner);
