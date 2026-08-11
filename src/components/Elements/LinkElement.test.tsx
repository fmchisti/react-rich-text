import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LinkElement } from './LinkElement';

afterEach(cleanup);

function renderLink(url: string) {
  return render(
    <LinkElement
      attributes={{} as any}
      element={{ type: 'link', url, children: [{ text: 'Link' }] } as any}
    >
      Link
    </LinkElement>
  );
}

describe('LinkElement', () => {
  it('prevents regular navigation and opens one modified click', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null);
    const { getByRole } = renderLink('https://example.com');
    const link = getByRole('link');

    expect(fireEvent.click(link)).toBe(false);
    expect(open).not.toHaveBeenCalled();
    expect(fireEvent.click(link, { metaKey: true })).toBe(false);
    expect(open).toHaveBeenCalledTimes(1);
    open.mockRestore();
  });

  it('does not render an href for unsafe schemes', () => {
    const { queryByRole, getByText } = renderLink('javascript:alert(1)');
    expect(queryByRole('link')).toBeNull();
    expect(getByText('Link').hasAttribute('href')).toBe(false);
  });
});
