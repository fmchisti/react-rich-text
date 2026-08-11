import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Descendant } from 'slate';

const contextMenuSpies = vi.hoisted(() => ({
  toggleBlock: vi.fn(),
  insertVariable: vi.fn(),
  insertRowAbove: vi.fn(),
  insertRowBelow: vi.fn(),
  insertColumnLeft: vi.fn(),
  insertColumnRight: vi.fn(),
  deleteRow: vi.fn(),
  deleteColumn: vi.fn(),
  deleteTable: vi.fn(),
}));

vi.mock('../core/utils/blocks', async () => ({
  ...(await vi.importActual<typeof import('../core/utils/blocks')>('../core/utils/blocks')),
  toggleBlock: contextMenuSpies.toggleBlock,
}));

vi.mock('../core/plugins/withVariables', async () => ({
  ...(await vi.importActual<typeof import('../core/plugins/withVariables')>('../core/plugins/withVariables')),
  insertVariable: contextMenuSpies.insertVariable,
}));

vi.mock('../core/plugins/withTables', async () => ({
  ...(await vi.importActual<typeof import('../core/plugins/withTables')>('../core/plugins/withTables')),
  isInTable: () => true,
  insertRowAbove: contextMenuSpies.insertRowAbove,
  insertRowBelow: contextMenuSpies.insertRowBelow,
  insertColumnLeft: contextMenuSpies.insertColumnLeft,
  insertColumnRight: contextMenuSpies.insertColumnRight,
  deleteRow: contextMenuSpies.deleteRow,
  deleteColumn: contextMenuSpies.deleteColumn,
  deleteTable: contextMenuSpies.deleteTable,
}));

import { RichTextEditor } from './RichTextEditor';

const VALUE: Descendant[] = [{ type: 'paragraph', children: [{ text: 'Context menu test' }] }];

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function renderOpenContextMenu(slashMenu: React.ComponentProps<typeof RichTextEditor>['slashMenu'] = true) {
  const result = render(
    <RichTextEditor
      defaultValue={VALUE}
      toolbar={false}
      hoveringToolbar={false}
      slashMenu={slashMenu}
      variables={['customer_name', 'invoice_id']}
    />
  );
  fireEvent.contextMenu(result.getByRole('textbox'), { clientX: 24, clientY: 32 });
  return result;
}

function clickOption(result: ReturnType<typeof render>, label: string) {
  const option = result.getAllByText(label)
    .map((match) => match.closest('button'))
    .find((match): match is HTMLButtonElement => match !== null);
  if (!option) throw new Error(`Missing context-menu option: ${label}`);
  fireEvent.click(option);
}

describe('RichTextEditor context-menu block dispatch', () => {
  it.each([
    ['Paragraph', 'paragraph', undefined],
    ['Heading 1', 'heading', 1],
    ['Heading 2', 'heading', 2],
    ['Heading 3', 'heading', 3],
    ['Blockquote', 'blockquote', undefined],
    ['Code Block', 'code-block', undefined],
    ['Bulleted List', 'bulleted-list', undefined],
    ['Numbered List', 'numbered-list', undefined],
  ] as const)('dispatches %s', (label, block, level) => {
    const result = renderOpenContextMenu();
    clickOption(result, label);

    if (level) {
      expect(contextMenuSpies.toggleBlock).toHaveBeenCalledWith(expect.anything(), block, level);
    } else {
      expect(contextMenuSpies.toggleBlock).toHaveBeenCalledWith(expect.anything(), block);
    }
  });
});

