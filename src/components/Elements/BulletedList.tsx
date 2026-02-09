import React from 'react';
import type { RenderElementProps } from 'slate-react';

export function BulletedList({ attributes, children }: RenderElementProps) {
  return <ul {...attributes}>{children}</ul>;
}
