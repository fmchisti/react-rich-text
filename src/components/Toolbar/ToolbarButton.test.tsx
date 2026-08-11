import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToolbarButton } from './ToolbarButton';

afterEach(cleanup);

describe('ToolbarButton accessibility', () => {
  it('exposes active and inactive toggle state with aria-pressed', () => {
    const { getByRole, rerender } = render(
      <ToolbarButton active onMouseDown={vi.fn()} title="Bold">
        B
      </ToolbarButton>
    );

    expect(getByRole('button').getAttribute('aria-pressed')).toBe('true');

    rerender(
      <ToolbarButton active={false} onMouseDown={vi.fn()} title="Bold">
        B
      </ToolbarButton>
    );

    expect(getByRole('button').getAttribute('aria-pressed')).toBe('false');
  });

  it('does not mark action buttons as toggles', () => {
    const { getByRole } = render(
      <ToolbarButton onMouseDown={vi.fn()} title="Undo">
        Undo
      </ToolbarButton>
    );

    expect(getByRole('button').hasAttribute('aria-pressed')).toBe(false);
  });

  it('keeps pointer-down and completed-click actions separate', () => {
    const onMouseDown = vi.fn();
    const onClick = vi.fn();
    const { getByRole } = render(
      <ToolbarButton onMouseDown={onMouseDown} onClick={onClick} title="Insert Link">
        Link
      </ToolbarButton>
    );

    fireEvent.mouseDown(getByRole('button'));
    expect(onMouseDown).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();

    fireEvent.click(getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('keeps legacy pointer handlers keyboard-accessible', () => {
    const onMouseDown = vi.fn();
    const { getByRole } = render(
      <ToolbarButton onMouseDown={onMouseDown} title="Legacy action">
        Action
      </ToolbarButton>
    );

    fireEvent.click(getByRole('button'), { detail: 0 });
    expect(onMouseDown).toHaveBeenCalledOnce();
  });
});
