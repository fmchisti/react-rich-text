import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { TableCellElement } from '../../core/types';

export function TableCell({ attributes, children, element }: RenderElementProps) {
  const el = element as TableCellElement;
  const Tag = el.header ? 'th' : 'td';
  return (
    <Tag className="rte-table-cell" {...attributes}>
      {children}
    </Tag>
  );
}
