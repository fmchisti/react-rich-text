import React from 'react';

interface ToolbarButtonProps {
  /** Is the button in an active/pressed state */
  active?: boolean;
  /** Disable the button */
  disabled?: boolean;
  /** Click handler - uses onMouseDown to prevent blur */
  onMouseDown: (event: React.MouseEvent) => void;
  /** Tooltip text */
  title?: string;
  /** Button content (usually an icon) */
  children: React.ReactNode;
}

/**
 * A single toolbar button.
 * Uses onMouseDown instead of onClick to avoid stealing focus from the editor.
 */
export function ToolbarButton({
  active = false,
  disabled = false,
  onMouseDown,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`rte-toolbar-button${active ? ' rte-toolbar-button--active' : ''}`}
      disabled={disabled}
      title={title}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown(event);
      }}
    >
      {children}
    </button>
  );
}
