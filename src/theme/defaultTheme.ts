import type { RichTextTheme } from '../core/types';

/**
 * Default theme tokens.
 * Every token maps to a --rte-* CSS custom property.
 */
export const defaultTheme: RichTextTheme = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontSize: '16px',
  lineHeight: '1.7',
  textColor: '#1a1a2e',
  backgroundColor: '#ffffff',
  borderColor: '#d1d5db',
  borderRadius: '8px',
  padding: '16px',
  focusRingColor: '#3b82f6',
  toolbarBg: '#f9fafb',
  toolbarBorderColor: '#e5e7eb',
  buttonHoverBg: '#e5e7eb',
  buttonActiveBg: '#dbeafe',
  buttonActiveColor: '#2563eb',
  codeBg: '#f3f4f6',
  codeFont: '"JetBrains Mono", "Fira Code", "Cascadia Code", Consolas, monospace',
  blockquoteBorderColor: '#3b82f6',
  blockquoteBg: '#eff6ff',
  imageBorderRadius: '8px',
  linkColor: '#2563eb',
  placeholderColor: '#9ca3af',
  variableBg: '#fef3c7',
  variableColor: '#92400e',
  variableBorderColor: '#fbbf24',
  hoveringToolbarBg: '#1e293b',
  hoveringToolbarColor: '#f1f5f9',
  hoveringToolbarShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
};
