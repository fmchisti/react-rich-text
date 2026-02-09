import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { ListItemElement } from '../../core/types';

export function ListItem({ attributes, children, element }: RenderElementProps) {
  const el = element as ListItemElement;
  const style = el.align ? { textAlign: el.align } : undefined;
  return (
    <li {...attributes} style={style}>
      {children}
    </li>
  );
}
