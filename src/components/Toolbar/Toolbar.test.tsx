import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Editor } from 'slate';
import { Slate } from 'slate-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRichTextEditor } from '../../core/createEditor';
import { Toolbar } from './Toolbar';

afterEach(cleanup);

function renderToolbar(overrides: Partial<React.ComponentProps<typeof Toolbar>> = {}) {
  const editor = createRichTextEditor();
  const initialValue = [{ type: 'paragraph' as const, children: [{ text: 'Toolbar test' }] }];
  const result = render(
    <Slate editor={editor} initialValue={initialValue} onChange={() => undefined}>
      <Toolbar variables={['name', 'email']} {...overrides} />
    </Slate>
  );
  return { editor, ...result };
}

describe('default toolbar tools', () => {
  const buttonTitles = [
    'Undo (Ctrl/⌘+Z)',
    'Redo (Ctrl+Y / ⌘+Shift+Z)',
    'Bold (Ctrl/⌘+B)',
    'Italic (Ctrl/⌘+I)',
    'Underline (Ctrl/⌘+U)',
    'Strikethrough (Ctrl/⌘+Shift+S)',
    'Inline Code (Ctrl/⌘+E)',
    'Decrease Font Size (Ctrl/⌘+Shift+,)',
    'Increase Font Size (Ctrl/⌘+Shift+.)',
    'Align Left',
    'Align Center',
    'Align Right',
    'Justify',
    'Blockquote',
    'Code Block',
    'Bulleted List',
    'Numbered List',
    'Link',
    'Insert Image',
    'Insert Video',
    'Insert Table',
  ];

  buttonTitles.forEach((title) => {
    it(`renders the ${title} tool`, () => {
      const { getByTitle } = renderToolbar();
      expect(getByTitle(title)).toBeTruthy();
    });
  });

  ['Block Type', 'Font Size', 'Insert Variable'].forEach((title) => {
    it(`renders the ${title} selector`, () => {
      const { getByTitle } = renderToolbar();
      expect(getByTitle(title)).toBeTruthy();
    });
  });

  it('offers paragraph and every heading level', () => {
    const { getByTitle } = renderToolbar();
    const options = Array.from((getByTitle('Block Type') as HTMLSelectElement).options).map(
      (option) => option.text
    );
    expect(options).toEqual([
      'Paragraph',
      'Heading 1',
      'Heading 2',
      'Heading 3',
      'Heading 4',
      'Heading 5',
      'Heading 6',
    ]);
  });

  it('offers every configured variable', () => {
    const { getByTitle } = renderToolbar();
    const options = Array.from((getByTitle('Insert Variable') as HTMLSelectElement).options).map(
      (option) => option.value
    );
    expect(options).toEqual(['', 'name', 'email']);
  });

  it('runs the link tool callback', () => {
    const onLinkClick = vi.fn();
    const { getByTitle } = renderToolbar({ onLinkClick });
    fireEvent.click(getByTitle('Link'));
    expect(onLinkClick).toHaveBeenCalledOnce();
  });

  it('runs the image tool callback', () => {
    const onImageClick = vi.fn();
    const { getByTitle } = renderToolbar({ onImageClick });
    fireEvent.click(getByTitle('Insert Image'));
    expect(onImageClick).toHaveBeenCalledOnce();
  });

  it('runs the video tool callback', () => {
    const onVideoClick = vi.fn();
    const { getByTitle } = renderToolbar({ onVideoClick });
    fireEvent.click(getByTitle('Insert Video'));
    expect(onVideoClick).toHaveBeenCalledOnce();
  });

  it('runs the table tool callback', () => {
    const onTableClick = vi.fn();
    const { getByTitle } = renderToolbar({ onTableClick });
    fireEvent.click(getByTitle('Insert Table'));
    expect(onTableClick).toHaveBeenCalledOnce();
  });

  it('runs formatting commands on completed clicks, including keyboard clicks', () => {
    const { editor, getByTitle } = renderToolbar();
    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    };
    const bold = getByTitle('Bold (Ctrl/⌘+B)');

    fireEvent.mouseDown(bold);
    expect(Editor.marks(editor)?.bold).not.toBe(true);
    fireEvent.click(bold, { detail: 0 });
    expect(Editor.marks(editor)?.bold).toBe(true);
  });
});
