import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import type { RichTextEditor as RichTextEditorInstance } from '../core/types';
import { RichTextEditor } from './RichTextEditor';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.scrollTop = 0;
  document.documentElement.scrollLeft = 0;
});

describe('RichTextEditor controlled value', () => {
  it('applies external value changes', async () => {
    const first: Descendant[] = [{ type: 'paragraph', children: [{ text: 'First' }] }];
    const second: Descendant[] = [{ type: 'paragraph', children: [{ text: 'Second' }] }];
    const { getByRole, rerender } = render(
      <RichTextEditor value={first} toolbar={false} hoveringToolbar={false} slashMenu={false} />
    );

    rerender(
      <RichTextEditor value={second} toolbar={false} hoveringToolbar={false} slashMenu={false} />
    );

    await waitFor(() => expect(getByRole('textbox').textContent).toBe('Second'));
  });
});

describe('RichTextEditor variable values', () => {
  const value: Descendant[] = [{
    type: 'paragraph',
    children: [
      { text: 'Signed by ' },
      { type: 'variable', name: 'client_signature', children: [{ text: '' }] } as any,
    ],
  }];

  it('renders a dynamic image without replacing the variable in the document', () => {
    const { getByRole } = render(
      <RichTextEditor
        defaultValue={value}
        readOnly
        variableValues={{
          client_signature: {
            type: 'image',
            src: 'data:image/png;base64,c2lnbmF0dXJl',
            alt: 'Client signature',
            width: 180,
            height: 60,
          },
        }}
      />
    );

    const image = getByRole('img', { name: 'Client signature' });
    expect(image.getAttribute('src')).toBe('data:image/png;base64,c2lnbmF0dXJl');
    expect(image.getAttribute('width')).toBe('180');
    expect(image.getAttribute('height')).toBe('60');
  });

  it('updates resolved values when client data changes', () => {
    const { getByText, rerender } = render(
      <RichTextEditor
        defaultValue={value}
        readOnly
        variableValues={{ client_signature: 'Pending signature' }}
      />
    );

    expect(getByText('Pending signature')).toBeTruthy();
    rerender(
      <RichTextEditor
        defaultValue={value}
        readOnly
        variableValues={{ client_signature: 'Signed' }}
      />
    );
    expect(getByText('Signed')).toBeTruthy();
  });

  it('keeps the variable chip when no runtime value is supplied', () => {
    const { getByText } = render(
      <RichTextEditor defaultValue={value} readOnly />
    );
    expect(getByText('client_signature')).toBeTruthy();
  });
});

describe('RichTextEditor click-to-caret behavior', () => {
  it('places the caret at the document end when space below the final block is clicked', async () => {
    let editor: RichTextEditorInstance | undefined;
    const captureEditor = (instance: RichTextEditorInstance) => {
      editor = instance;
      return instance;
    };
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'First' }] },
      { type: 'paragraph', children: [{ text: 'Last line' }] },
    ];
    const { getByRole } = render(
      <RichTextEditor
        defaultValue={value}
        plugins={[captureEditor]}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={false}
      />
    );

    const textbox = getByRole('textbox');
    vi.spyOn(textbox.lastElementChild as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 60,
    } as DOMRect);

    fireEvent.mouseDown(textbox, { clientY: 100 });
    expect(editor?.selection).toEqual({
      anchor: { path: [1, 0], offset: 9 },
      focus: { path: [1, 0], offset: 9 },
    });
    await waitFor(() => expect(document.activeElement).toBe(getByRole('textbox')));
  });

  it('does not force a document-end selection from side padding beside content', () => {
    let editor: RichTextEditorInstance | undefined;
    const captureEditor = (instance: RichTextEditorInstance) => {
      editor = instance;
      return instance;
    };
    const { getByRole } = render(
      <RichTextEditor
        defaultValue={[
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Last line' }] },
        ]}
        plugins={[captureEditor]}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={false}
      />
    );
    const textbox = getByRole('textbox');
    vi.spyOn(textbox.lastElementChild as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
    } as DOMRect);

    expect(fireEvent.mouseDown(textbox, { clientY: 40 })).toBe(true);
    expect(editor?.selection).toBeNull();
  });

  it('resolves side-padding clicks from the nearest text-edge coordinate', async () => {
    let editor: RichTextEditorInstance | undefined;
    const captureEditor = (instance: RichTextEditorInstance) => {
      editor = instance;
      return instance;
    };
    const { getByRole } = render(
      <RichTextEditor
        defaultValue={[
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Last line' }] },
        ]}
        plugins={[captureEditor]}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={false}
      />
    );
    const textbox = getByRole('textbox');
    vi.spyOn(textbox, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 300,
    } as DOMRect);
    vi.spyOn(textbox.lastElementChild as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
    } as DOMRect);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({
      paddingLeft: '16px',
      paddingRight: '16px',
    } as CSSStyleDeclaration);
    const findEventRange = vi.spyOn(ReactEditor, 'findEventRange').mockReturnValue({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    vi.spyOn(ReactEditor, 'focus').mockImplementation(() => {
      document.documentElement.scrollTop = 900;
      textbox.focus();
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    document.documentElement.scrollTop = 240;

    expect(fireEvent.mouseDown(textbox, { clientX: 2, clientY: 40 })).toBe(false);
    expect(findEventRange).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ clientX: 17, clientY: 40 })
    );
    expect(editor?.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    expect(document.documentElement.scrollTop).toBe(240);
    await waitFor(() => expect(document.activeElement).toBe(textbox));
  });

  it('focuses the empty paragraph when the empty editor is clicked', async () => {
    let editor: RichTextEditorInstance | undefined;
    const captureEditor = (instance: RichTextEditorInstance) => {
      editor = instance;
      return instance;
    };
    const { getByRole } = render(
      <RichTextEditor
        defaultValue={[{ type: 'paragraph', children: [{ text: '' }] }]}
        plugins={[captureEditor]}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={false}
      />
    );

    fireEvent.mouseDown(getByRole('textbox'));
    expect(editor?.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    });
    await waitFor(() => expect(document.activeElement).toBe(getByRole('textbox')));
  });
});

