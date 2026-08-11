import React, { useCallback } from 'react';
import { useSelected, useFocused, useSlate, ReactEditor, type RenderElementProps } from 'slate-react';
import { Editor, Transforms } from 'slate';
import type {
  VariableElement as VariableElementType,
  VariableValue,
} from '../../core/types';
import { safeFindPath } from '../../core/utils/slatePath';

export interface VariableElementProps extends RenderElementProps {
  /** Optional runtime value. The variable token itself remains in the Slate document. */
  value?: VariableValue | null;
}

function defaultImageAlt(name: string): string {
  return name.replace(/[_-]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

/**
 * Renders an inline variable as a styled chip/badge.
 * Displayed as `{{name}}` in a highlighted pill.
 * This is a void element -- the children are empty but must be rendered.
 * Clicking the chip moves the cursor after the variable so the user can type.
 */
export function VariableElement({
  attributes,
  children,
  element,
  value,
}: VariableElementProps) {
  const el = element as VariableElementType;
  const editor = useSlate();
  const selected = useSelected();
  const focused = useFocused();
  const isHighlighted = selected && focused;
  const imageValue = typeof value === 'object' && value?.type === 'image'
    ? value
    : undefined;
  const isResolved = typeof value === 'string' || imageValue !== undefined;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const path = safeFindPath(editor, element);
      if (!path) return;
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
        className={`rte-variable${isResolved ? ' rte-variable--resolved' : ''}${imageValue ? ' rte-variable--image' : ''}${isHighlighted ? ' rte-variable--selected' : ''}`}
        title={`Variable: ${el.name}`}
        onMouseDown={handleClick}
      >
        {imageValue ? (
          <img
            className="rte-variable-image"
            src={imageValue.src}
            alt={imageValue.alt ?? defaultImageAlt(el.name)}
            width={imageValue.width}
            height={imageValue.height}
            draggable={false}
            decoding="async"
          />
        ) : typeof value === 'string' ? (
          <span className="rte-variable-value">{value}</span>
        ) : (
          <>
            <span className="rte-variable-brace">{'{'}</span>
            <span className="rte-variable-brace">{'{'}</span>
            <span className="rte-variable-name">{el.name}</span>
            <span className="rte-variable-brace">{'}'}</span>
            <span className="rte-variable-brace">{'}'}</span>
          </>
        )}
      </span>
      {children}
    </span>
  );
}
