import React from 'react';
import type { RenderElementProps } from 'slate-react';
import type { HeadingElement as HeadingElementType } from '../../core/types';

export function Heading({ attributes, children, element }: RenderElementProps) {
  const el = element as HeadingElementType;
  const style = el.align ? { textAlign: el.align } : undefined;

  switch (el.level) {
    case 1:
      return <h1 {...attributes} style={style}>{children}</h1>;
    case 2:
      return <h2 {...attributes} style={style}>{children}</h2>;
    case 3:
      return <h3 {...attributes} style={style}>{children}</h3>;
    case 4:
      return <h4 {...attributes} style={style}>{children}</h4>;
    case 5:
      return <h5 {...attributes} style={style}>{children}</h5>;
    case 6:
      return <h6 {...attributes} style={style}>{children}</h6>;
    default:
      return <h1 {...attributes} style={style}>{children}</h1>;
  }
}
