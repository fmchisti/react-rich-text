import type { BlockType, CustomContextMenuCommand } from '../../core/types';

// ---------------------------------------------------------------------------
// Command types
// ---------------------------------------------------------------------------

export type TableActionType =
  | 'insert-row-above'
  | 'insert-row-below'
  | 'insert-column-left'
  | 'insert-column-right'
  | 'delete-row'
  | 'delete-column'
  | 'delete-table';

export type SlashCommandAction =
  | { type: 'block'; block: BlockType; level?: number }
  | { type: 'modal'; modal: 'link' | 'image' | 'video' }
  | { type: 'variable' }
  | { type: 'table'; tableAction: TableActionType }
  | { type: 'custom'; customId: string };

export interface SlashCommand {
  /** Unique id */
  id: string;
  /** Display label */
  label: string;
  /** Short description */
  description: string;
  /** Category for grouping */
  category: 'text' | 'list' | 'media' | 'insert' | 'custom';
  /** Keywords for search filtering */
  keywords: string[];
  /** SVG icon path(s) — rendered inside a 24x24 viewBox */
  iconPaths: string;
  /** What happens when selected */
  action: SlashCommandAction;
}

// Re-export for convenience
export type { CustomContextMenuCommand } from '../../core/types';

// ---------------------------------------------------------------------------
// All commands
// ---------------------------------------------------------------------------

export const SLASH_COMMANDS: SlashCommand[] = [
  // ---- Text ----
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Plain text block',
    category: 'text',
    keywords: ['p', 'paragraph', 'text', 'normal'],
    iconPaths: '<path d="M13 4v16"/><path d="M17 4v16"/><path d="M9 4a4 4 0 1 0 0 8h4"/>',
    action: { type: 'block', block: 'paragraph' },
  },
  {
    id: 'h1',
    label: 'Heading 1',
    description: 'Large heading',
    category: 'text',
    keywords: ['h1', 'heading', 'title', 'large'],
    iconPaths: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12l3-2v10"/>',
    action: { type: 'block', block: 'heading', level: 1 },
  },
  {
    id: 'h2',
    label: 'Heading 2',
    description: 'Medium heading',
    category: 'text',
    keywords: ['h2', 'heading', 'subtitle'],
    iconPaths: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/>',
    action: { type: 'block', block: 'heading', level: 2 },
  },
  {
    id: 'h3',
    label: 'Heading 3',
    description: 'Small heading',
    category: 'text',
    keywords: ['h3', 'heading'],
    iconPaths: '<path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.7-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .3 4-1.5a2 2 0 0 0-2-2"/>',
    action: { type: 'block', block: 'heading', level: 3 },
  },
  {
    id: 'blockquote',
    label: 'Blockquote',
    description: 'Quoted text block',
    category: 'text',
    keywords: ['quote', 'blockquote', 'q'],
    iconPaths: '<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 8z"/>',
    action: { type: 'block', block: 'blockquote' },
  },
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Syntax highlighted code',
    category: 'text',
    keywords: ['code', 'codeblock', 'pre', 'snippet'],
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 8 5 12 9 16"/><polyline points="15 8 19 12 15 16"/>',
    action: { type: 'block', block: 'code-block' },
  },

  // ---- Lists ----
  {
    id: 'bulleted-list',
    label: 'Bulleted List',
    description: 'Unordered list with bullets',
    category: 'list',
    keywords: ['bullet', 'ul', 'unordered', 'list'],
    iconPaths: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1" fill="currentColor" stroke="none"/>',
    action: { type: 'block', block: 'bulleted-list' },
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    category: 'list',
    keywords: ['number', 'ol', 'ordered', 'list'],
    iconPaths: '<line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 4.5h1V9"/><path d="M4 14.5c.7-.7 1.5-1 2-1 .5 0 1 .5 1 1s-.5 1.5-3 3.5h4"/>',
    action: { type: 'block', block: 'numbered-list' },
  },
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a table (choose rows & columns)',
    category: 'list',
    keywords: ['table', 'grid', 'rows', 'columns', 'cells'],
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/>',
    action: { type: 'block', block: 'table' },
  },

  // ---- Media ----
  {
    id: 'image',
    label: 'Image',
    description: 'Insert an image from URL',
    category: 'media',
    keywords: ['image', 'img', 'photo', 'picture'],
    iconPaths: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    action: { type: 'modal', modal: 'image' },
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Embed YouTube, Vimeo, or video file',
    category: 'media',
    keywords: ['video', 'youtube', 'vimeo', 'embed', 'movie'],
    iconPaths: '<rect x="2" y="4" width="14" height="16" rx="2"/><path d="M16 10l6-4v12l-6-4z"/>',
    action: { type: 'modal', modal: 'video' },
  },
  {
    id: 'link',
    label: 'Link',
    description: 'Insert a hyperlink',
    category: 'media',
    keywords: ['link', 'url', 'href', 'anchor'],
    iconPaths: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    action: { type: 'modal', modal: 'link' },
  },

  // ---- Insert ----
  {
    id: 'variable',
    label: 'Variable',
    description: 'Insert a template variable {{...}}',
    category: 'insert',
    keywords: ['variable', 'template', 'merge', 'tag', 'placeholder'],
    iconPaths: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M12 8v8"/>',
    action: { type: 'variable' },
  },
];

