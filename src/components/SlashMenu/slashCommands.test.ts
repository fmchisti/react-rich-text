import { describe, expect, it } from 'vitest';
import type { CustomContextMenuCommand } from '../../core/types';
import { filterCustomCommands } from './slashCommands';

function command(iconPaths: string): CustomContextMenuCommand {
  return {
    id: 'custom',
    label: 'Custom',
    iconPaths,
    action: { type: 'custom', customId: 'custom' },
  };
}

describe('custom command icon sanitization', () => {
  it('preserves inert SVG geometry', () => {
    const [result] = filterCustomCommands([command('<rect x="3" y="3" width="18" height="18" rx="2"/>')], '');
    expect(result.iconPaths).toBe('<rect x="3" y="3" width="18" height="18" rx="2"/>');
  });

  it('rejects event handlers and active SVG elements', () => {
    const [eventHandler] = filterCustomCommands([command('<path d="M0 0" onload="alert(1)"/>')], '');
    const [script] = filterCustomCommands([command('<script>alert(1)</script>')], '');
    expect(eventHandler.iconPaths).not.toContain('onload');
    expect(script.iconPaths).not.toContain('script');
  });
});
