import React from 'react';
import type { RenderElementProps } from 'slate-react';

export function CodeBlock({ attributes, children }: RenderElementProps) {
  return (
    <pre className="rte-code-block" {...attributes}>
      <code>{children}</code>
    </pre>
  );
}
