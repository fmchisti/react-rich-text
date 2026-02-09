import React from 'react';

/**
 * Minimal SVG icons for the toolbar.
 * Stroke-based icons that inherit color from the parent.
 */

export const BoldIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

export const ItalicIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

export const UnderlineIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

export const StrikethroughIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M16 4c-1.5-1-3.2-1.5-5-1.5C7.7 2.5 5 4.5 5 7.5c0 1.5.5 2.5 1.5 3.5" />
    <path d="M19 16.5c0 3-2.7 5-6 5-1.8 0-3.5-.5-5-1.5" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

export const CodeIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const Heading1Icon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M17 12l3-2v10" />
  </svg>
);

export const Heading2Icon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 12h8" />
    <path d="M4 18V6" />
    <path d="M12 18V6" />
    <path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1" />
  </svg>
);

export const BlockquoteIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 8z" />
  </svg>
);

export const CodeBlockIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="9 8 5 12 9 16" />
    <polyline points="15 8 19 12 15 16" />
  </svg>
);

export const BulletListIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const NumberListIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 4.5h1V9" />
    <path d="M4 14.5c.7-.7 1.5-1 2-1 .5 0 1 .5 1 1s-.5 1.5-3 3.5h4" />
  </svg>
);

export const LinkIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ImageIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

export const UndoIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export const RedoIcon = () => (
  <svg viewBox="0 0 24 24">
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

export const FontSizeIncreaseIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 19l5.5-14h1L16 19" />
    <line x1="6.5" y1="14" x2="13.5" y2="14" />
    <line x1="20" y1="7" x2="20" y2="13" />
    <line x1="17" y1="10" x2="23" y2="10" />
  </svg>
);

export const FontSizeDecreaseIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M4 19l5.5-14h1L16 19" />
    <line x1="6.5" y1="14" x2="13.5" y2="14" />
    <line x1="17" y1="10" x2="23" y2="10" />
  </svg>
);

export const VideoIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="2" y="4" width="14" height="16" rx="2" />
    <path d="M16 10l6-4v12l-6-4z" />
  </svg>
);

export const VariableIcon = () => (
  <svg viewBox="0 0 24 24">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    <path d="M8 12h.01" fill="currentColor" stroke="none" />
    <path d="M16 12h.01" fill="currentColor" stroke="none" />
    <path d="M12 8v8" />
  </svg>
);

export const AlignLeftIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="14" y2="12" />
    <line x1="4" y1="18" x2="18" y2="18" />
  </svg>
);

export const AlignCenterIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="5" y1="18" x2="19" y2="18" />
  </svg>
);

export const AlignRightIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="6" y1="18" x2="20" y2="18" />
  </svg>
);

export const AlignJustifyIcon = () => (
  <svg viewBox="0 0 24 24">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

export const TableIcon = () => (
  <svg viewBox="0 0 24 24">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);