describe('RichTextEditor insert tools', () => {
  const value: Descendant[] = [{ type: 'paragraph', children: [{ text: 'Insert here' }] }];

  it('opens the link dialog', async () => {
    const { getByRole, getByTitle } = render(
      <RichTextEditor defaultValue={value} hoveringToolbar={false} slashMenu={false} />
    );
    fireEvent.click(getByTitle('Link'));
    await waitFor(() => expect(getByRole('dialog').textContent).toContain('Insert Link'));
  });

  it('opens the image dialog', async () => {
    const { getByRole, getByTitle } = render(
      <RichTextEditor defaultValue={value} hoveringToolbar={false} slashMenu={false} />
    );
    fireEvent.click(getByTitle('Insert Image'));
    await waitFor(() => expect(getByRole('dialog').textContent).toContain('Insert image'));
  });

  it('opens the video dialog', async () => {
    const { getByRole, getByTitle } = render(
      <RichTextEditor defaultValue={value} hoveringToolbar={false} slashMenu={false} />
    );
    fireEvent.click(getByTitle('Insert Video'));
    await waitFor(() => expect(getByRole('dialog').textContent).toContain('Insert Video'));
  });

  it('opens the table dialog', async () => {
    const { getByRole, getByTitle } = render(
      <RichTextEditor defaultValue={value} hoveringToolbar={false} slashMenu={false} />
    );
    fireEvent.click(getByTitle('Insert Table'));
    await waitFor(() => expect(getByRole('dialog').textContent).toContain('Insert table'));
  });

  it('opens the table dialog from the context menu after a physical click sequence', async () => {
    const { getByRole, getByText, queryByRole } = render(
      <RichTextEditor defaultValue={value} toolbar={false} hoveringToolbar={false} />
    );
    fireEvent.contextMenu(getByRole('textbox'), { clientX: 20, clientY: 20 });
    const table = getByText('Table').closest('button')!;
    fireEvent.mouseDown(table);
    expect(queryByRole('dialog')).toBeNull();
    fireEvent.click(table);
    await waitFor(() => expect(getByRole('dialog').textContent).toContain('Insert table'));
  });
});

describe('RichTextEditor untrusted elements', () => {
  it('derives video embed URLs from the source URL instead of persisted embedUrl fields', () => {
    const value: Descendant[] = [{
      type: 'video',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      embedUrl: 'https://attacker.example/embed',
      provider: 'youtube',
      children: [{ text: '' }],
    } as any];
    const { getByTitle } = render(
      <RichTextEditor defaultValue={value} readOnly />
    );
    expect(getByTitle('YouTube video').getAttribute('src')).toBe(
      'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'
    );
  });

  it('does not render an iframe for an invalid persisted video', () => {
    const value: Descendant[] = [{
      type: 'video',
      url: 'https://attacker.example/video',
      embedUrl: 'https://attacker.example/embed',
      provider: 'youtube',
      children: [{ text: '' }],
    } as any];
    const { container, getByText } = render(
      <RichTextEditor defaultValue={value} readOnly />
    );
    expect(container.querySelector('iframe')).toBeNull();
    expect(getByText('Unsupported video')).toBeTruthy();
  });
});

describe('RichTextEditor read-only links', () => {
  it('allows native link navigation in read-only mode', () => {
    const value: Descendant[] = [{
      type: 'paragraph',
      children: [{
        type: 'link',
        url: '#destination',
        children: [{ text: 'Read-only link' }],
      } as any],
    }];
    const { getByRole } = render(<RichTextEditor defaultValue={value} readOnly />);
    expect(fireEvent.click(getByRole('link'))).toBe(true);
  });
});
