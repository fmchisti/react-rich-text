import { Editor, Transforms, Element as SlateElement } from 'slate';
import type { Align } from '../types';

const ALIGNABLE_TYPES = ['paragraph', 'heading', 'blockquote', 'list-item'] as const;

function isAlignableElement(
  n: unknown
): n is SlateElement & { align?: Align; type: (typeof ALIGNABLE_TYPES)[number] } {
  return (
    SlateElement.isElement(n) &&
    ALIGNABLE_TYPES.includes((n as any).type)
  );
}

/**
 * Get the alignment of the block at the current selection.
 * Returns undefined if selection spans mixed alignments or no alignable block.
 */
export function getBlockAlign(editor: Editor): Align | undefined {
  const { selection } = editor;
  if (!selection) return undefined;

  const [node] = Editor.nodes(editor, {
    at: Editor.unhangRange(editor, selection),
    match: isAlignableElement,
  });

  if (!node) return undefined;
  const el = node[0] as SlateElement & { align?: Align };
  return el.align;
}

/**
 * Set alignment for the block(s) at the current selection.
 */
export function setBlockAlign(editor: Editor, align: Align): void {
  const { selection } = editor;
  if (!selection) return;

  Transforms.setNodes(
    editor,
    { align } as any,
    {
      at: selection,
      match: isAlignableElement,
    }
  );
}
