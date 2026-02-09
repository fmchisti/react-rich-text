import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSlate } from 'slate-react';
import { Editor, Range } from 'slate';
import type { HoveringToolbarConfig, HoveringToolbarItemId } from '../../core/types';
import { isMarkActive, toggleMark } from '../../core/utils/marks';
import { isBlockActive, toggleBlock } from '../../core/utils/blocks';
import { isLinkActive, wrapLink, unwrapLink } from '../../core/plugins/withLinks';
import { insertVariable } from '../../core/plugins/withVariables';
import { getCurrentFontColor, setFontColor, DEFAULT_FONT_COLORS } from '../../core/utils/fontColor';
import {
  getCurrentFontSize,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
  FONT_SIZE_SCALE,
} from '../../core/utils/fontSize';
import { getBlockAlign, setBlockAlign } from '../../core/utils/alignment';
import type { Align } from '../../core/types';

// ---------------------------------------------------------------------------
// Compact inline SVG icons (16x16 for the hovering toolbar)
// ---------------------------------------------------------------------------

const HBoldIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
  </svg>
);

const HItalicIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="19" y1="4" x2="10" y2="4" />
    <line x1="14" y1="20" x2="5" y2="20" />
    <line x1="15" y1="4" x2="9" y2="20" />
  </svg>
);

const HUnderlineIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
    <line x1="4" y1="21" x2="20" y2="21" />
  </svg>
);

const HStrikethroughIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M16 4c-1.5-1-3.2-1.5-5-1.5C7.7 2.5 5 4.5 5 7.5c0 1.5.5 2.5 1.5 3.5" />
    <path d="M19 16.5c0 3-2.7 5-6 5-1.8 0-3.5-.5-5-1.5" />
    <line x1="2" y1="12" x2="22" y2="12" />
  </svg>
);

const HCodeIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const HLinkIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const HFontColorIcon = ({ color }: { color: string | null }) => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M5 18l3.5-9h1L13 18" />
    <line x1="6.5" y1="14.5" x2="11.5" y2="14.5" />
    <rect x="3" y="20" width="18" height="3" rx="1" fill={color ?? 'currentColor'} stroke="none" />
  </svg>
);

const HBlockquoteIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 8z" />
  </svg>
);

const HCodeBlockIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <polyline points="9 8 5 12 9 16" />
    <polyline points="15 8 19 12 15 16" />
  </svg>
);

const HBulletListIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const HNumberListIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="10" y1="6" x2="21" y2="6" />
    <line x1="10" y1="12" x2="21" y2="12" />
    <line x1="10" y1="18" x2="21" y2="18" />
    <path d="M4 4.5h1V9" />
    <path d="M4 14.5c.7-.7 1.5-1 2-1 .5 0 1 .5 1 1s-.5 1.5-3 3.5h4" />
  </svg>
);

const HImageIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const HVideoIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <rect x="2" y="4" width="14" height="16" rx="2" />
    <path d="M16 10l6-4v12l-6-4z" />
  </svg>
);

const HVariableIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    <path d="M8 12h.01" fill="currentColor" stroke="none" />
    <path d="M16 12h.01" fill="currentColor" stroke="none" />
    <path d="M12 8v8" />
  </svg>
);

const HFontSizeUpIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M4 19l5.5-14h1L16 19" />
    <line x1="6.5" y1="14" x2="13.5" y2="14" />
    <line x1="20" y1="7" x2="20" y2="13" />
    <line x1="17" y1="10" x2="23" y2="10" />
  </svg>
);

const HFontSizeDownIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path d="M4 19l5.5-14h1L16 19" />
    <line x1="6.5" y1="14" x2="13.5" y2="14" />
    <line x1="17" y1="10" x2="23" y2="10" />
  </svg>
);

const HAlignLeftIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="14" y2="12" />
    <line x1="4" y1="18" x2="18" y2="18" />
  </svg>
);
const HAlignCenterIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="5" y1="18" x2="19" y2="18" />
  </svg>
);
const HAlignRightIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <line x1="6" y1="18" x2="20" y2="18" />
  </svg>
);
const HAlignJustifyIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
);

