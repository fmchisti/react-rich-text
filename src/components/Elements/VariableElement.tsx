import React, { useCallback } from 'react';
import { useSelected, useFocused, useSlate, ReactEditor, type RenderElementProps } from 'slate-react';
import { Editor, Transforms } from 'slate';
import type { VariableElement as VariableElementType } from '../../core/types';

/**
 * Renders an inline variable as a styled chip/badge.
 * Displayed as `{{name}}` in a highlighted pill.
 * This is a void element -- the children are empty but must be rendered.
 * Clicking the chip moves the cursor after the variable so the user can type.
 */
export function VariableElement({ attributes, children, element }: RenderElementProps) {
  const el = element as VariableElementType;
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();
  const isHighlighted = selected && focused;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const path = ReactEditor.findPath(editor, element);
      const after = Editor.after(editor, path);
      if (after) {
        Transforms.select(editor, after);
        ReactEditor.focus(editor);
      }
    },
    [editor, element]
  );

  return (
    <span {...attributes}>
      <span
        contentEditable={false}
        className={`rte-variable${isHighlighted ? ' rte-variable--selected' : ''}`}
        title={`Variable: ${el.name}`}
        onMouseDown={handleClick}
      >
        <span className="rte-variable-brace">{'{'}</span>
        <span className="rte-variable-brace">{'{'}</span>
        <span className="rte-variable-name">{el.name}</span>
        <span className="rte-variable-brace">{'}'}</span>
        <span className="rte-variable-brace">{'}'}</span>
      </span>
      {children}
    </span>
  );
}
