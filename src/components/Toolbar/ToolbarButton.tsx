import React from 'react';

interface ToolbarButtonProps {
  /** Is the button in an active/pressed state */
  active?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Legacy pointer-down handler for selection-preserving editor actions */
  onMouseDown?: (event: React.MouseEvent) => void;
  /** Optional completed-click handler for actions that open overlays */
  onClick?: (event: React.MouseEvent) => void;
  /** Tooltip text */
  title?: string;
  /** Button content (usually an icon) */
  children: React.ReactNode;
}

/**
 * A single toolbar button.
 * Prevents pointer-down focus changes while executing actions on completed clicks.
 */
export function ToolbarButton({
  active,
  disabled = false,
  onMouseDown,
  onClick,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`rte-toolbar-button${active ? ' rte-toolbar-button--active' : ''}`}
      aria-pressed={active}
      disabled={disabled}
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onClick={(event) => {
        if (onClick) {
          onClick(event);
        } else if (onMouseDown && event.detail === 0) {
          // Preserve keyboard activation for consumers still using onMouseDown.
          onMouseDown(event);
        }
      }}
    >
      {children}
    </button>
  );
}
