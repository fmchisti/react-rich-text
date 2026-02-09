import React, { useRef, useCallback } from 'react';
import { useSlate } from 'slate-react';
import { Editor, Element as SlateElement, Range } from 'slate';
import { ReactEditor } from 'slate-react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlusButtonProps {
  /** Called when the + button is clicked, with the position for the slash menu */
  onOpen: (pos: { top: number; left: number }) => void;
  /** Reference to the .rte-root element for position calculations */
  rootRef: React.RefObject<HTMLDivElement | null>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlusButton({ onOpen, rootRef }: PlusButtonProps) {
  const editor = useSlate();
  const btnRef = useRef<HTMLButtonElement>(null);

  // Compute visibility and position synchronously during render
  // (useSlate already re-renders on every editor change)
  let visible = false;
  let top = 0;
  let left = 4;

  try {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [match] = Array.from(
        Editor.nodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === 'paragraph',
        })
      );

      if (match) {
        const [node, path] = match;
        const text = Editor.string(editor, path);

        if (text.length === 0 && rootRef.current) {
          const domNode = ReactEditor.toDOMNode(editor, node);
          if (domNode) {
            const rootRect = rootRef.current.getBoundingClientRect();
            const nodeRect = domNode.getBoundingClientRect();
            top = nodeRect.top - rootRect.top + (nodeRect.height / 2) - 12;
            visible = true;
          }
        }
      }
    }
  } catch {
    visible = false;
  }

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!rootRef.current) return;

      const rootRect = rootRef.current.getBoundingClientRect();
      const btnRect = (e.currentTarget as HTMLElement).getBoundingClientRect();

      onOpen({
        top: btnRect.bottom - rootRect.top + 4,
        left: btnRect.left - rootRect.left,
      });
    },
    [onOpen, rootRef]
  );

  if (!visible) return null;

  return (
    <button
      ref={btnRef}
      className="rte-plus-button"
      style={{ top: `${top}px`, left: `${left}px` }}
      title="Insert block (or type /)"
      onMouseDown={handleClick}
      tabIndex={-1}
    >
      <svg viewBox="0 0 24 24" width="16" height="16">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    </button>
  );
}
