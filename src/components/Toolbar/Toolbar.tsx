import React, { useCallback } from 'react';
import { useSlate } from 'slate-react';
import { HistoryEditor } from 'slate-history';
import type { ToolbarConfig, ToolbarItem, MarkType, BlockType, Align } from '../../core/types';
import { isMarkActive, toggleMark } from '../../core/utils/marks';
import { isBlockActive, toggleBlock } from '../../core/utils/blocks';
import { getBlockAlign, setBlockAlign } from '../../core/utils/alignment';
import {
  getCurrentFontSize,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
  FONT_SIZE_SCALE,
  DEFAULT_FONT_SIZE,
} from '../../core/utils/fontSize';
import { isLinkActive } from '../../core/plugins/withLinks';
import { insertVariable } from '../../core/plugins/withVariables';
import { insertTable } from '../../core/plugins/withTables';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarDivider } from './ToolbarDivider';
import { ToolbarSelect } from './ToolbarSelect';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  CodeIcon,
  BlockquoteIcon,
  CodeBlockIcon,
  BulletListIcon,
  NumberListIcon,
  LinkIcon,
  ImageIcon,
  UndoIcon,
  RedoIcon,
  FontSizeIncreaseIcon,
  FontSizeDecreaseIcon,
  VideoIcon,
  VariableIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TableIcon,
} from './icons';

// ---------------------------------------------------------------------------
// Icon & label maps
// ---------------------------------------------------------------------------

const MARK_ICONS: Record<MarkType, React.ReactNode> = {
  bold: <BoldIcon />,
  italic: <ItalicIcon />,
  underline: <UnderlineIcon />,
  strikethrough: <StrikethroughIcon />,
  code: <CodeIcon />,
};

const MARK_LABELS: Record<MarkType, string> = {
  bold: 'Bold (Ctrl+B)',
  italic: 'Italic (Ctrl+I)',
  underline: 'Underline (Ctrl+U)',
  strikethrough: 'Strikethrough (Ctrl+Shift+S)',
  code: 'Inline Code (Ctrl+E)',
};

const BLOCK_ICONS: Partial<Record<BlockType, React.ReactNode>> = {
  blockquote: <BlockquoteIcon />,
  'code-block': <CodeBlockIcon />,
  'bulleted-list': <BulletListIcon />,
  'numbered-list': <NumberListIcon />,
};

const BLOCK_LABELS: Partial<Record<BlockType, string>> = {
  blockquote: 'Blockquote',
  'code-block': 'Code Block',
  'bulleted-list': 'Bulleted List',
  'numbered-list': 'Numbered List',
};

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
];

const ALIGN_ICONS: Record<Align, React.ReactNode> = {
  left: <AlignLeftIcon />,
  center: <AlignCenterIcon />,
  right: <AlignRightIcon />,
  justify: <AlignJustifyIcon />,
};

const ALIGN_LABELS: Record<Align, string> = {
  left: 'Align Left',
  center: 'Align Center',
  right: 'Align Right',
  justify: 'Justify',
};

// ---------------------------------------------------------------------------
// Font size options for dropdown
// ---------------------------------------------------------------------------

const FONT_SIZE_OPTIONS = FONT_SIZE_SCALE.map((size) => ({
  value: String(size),
  label: `${size}px`,
}));

// ---------------------------------------------------------------------------
// Default toolbar config
// ---------------------------------------------------------------------------

export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  groups: [
    {
      items: [
        { type: 'mark', mark: 'bold' },
        { type: 'mark', mark: 'italic' },
        { type: 'mark', mark: 'underline' },
        { type: 'mark', mark: 'strikethrough' },
        { type: 'mark', mark: 'code' },
      ],
    },
    {
      items: [{ type: 'heading-select' }],
    },
    {
      items: [{ type: 'font-size' }],
    },
    {
      items: [
        { type: 'align', align: 'left' },
        { type: 'align', align: 'center' },
        { type: 'align', align: 'right' },
        { type: 'align', align: 'justify' },
      ],
    },
    {
      items: [
        { type: 'block', block: 'blockquote' },
        { type: 'block', block: 'code-block' },
        { type: 'block', block: 'bulleted-list' },
        { type: 'block', block: 'numbered-list' },
      ],
    },
    {
      items: [{ type: 'link' }, { type: 'image' }, { type: 'video' }, { type: 'table' }],
    },
    {
      items: [{ type: 'variable' }],
    },
  ],
};

// ---------------------------------------------------------------------------
// Toolbar Component
// ---------------------------------------------------------------------------

/** Default variable names when none are provided */
const DEFAULT_VARIABLES = ['name', 'email', 'company', 'date', 'phone', 'address'];

export interface ToolbarProps {
  config?: ToolbarConfig;
  /** Available variable names for the variable insertion dropdown */
  variables?: string[];
  /** Called when user clicks the link button */
  onLinkClick?: (e?: React.MouseEvent) => void;
  /** Called when user clicks the image button */
  onImageClick?: (e?: React.MouseEvent) => void;
  /** Called when user clicks the video button */
  onVideoClick?: (e?: React.MouseEvent) => void;
  /** Called when user clicks the table button (opens table insert modal when provided) */
  onTableClick?: (e?: React.MouseEvent) => void;
}