// Small divider between groups
const HDivider = () => <span className="rte-hovering-divider" />;

// ---------------------------------------------------------------------------
// Heading / font size options
// ---------------------------------------------------------------------------

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'P' },
  { value: 'heading-1', label: 'H1' },
  { value: 'heading-2', label: 'H2' },
  { value: 'heading-3', label: 'H3' },
  { value: 'heading-4', label: 'H4' },
  { value: 'heading-5', label: 'H5' },
  { value: 'heading-6', label: 'H6' },
];

const FONT_SIZE_OPTIONS = FONT_SIZE_SCALE.map((s) => ({
  value: String(s),
  label: `${s}`,
}));

const ALIGN_OPTIONS: { align: Align; icon: React.ReactNode; title: string }[] = [
  { align: 'left', icon: <HAlignLeftIcon />, title: 'Align Left' },
  { align: 'center', icon: <HAlignCenterIcon />, title: 'Align Center' },
  { align: 'right', icon: <HAlignRightIcon />, title: 'Align Right' },
  { align: 'justify', icon: <HAlignJustifyIcon />, title: 'Justify' },
];

const DEFAULT_VARIABLES = ['name', 'email', 'company', 'date', 'phone', 'address'];

/** Default order when config.order is not set. User can override with config.order. */
const DEFAULT_HOVERING_ORDER: HoveringToolbarItemId[] = [
  'bold',
  'italic',
  'underline',
  'strikethrough',
  'code',
  'fontSize',
  'alignLeft',
  'alignCenter',
  'alignRight',
  'alignJustify',
  'fontColor',
  'link',
];

