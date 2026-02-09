import React from 'react';

interface ToolbarSelectProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  options: { value: string; label: string }[];
}

/**
 * A dropdown select control for the toolbar (e.g., heading level).
 * Uses onMouseDown to prevent blur.
 */
export function ToolbarSelect({ value, onChange, title, options }: ToolbarSelectProps) {
  return (
    <select
      className="rte-toolbar-select"
      value={value}
      title={title}
      onChange={(e) => onChange(e.target.value)}
      onMouseDown={(e) => {
        // Don't prevent default on select - it needs native behavior
        e.stopPropagation();
      }}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
