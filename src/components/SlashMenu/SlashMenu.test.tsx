import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { SlashMenu } from './SlashMenu';
import { SLASH_COMMANDS, TABLE_CONTEXT_COMMANDS } from './slashCommands';

beforeAll(() => {
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
  });
});

afterEach(cleanup);

describe('SlashMenu variable keyboard navigation', () => {
  it('selects variables with ArrowDown and Enter', () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        variables={['first', 'second']}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(getByText('Variable').closest('button')!);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    fireEvent.keyDown(document, { key: 'Enter' });

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'variable' }),
      'second'
    );
  });

  it('returns to the main menu with Escape', () => {
    const { getByText } = render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        variables={['name']}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(getByText('Variable').closest('button')!);
    expect(getByText('{{name}}')).toBeTruthy();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getByText('Paragraph')).toBeTruthy();
  });

  it('executes the same custom command that pointer and keyboard highlighting show', () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        customCommands={[{
          id: 'custom-text',
          label: 'Custom Text',
          category: 'text',
          action: { type: 'custom', customId: 'custom-text' },
        }]}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    );

    fireEvent.mouseEnter(getByText('Custom Text').closest('button')!);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'custom-text' })
    );
  });

  it('waits for a completed click before selecting a command', () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <SlashMenu
        open
        search="table"
        anchorPos={{ top: 0, left: 0 }}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    );
    const table = getByText('Table').closest('button')!;

    fireEvent.mouseDown(table);
    expect(onSelect).not.toHaveBeenCalled();
    fireEvent.click(table);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'table' }));
  });
});

describe('SlashMenu complete command matrix', () => {
  it.each(SLASH_COMMANDS.filter((command) => command.action.type !== 'variable'))(
    'selects $label with a completed pointer click',
    (command) => {
      const onSelect = vi.fn();
      const { getByText } = render(
        <SlashMenu
          open
          search=""
          anchorPos={{ top: 0, left: 0 }}
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      );

      fireEvent.click(getByText(command.label).closest('button')!);
      expect(onSelect).toHaveBeenCalledWith(command);
    }
  );

  it.each(SLASH_COMMANDS.filter((command) => command.action.type !== 'variable'))(
    'selects the highlighted $label command with Enter',
    (command) => {
      const onSelect = vi.fn();
      const { getByText } = render(
        <SlashMenu
          open
          search=""
          anchorPos={{ top: 0, left: 0 }}
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      );

      fireEvent.mouseEnter(getByText(command.label).closest('button')!);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(command);
    }
  );

  it.each(TABLE_CONTEXT_COMMANDS)(
    'selects table action $label with a completed pointer click',
    (command) => {
      const onSelect = vi.fn();
      const { getByText } = render(
        <SlashMenu
          open
          search=""
          anchorPos={{ top: 0, left: 0 }}
          inTable
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      );

      fireEvent.click(getByText(command.label).closest('button')!);
      expect(onSelect).toHaveBeenCalledWith(command);
    }
  );

  it.each(TABLE_CONTEXT_COMMANDS)(
    'selects highlighted table action $label with Enter',
    (command) => {
      const onSelect = vi.fn();
      const { getByText } = render(
        <SlashMenu
          open
          search=""
          anchorPos={{ top: 0, left: 0 }}
          inTable
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      );

      fireEvent.mouseEnter(getByText(command.label).closest('button')!);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(command);
    }
  );

  it.each(['first_name', 'account_id'])(
    'selects configured variable %s with a pointer click',
    (variableName) => {
      const onSelect = vi.fn();
      const { getByText } = render(
        <SlashMenu
          open
          search=""
          anchorPos={{ top: 0, left: 0 }}
          variables={['first_name', 'account_id']}
          onSelect={onSelect}
          onClose={vi.fn()}
        />
      );

      fireEvent.click(getByText('Variable').closest('button')!);
      fireEvent.click(getByText(`{{${variableName}}}`).closest('button')!);
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'variable' }),
        variableName
      );
    }
  );

  it('returns from the variable submenu with the Back button', () => {
    const { getByText } = render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        variables={['name']}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.click(getByText('Variable').closest('button')!);
    fireEvent.click(getByText('Back').closest('button')!);
    expect(getByText('Paragraph')).toBeTruthy();
  });

  it('returns to the main command list after closing and reopening', () => {
    const props = {
      search: '',
      anchorPos: { top: 0, left: 0 },
      variables: ['name'],
      onSelect: vi.fn(),
      onClose: vi.fn(),
    };
    const { getByText, rerender } = render(<SlashMenu {...props} open />);
    fireEvent.click(getByText('Variable').closest('button')!);
    expect(getByText('{{name}}')).toBeTruthy();

    rerender(<SlashMenu {...props} open={false} />);
    rerender(<SlashMenu {...props} open />);
    expect(getByText('Paragraph')).toBeTruthy();
  });

  it('shows table actions only while inside a table', () => {
    const props = {
      open: true,
      search: '',
      anchorPos: { top: 0, left: 0 },
      onSelect: vi.fn(),
      onClose: vi.fn(),
    };
    const { queryByText, rerender } = render(<SlashMenu {...props} />);
    expect(queryByText('Insert row above')).toBeNull();

    rerender(<SlashMenu {...props} inTable />);
    expect(queryByText('Insert row above')).toBeTruthy();
  });
});