const SCROLL_STEP = 80;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface HoveringToolbarProps {
  config?: HoveringToolbarConfig;
  /** Whether the static toolbar is visible — controls minimal vs full mode */
  isToolbarVisible?: boolean;
  /** Callback to open the link modal */
  onLinkClick?: (e?: React.MouseEvent) => void;
  /** Callback to open the image modal */
  onImageClick?: (e?: React.MouseEvent) => void;
  /** Callback to open the video modal */
  onVideoClick?: (e?: React.MouseEvent) => void;
  /** Available variable names */
  variables?: string[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function isItemEnabled(id: HoveringToolbarItemId, resolved: Record<string, boolean>): boolean {
  if (id === 'divider') return true;
  const key = id === 'alignLeft' || id === 'alignCenter' || id === 'alignRight' || id === 'alignJustify' ? 'align' : id;
  return resolved[key] === true;
}

export function HoveringToolbar({
  config,
  isToolbarVisible = true,
  onLinkClick,
  onImageClick,
  onVideoClick,
  variables,
}: HoveringToolbarProps) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const editor = useSlate();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Determine full mode (when static toolbar is hidden)
  const fullMode = !isToolbarVisible;

  // Merge config with defaults — in full mode, enable all controls by default
  const resolved = {
    // Text formatting — always available
    bold: config?.bold ?? true,
    italic: config?.italic ?? true,
    underline: config?.underline ?? true,
    strikethrough: config?.strikethrough ?? fullMode,
    code: config?.code ?? fullMode,
    link: config?.link ?? true,
    fontColor: config?.fontColor ?? true,
    fontSize: config?.fontSize ?? fullMode,
    align: config?.align ?? true,
    // Block + insert controls are NEVER shown in hovering toolbar
    // (use slash commands / plus button instead)
    headingSelect: false,
    blockquote: false,
    codeBlock: false,
    bulletedList: false,
    numberedList: false,
    image: false,
    video: false,
    variable: false,
  };
  const colorPalette = config?.colors ?? DEFAULT_FONT_COLORS;
  const varList = variables ?? DEFAULT_VARIABLES;

  // Ordered list of item ids: use config.order or default, filter to enabled only
  const orderedIds = React.useMemo(() => {
    const order = config?.order ?? DEFAULT_HOVERING_ORDER;
    return order.filter((id) => isItemEnabled(id, resolved as Record<string, boolean>));
  }, [config, fullMode]);

  // Update scroll button visibility when scroll position or size changes
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const left = el.scrollLeft > 2;
    const right = el.scrollLeft < el.scrollWidth - el.clientWidth - 2;
    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  // Position the hovering toolbar above the selection
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const { selection } = editor;

    if (
      !selection ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection).trim() === ''
    ) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      setShowLinkInput(false);
      setShowColorPicker(false);
      return;
    }

    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
      return;
    }

    const elRect = el.getBoundingClientRect();
    const top = rect.top - elRect.height - 8 + window.scrollY;
    const left = rect.left + rect.width / 2 - elRect.width / 2 + window.scrollX;

    el.style.opacity = '1';
    el.style.pointerEvents = 'auto';
    el.style.top = `${Math.max(4, top)}px`;
    el.style.left = `${Math.max(4, left)}px`;
    setTimeout(updateScrollState, 0);
  });

  // Listen to scroll on the scroll container
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState);
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // ---- Handlers ----

  const handleLinkSubmit = useCallback(() => {
    if (linkUrl.trim()) {
      if (isLinkActive(editor)) unwrapLink(editor);
      wrapLink(editor, linkUrl.trim());
    }
    setShowLinkInput(false);
    setLinkUrl('');
  }, [editor, linkUrl]);

  const handleLinkClick = useCallback(
    (e?: React.MouseEvent) => {
      if (isLinkActive(editor)) {
        unwrapLink(editor);
        return;
      }
      // In full mode, use the modal callback if available
      if (fullMode && onLinkClick) {
        onLinkClick(e);
        return;
      }
      // Minimal mode: inline link input
      setShowColorPicker(false);
      setShowLinkInput(true);
      setTimeout(() => linkInputRef.current?.focus(), 0);
    },
    [editor, fullMode, onLinkClick]
  );

  const handleColorToggle = useCallback(() => {
    setShowLinkInput(false);
    setShowColorPicker((prev) => !prev);
  }, []);

  const handleColorSelect = useCallback(
    (color: string | null) => {
      setFontColor(editor, color);
      setShowColorPicker(false);
    },
    [editor]
  );

  const handleScrollLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrollRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
  }, []);

  const handleScrollRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    scrollRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
  }, []);

  // Heading helpers
  const getHeadingValue = useCallback((): string => {
    for (let level = 1; level <= 6; level++) {
      if (isBlockActive(editor, 'heading', level)) return `heading-${level}`;
    }
    return 'paragraph';
  }, [editor]);

  const handleHeadingChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'paragraph') {
        toggleBlock(editor, 'paragraph');
      } else {
        const level = parseInt(val.split('-')[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
        toggleBlock(editor, 'heading', level);
      }
    },
    [editor]
  );

  const currentColor = getCurrentFontColor(editor);

  // ---- Helper: render a toolbar button ----
  const btn = (
    key: string,
    icon: React.ReactNode,
    title: string,
    onClick: (e: React.MouseEvent) => void,
    active = false
  ) => (
    <button
      key={key}
      className={`rte-hovering-btn${active ? ' rte-hovering-btn--active' : ''}`}
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick(e);
      }}
    >
      {icon}
    </button>
  );

  // Render one item by id (for ordered single-line toolbar)
  const renderOrderedItem = (id: HoveringToolbarItemId, index: number) => {
    if (id === 'divider') return <HDivider key={`divider-${index}`} />;
    switch (id) {
      case 'bold':
        return btn('bold', <HBoldIcon />, 'Bold (Ctrl+B)', () => toggleMark(editor, 'bold'), isMarkActive(editor, 'bold'));
      case 'italic':
        return btn('italic', <HItalicIcon />, 'Italic (Ctrl+I)', () => toggleMark(editor, 'italic'), isMarkActive(editor, 'italic'));
      case 'underline':
        return btn('underline', <HUnderlineIcon />, 'Underline (Ctrl+U)', () => toggleMark(editor, 'underline'), isMarkActive(editor, 'underline'));
      case 'strikethrough':
        return btn('strikethrough', <HStrikethroughIcon />, 'Strikethrough', () => toggleMark(editor, 'strikethrough'), isMarkActive(editor, 'strikethrough'));
      case 'code':
        return btn('code', <HCodeIcon />, 'Inline Code', () => toggleMark(editor, 'code'), isMarkActive(editor, 'code'));
      case 'fontSize':
        return (
          <React.Fragment key="fontSize">
            {btn('fs-down', <HFontSizeDownIcon />, 'Decrease Font Size', () => decreaseFontSize(editor))}
            <select
              className="rte-hovering-select rte-hovering-select--narrow"
              value={String(getCurrentFontSize(editor))}
              onChange={(e) => setFontSize(editor, parseInt(e.target.value, 10))}
              onMouseDown={(e) => e.stopPropagation()}
              title="Font Size"
            >
              {FONT_SIZE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {btn('fs-up', <HFontSizeUpIcon />, 'Increase Font Size', () => increaseFontSize(editor))}
          </React.Fragment>
        );
      case 'alignLeft':
        return btn('align-left', <HAlignLeftIcon />, 'Align Left', () => setBlockAlign(editor, 'left'), getBlockAlign(editor) === 'left');
      case 'alignCenter':
        return btn('align-center', <HAlignCenterIcon />, 'Align Center', () => setBlockAlign(editor, 'center'), getBlockAlign(editor) === 'center');
      case 'alignRight':
        return btn('align-right', <HAlignRightIcon />, 'Align Right', () => setBlockAlign(editor, 'right'), getBlockAlign(editor) === 'right');
      case 'alignJustify':
        return btn('align-justify', <HAlignJustifyIcon />, 'Justify', () => setBlockAlign(editor, 'justify'), getBlockAlign(editor) === 'justify');
      case 'fontColor':
        return btn('font-color', <HFontColorIcon color={currentColor} />, 'Font Color', () => handleColorToggle(), !!currentColor);
      case 'link':
        return btn('link', <HLinkIcon />, 'Link', (e) => handleLinkClick(e), isLinkActive(editor));
      default:
        return null;
    }
  };

  return createPortal(
    <div
      ref={ref}
      className="rte-hovering-toolbar rte-hovering-toolbar--single-line"
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="rte-hovering-toolbar-outer">
        <button
          type="button"
          className="rte-hovering-scroll-btn rte-hovering-scroll-btn--left"
          aria-label="Scroll left"
          onMouseDown={handleScrollLeft}
          style={{ visibility: canScrollLeft ? 'visible' : 'hidden' }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <div
          ref={scrollRef}
          className="rte-hovering-toolbar-scroll"
          role="region"
          aria-label="Formatting options"
        >
          <div className="rte-hovering-toolbar-buttons">
            {orderedIds.map((id, index) => renderOrderedItem(id, index))}
          </div>
        </div>
        <button
          type="button"
          className="rte-hovering-scroll-btn rte-hovering-scroll-btn--right"
          aria-label="Scroll right"
          onMouseDown={handleScrollRight}
          style={{ visibility: canScrollRight ? 'visible' : 'hidden' }}
        >
          <svg viewBox="0 0 24 24" width="14" height="14"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Link input (minimal mode only) */}
      {showLinkInput && (
        <div className="rte-hovering-link-input">
          <input
            ref={linkInputRef}
            type="url"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); handleLinkSubmit(); }
              if (e.key === 'Escape') { setShowLinkInput(false); setLinkUrl(''); }
            }}
          />
          <button onMouseDown={(e) => { e.preventDefault(); handleLinkSubmit(); }}>
            Apply
          </button>
        </div>
      )}

      {/* Color picker */}
      {showColorPicker && (
        <div className="rte-hovering-color-picker">
          <button
            className="rte-hovering-color-swatch rte-hovering-color-swatch--remove"
            title="Remove color"
            onMouseDown={(e) => { e.preventDefault(); handleColorSelect(null); }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14">
              <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="2" />
              <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          {colorPalette.map((color) => (
            <button
              key={color}
              className={`rte-hovering-color-swatch${currentColor === color ? ' rte-hovering-color-swatch--selected' : ''}`}
              style={{ backgroundColor: color }}
              title={color}
              onMouseDown={(e) => { e.preventDefault(); handleColorSelect(color); }}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