export function Toolbar({
  config = DEFAULT_TOOLBAR_CONFIG,
  variables,
  onLinkClick,
  onImageClick,
  onVideoClick,
  onTableClick,
}: ToolbarProps) {
  const editor = useSlate();

  // Determine current heading value for the select
  const getHeadingValue = useCallback((): string => {
    for (let level = 1; level <= 6; level++) {
      if (isBlockActive(editor, 'heading', level)) {
        return `heading-${level}`;
      }
    }
    return 'paragraph';
  }, [editor]);

  const handleHeadingChange = useCallback(
    (value: string) => {
      if (value === 'paragraph') {
        toggleBlock(editor, 'paragraph');
      } else {
        const level = parseInt(value.split('-')[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
        toggleBlock(editor, 'heading', level);
      }
    },
    [editor]
  );

  const renderItem = (item: ToolbarItem, index: number) => {
    switch (item.type) {
      case 'mark':
        return (
          <ToolbarButton
            key={`mark-${item.mark}-${index}`}
            active={isMarkActive(editor, item.mark)}
            title={item.tooltip ?? MARK_LABELS[item.mark]}
            onMouseDown={() => toggleMark(editor, item.mark)}
          >
            {item.icon ?? MARK_ICONS[item.mark]}
          </ToolbarButton>
        );

      case 'block':
        return (
          <ToolbarButton
            key={`block-${item.block}-${index}`}
            active={isBlockActive(editor, item.block)}
            title={item.tooltip ?? BLOCK_LABELS[item.block]}
            onMouseDown={() => toggleBlock(editor, item.block)}
          >
            {item.icon ?? BLOCK_ICONS[item.block]}
          </ToolbarButton>
        );

      case 'heading-select':
        return (
          <ToolbarSelect
            key={`heading-select-${index}`}
            value={getHeadingValue()}
            onChange={handleHeadingChange}
            title="Block Type"
            options={HEADING_OPTIONS}
          />
        );

      case 'link':
        return (
          <ToolbarButton
            key={`link-${index}`}
            active={isLinkActive(editor)}
            title="Link"
            onMouseDown={(e) => onLinkClick?.(e)}
          >
            <LinkIcon />
          </ToolbarButton>
        );

      case 'image':
        return (
          <ToolbarButton
            key={`image-${index}`}
            title="Insert Image"
            onMouseDown={(e) => onImageClick?.(e)}
          >
            <ImageIcon />
          </ToolbarButton>
        );

      case 'video':
        return (
          <ToolbarButton
            key={`video-${index}`}
            title="Insert Video"
            onMouseDown={(e) => onVideoClick?.(e)}
          >
            <VideoIcon />
          </ToolbarButton>
        );

      case 'table':
        return (
          <ToolbarButton
            key={`table-${index}`}
            title={item.tooltip ?? 'Insert Table'}
            onMouseDown={(e) => (onTableClick ? onTableClick(e) : insertTable(editor))}
          >
            {item.icon ?? <TableIcon />}
          </ToolbarButton>
        );

      case 'font-size':
        return (
          <React.Fragment key={`font-size-${index}`}>
            <ToolbarButton
              title="Decrease Font Size (Ctrl+Shift+,)"
              onMouseDown={() => decreaseFontSize(editor)}
            >
              <FontSizeDecreaseIcon />
            </ToolbarButton>
            <ToolbarSelect
              value={String(getCurrentFontSize(editor))}
              onChange={(val) => setFontSize(editor, parseInt(val, 10))}
              title="Font Size"
              options={FONT_SIZE_OPTIONS}
            />
            <ToolbarButton
              title="Increase Font Size (Ctrl+Shift+.)"
              onMouseDown={() => increaseFontSize(editor)}
            >
              <FontSizeIncreaseIcon />
            </ToolbarButton>
          </React.Fragment>
        );

      case 'align':
        return (
          <ToolbarButton
            key={`align-${item.align}-${index}`}
            active={getBlockAlign(editor) === item.align}
            title={item.tooltip ?? ALIGN_LABELS[item.align]}
            onMouseDown={() => setBlockAlign(editor, item.align)}
          >
            {item.icon ?? ALIGN_ICONS[item.align]}
          </ToolbarButton>
        );

      case 'variable': {
        const varList = item.variables ?? variables ?? DEFAULT_VARIABLES;
        const varOptions = varList.map((v) => ({ value: v, label: `{{${v}}}` }));
        return (
          <React.Fragment key={`variable-${index}`}>
            <ToolbarSelect
              value=""
              onChange={(val) => {
                if (val) insertVariable(editor, val);
              }}
              title="Insert Variable"
              options={[{ value: '', label: 'Insert {{var}}...' }, ...varOptions]}
            />
          </React.Fragment>
        );
      }

      case 'custom':
        return (
          <React.Fragment key={`custom-${index}`}>
            {item.render(editor as any)}
          </React.Fragment>
        );

      default:
        return null;
    }
  };

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Formatting options">
      {/* Undo / Redo */}
      <div className="rte-toolbar-group">
        <ToolbarButton
          title="Undo (Ctrl+Z)"
          onMouseDown={() => HistoryEditor.undo(editor as any)}
        >
          <UndoIcon />
        </ToolbarButton>
        <ToolbarButton
          title="Redo (Ctrl+Y)"
          onMouseDown={() => HistoryEditor.redo(editor as any)}
        >
          <RedoIcon />
        </ToolbarButton>
      </div>

      <ToolbarDivider />

      {/* Configured groups */}
      {config.groups.map((group, groupIdx) => (
        <React.Fragment key={`group-${groupIdx}`}>
          <div className="rte-toolbar-group">
            {group.items.map((item, itemIdx) => renderItem(item, itemIdx))}
          </div>
          {groupIdx < config.groups.length - 1 && <ToolbarDivider />}
        </React.Fragment>
      ))}

    </div>
  );
}
