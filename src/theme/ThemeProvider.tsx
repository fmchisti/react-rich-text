import React, { createContext, useContext, useMemo } from 'react';
import type { RichTextTheme } from '../core/types';
import { defaultTheme } from './defaultTheme';

const ThemeContext = createContext<RichTextTheme>(defaultTheme);

/**
 * Hook to access the current theme.
 */
export function useTheme(): RichTextTheme {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  theme?: Partial<RichTextTheme>;
  children: React.ReactNode;
}

/**
 * Maps theme tokens to CSS custom property names.
 */
const TOKEN_TO_CSS: Record<keyof RichTextTheme, string> = {
  fontFamily: '--rte-font-family',
  fontSize: '--rte-font-size',
  lineHeight: '--rte-line-height',
  textColor: '--rte-text-color',
  backgroundColor: '--rte-bg-color',
  borderColor: '--rte-border-color',
  borderRadius: '--rte-border-radius',
  padding: '--rte-padding',
  focusRingColor: '--rte-focus-ring-color',
  toolbarBg: '--rte-toolbar-bg',
  toolbarBorderColor: '--rte-toolbar-border-color',
  buttonHoverBg: '--rte-button-hover-bg',
  buttonActiveBg: '--rte-button-active-bg',
  buttonActiveColor: '--rte-button-active-color',
  codeBg: '--rte-code-bg',
  codeFont: '--rte-code-font',
  blockquoteBorderColor: '--rte-blockquote-border-color',
  blockquoteBg: '--rte-blockquote-bg',
  imageBorderRadius: '--rte-image-border-radius',
  linkColor: '--rte-link-color',
  placeholderColor: '--rte-placeholder-color',
  variableBg: '--rte-variable-bg',
  variableColor: '--rte-variable-color',
  variableBorderColor: '--rte-variable-border-color',
  hoveringToolbarBg: '--rte-hovering-toolbar-bg',
  hoveringToolbarColor: '--rte-hovering-toolbar-color',
  hoveringToolbarShadow: '--rte-hovering-toolbar-shadow',
};

/**
 * Convert a theme object to CSS custom property inline styles.
 */
function themeToCSSVars(theme: RichTextTheme): React.CSSProperties {
  const vars: Record<string, string> = {};
  for (const [key, cssVar] of Object.entries(TOKEN_TO_CSS)) {
    const value = theme[key as keyof RichTextTheme];
    if (value) {
      vars[cssVar] = value;
    }
  }
  return vars as React.CSSProperties;
}

/**
 * ThemeProvider that injects CSS custom properties onto a wrapper div.
 * Merge user theme overrides with the default theme.
 */
export function ThemeProvider({ theme: userTheme, children }: ThemeProviderProps) {
  const mergedTheme = useMemo(
    () => ({ ...defaultTheme, ...userTheme }),
    [userTheme]
  );

  const cssVars = useMemo(() => themeToCSSVars(mergedTheme), [mergedTheme]);

  return (
    <ThemeContext.Provider value={mergedTheme}>
      <div style={cssVars}>{children}</div>
    </ThemeContext.Provider>
  );
}
