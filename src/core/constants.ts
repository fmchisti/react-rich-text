import type { MarkType } from './types';

/**
 * Keyboard shortcut -> mark mappings
 */
export const HOTKEYS: Record<string, MarkType> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+shift+s': 'strikethrough',
  'mod+e': 'code',
};

/**
 * Default initial editor value
 */
export const DEFAULT_INITIAL_VALUE = [
  {
    type: 'paragraph' as const,
    children: [{ text: '' }],
  },
];