/**
 * Filter commands by search text (fuzzy match on label + keywords).
 */
export function filterCommands(search: string): SlashCommand[] {
  if (!search) return SLASH_COMMANDS;
  const lower = search.toLowerCase();
  return SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(lower) ||
      cmd.keywords.some((kw) => kw.includes(lower))
  );
}

/** Category labels for display */
export const CATEGORY_LABELS: Record<string, string> = {
  text: 'Text',
  list: 'Lists',
  media: 'Media',
  insert: 'Insert',
  custom: 'Custom',
};

/** Default icon for custom commands (small circle) */
const DEFAULT_CUSTOM_ICON = '<circle cx="12" cy="12" r="3"/>';

/**
 * Normalize and filter custom commands by search.
 */
export function filterCustomCommands(
  commands: CustomContextMenuCommand[] | undefined,
  search: string
): SlashCommand[] {
  if (!commands?.length) return [];
  const lower = search.toLowerCase();
  return commands
    .filter(
      (c) =>
        !lower ||
        c.label.toLowerCase().includes(lower) ||
        (c.keywords ?? []).some((k) => k.toLowerCase().includes(lower))
    )
    .map((c) => ({
      id: c.id,
      label: c.label,
      description: c.description ?? '',
      category: (c.category ?? 'custom') as SlashCommand['category'],
      keywords: c.keywords ?? [],
      iconPaths: c.iconPaths ?? DEFAULT_CUSTOM_ICON,
      action: c.action,
    }));
}

// ---------------------------------------------------------------------------
// Table context commands (shown when cursor is inside a table)
// ---------------------------------------------------------------------------

export interface TableContextCommand {
  id: string;
  label: string;
  action: { type: 'table'; tableAction: TableActionType };
  iconPaths: string;
}

export const TABLE_CONTEXT_COMMANDS: TableContextCommand[] = [
  {
    id: 'table-insert-row-above',
    label: 'Insert row above',
    action: { type: 'table', tableAction: 'insert-row-above' },
    iconPaths: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  },
  {
    id: 'table-insert-row-below',
    label: 'Insert row below',
    action: { type: 'table', tableAction: 'insert-row-below' },
    iconPaths: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  },
  {
    id: 'table-insert-column-left',
    label: 'Insert column left',
    action: { type: 'table', tableAction: 'insert-column-left' },
    iconPaths: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  },
  {
    id: 'table-insert-column-right',
    label: 'Insert column right',
    action: { type: 'table', tableAction: 'insert-column-right' },
    iconPaths: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  },
  {
    id: 'table-delete-row',
    label: 'Delete row',
    action: { type: 'table', tableAction: 'delete-row' },
    iconPaths: '<path d="M5 12h14"/><path d="M12 8v8"/>',
  },
  {
    id: 'table-delete-column',
    label: 'Delete column',
    action: { type: 'table', tableAction: 'delete-column' },
    iconPaths: '<path d="M12 5v14"/><path d="M8 12h8"/>',
  },
  {
    id: 'table-delete-table',
    label: 'Delete table',
    action: { type: 'table', tableAction: 'delete-table' },
    iconPaths: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7"/><path d="M3 10h18"/>',
  },
];
