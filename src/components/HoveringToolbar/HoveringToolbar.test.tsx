import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Slate } from 'slate-react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { createRichTextEditor } from '../../core/createEditor';
import { HoveringToolbar } from './HoveringToolbar';

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    disconnect() {}
  }
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(cleanup);

describe('HoveringToolbar interactions', () => {
  it('opens the full-mode link action only after the click completes', () => {
    const editor = createRichTextEditor();
    const onLinkClick = vi.fn();
    const { getByTitle } = render(
      <Slate
        editor={editor}
        initialValue={[{ type: 'paragraph', children: [{ text: 'Link me' }] }]}
        onChange={() => undefined}
      >
        <HoveringToolbar isToolbarVisible={false} onLinkClick={onLinkClick} />
      </Slate>
    );
    const link = getByTitle('Link');

    fireEvent.mouseDown(link);
    expect(onLinkClick).not.toHaveBeenCalled();
    fireEvent.click(link);
    expect(onLinkClick).toHaveBeenCalledOnce();
  });
});
