import React from 'react';
import type { RenderLeafProps } from 'slate-react';

/**
 * Universal leaf renderer.
 * Wraps text in the appropriate inline markup based on active marks.
 * Applies fontSize as an inline style when present.
 */
export function Leaf({ attributes, children, leaf }: RenderLeafProps) {
  let content = children;

  if (leaf.bold) {
    content = <strong>{content}</strong>;
  }

  if (leaf.italic) {
    content = <em>{content}</em>;
  }

  if (leaf.underline) {
    content = <u>{content}</u>;
  }

  if (leaf.strikethrough) {
    content = <s>{content}</s>;
  }

  if (leaf.code) {
    content = <code>{content}</code>;
  }

  // Build inline styles for fontSize and fontColor
  const style: React.CSSProperties = {};
  if (leaf.fontSize) style.fontSize = `${leaf.fontSize}px`;
  if (leaf.fontColor) style.color = leaf.fontColor;
  const hasStyle = Object.keys(style).length > 0;

  return (
    <span {...attributes} style={hasStyle ? style : undefined}>
      {content}
    </span>
  );
}