describe('RichTextEditor context-menu insert dispatch', () => {
  it.each([
    ['Link', 'Insert Link'],
    ['Image', 'Insert image'],
    ['Video', 'Insert Video'],
    ['Table', 'Insert table'],
  ] as const)('opens the %s dialog', (label, dialogText) => {
    const result = renderOpenContextMenu();
    clickOption(result, label);
    expect(result.getByRole('dialog').textContent).toContain(dialogText);
  });

  it('inserts the selected variable', () => {
    const result = renderOpenContextMenu();
    clickOption(result, 'Variable');
    clickOption(result, '{{invoice_id}}');
    expect(contextMenuSpies.insertVariable).toHaveBeenCalledWith(
      expect.anything(),
      'invoice_id'
    );
  });

  it('dispatches a custom command to the configured callback', () => {
    const onContextMenuCommand = vi.fn();
    const result = renderOpenContextMenu({
      enabled: true,
      customCommands: [{
        id: 'insert-signature',
        label: 'Insert Signature',
        action: { type: 'custom', customId: 'signature' },
      }],
      onContextMenuCommand,
    });
    clickOption(result, 'Insert Signature');
    expect(onContextMenuCommand).toHaveBeenCalledWith('signature', expect.anything());
  });
});

describe('RichTextEditor context-menu table dispatch', () => {
  it.each([
    ['Insert row above', contextMenuSpies.insertRowAbove],
    ['Insert row below', contextMenuSpies.insertRowBelow],
    ['Insert column left', contextMenuSpies.insertColumnLeft],
    ['Insert column right', contextMenuSpies.insertColumnRight],
    ['Delete row', contextMenuSpies.deleteRow],
    ['Delete column', contextMenuSpies.deleteColumn],
    ['Delete table', contextMenuSpies.deleteTable],
  ] as const)('dispatches %s', (label, action) => {
    const result = renderOpenContextMenu();
    clickOption(result, label);
    expect(action).toHaveBeenCalledWith(expect.anything());
  });
});

describe('RichTextEditor context-menu availability', () => {
  it('does not open when disabled', () => {
    const result = render(
      <RichTextEditor
        defaultValue={VALUE}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={false}
      />
    );
    fireEvent.contextMenu(result.getByRole('textbox'));
    expect(result.queryByRole('listbox')).toBeNull();
  });

  it('does not open when the configuration is explicitly disabled', () => {
    const result = render(
      <RichTextEditor
        defaultValue={VALUE}
        toolbar={false}
        hoveringToolbar={false}
        slashMenu={{ enabled: false }}
      />
    );
    fireEvent.contextMenu(result.getByRole('textbox'));
    expect(result.queryByRole('listbox')).toBeNull();
  });

  it('does not open in read-only mode', () => {
    const result = render(
      <RichTextEditor
        defaultValue={VALUE}
        readOnly
        toolbar={false}
        hoveringToolbar={false}
      />
    );
    const readOnlyEditor = result.container.querySelector<HTMLElement>('[data-slate-editor="true"]');
    expect(readOnlyEditor).not.toBeNull();
    fireEvent.contextMenu(readOnlyEditor!);
    expect(result.queryByRole('listbox')).toBeNull();
  });
});

describe('RichTextEditor context-menu search', () => {
  it('focuses search, filters by keyword, and executes the filtered command', async () => {
    const result = renderOpenContextMenu();
    const searchbox = result.getByRole('searchbox', { name: 'Search context menu' });

    await waitFor(() => expect(document.activeElement).toBe(searchbox));
    fireEvent.change(searchbox, { target: { value: 'youtube' } });

    expect(result.getByText('Video')).toBeTruthy();
    expect(result.queryByText('Paragraph')).toBeNull();
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(result.getByRole('dialog').textContent).toContain('Insert Video');
  });

  it('clears search when the menu closes and reopens', () => {
    const result = renderOpenContextMenu();
    const searchbox = result.getByRole('searchbox', { name: 'Search context menu' });

    fireEvent.change(searchbox, { target: { value: 'h2' } });
    expect((searchbox as HTMLInputElement).value).toBe('h2');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(result.queryByRole('searchbox')).toBeNull();

    fireEvent.contextMenu(result.getByRole('textbox'), { clientX: 40, clientY: 48 });
    expect((result.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(result.getByText('Paragraph')).toBeTruthy();
  });
});