describe('SlashMenu filtering and dismissal', () => {
  it('filters commands by keyword', () => {
    const { getByText, queryByText } = render(
      <SlashMenu
        open
        search="youtube"
        anchorPos={{ top: 0, left: 0 }}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(getByText('Video')).toBeTruthy();
    expect(queryByText('Paragraph')).toBeNull();
  });

  it('focuses the search field and filters interactively by keyword', async () => {
    const onSearchChange = vi.fn();
    const onSelect = vi.fn();
    const { getByRole, getByText, queryByText } = render(
      <SlashMenu
        open
        search=""
        onSearchChange={onSearchChange}
        anchorPos={{ top: 0, left: 0 }}
        onSelect={onSelect}
        onClose={vi.fn()}
      />
    );
    const searchbox = getByRole('searchbox', { name: 'Search context menu' });

    await waitFor(() => expect(document.activeElement).toBe(searchbox));
    fireEvent.change(searchbox, { target: { value: 'youtube' } });

    expect(onSearchChange).toHaveBeenLastCalledWith('youtube');
    expect(getByText('Video')).toBeTruthy();
    expect(queryByText('Paragraph')).toBeNull();

    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'video' }));
  });

  it('clears an interactive search and restores every command', () => {
    const { getByRole, getByText, queryByText } = render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );
    const searchbox = getByRole('searchbox', { name: 'Search context menu' });

    fireEvent.change(searchbox, { target: { value: 'h2' } });
    expect(getByText('Heading 2')).toBeTruthy();
    expect(queryByText('Paragraph')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Clear context menu search' }));
    expect((searchbox as HTMLInputElement).value).toBe('');
    expect(getByText('Paragraph')).toBeTruthy();
  });

  it('filters table actions together with the standard commands', () => {
    const { getByRole, getByText, queryByText } = render(
      <SlashMenu
        open
        search=""
        inTable
        anchorPos={{ top: 0, left: 0 }}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />
    );

    fireEvent.change(getByRole('searchbox'), { target: { value: 'delete column' } });
    expect(getByText('Delete column')).toBeTruthy();
    expect(queryByText('Delete row')).toBeNull();
    expect(queryByText('Paragraph')).toBeNull();
  });

  it('closes the main menu with Escape', () => {
    const onClose = vi.fn();
    render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        onSelect={vi.fn()}
        onClose={onClose}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes after an outside pointer down', async () => {
    const onClose = vi.fn();
    render(
      <SlashMenu
        open
        search=""
        anchorPos={{ top: 0, left: 0 }}
        onSelect={vi.fn()}
        onClose={onClose}
      />
    );

    await new Promise((resolve) => setTimeout(resolve, 15));
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('renders nothing when closed and an empty state when no commands match', () => {
    const props = {
      anchorPos: { top: 0, left: 0 },
      onSelect: vi.fn(),
      onClose: vi.fn(),
    };
    const { queryByRole, rerender } = render(
      <SlashMenu {...props} open={false} search="" />
    );
    expect(queryByRole('listbox')).toBeNull();

    rerender(<SlashMenu {...props} open search="no-command-can-match-this" />);
    expect(queryByRole('listbox')).toBeTruthy();
    expect(queryByRole('searchbox')).toBeTruthy();
    expect(queryByRole('option')).toBeNull();
    expect(queryByRole('listbox')?.textContent).toContain('No commands found');
  });
});
