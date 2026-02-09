// ---- Core Types ----
export type {
  MarkType,
  BlockType,
  Align,
  FormattedText,
  CustomElement,
  CustomText,
  ParagraphElement,
  HeadingElement,
  BlockquoteElement,
  CodeBlockElement,
  BulletedListElement,
  NumberedListElement,
  ListItemElement,
  LinkElement as LinkElementType,
  ImageElement as ImageElementType,
  VariableElement as VariableElementType,
  VideoElement as VideoElementType,
  VideoProvider,
  TableElement,
  TableRowElement,
  TableCellElement,
  ToolbarItemVariable,
  ToolbarItemVideo,
  ToolbarItemTable,
  HoveringToolbarConfig,
  HoveringToolbarItemId,
  SlashMenuConfig,
  RichTextEditor as RichTextEditorType,
  EditorPlugin,
  ToolbarConfig,
  ToolbarGroup,
  ToolbarItem,
  RichTextTheme,
  RichTextEditorProps,
} from './core/types';

// ---- Core ----
export { createRichTextEditor } from './core/createEditor';
export { HOTKEYS, DEFAULT_INITIAL_VALUE } from './core/constants';
export { LIST_TYPES, VOID_TYPES, INLINE_TYPES } from './core/types';

// ---- Utilities ----
export { isMarkActive, toggleMark } from './core/utils/marks';
export { isBlockActive, toggleBlock } from './core/utils/blocks';
export { indentListItem, outdentListItem } from './core/utils/lists';
export {
  FONT_SIZE_SCALE,
  DEFAULT_FONT_SIZE,
  MIN_FONT_SIZE,
  MAX_FONT_SIZE,
  getCurrentFontSize,
  setFontSize,
  increaseFontSize,
  decreaseFontSize,
} from './core/utils/fontSize';
export {
  DEFAULT_FONT_COLORS,
  getCurrentFontColor,
  setFontColor,
} from './core/utils/fontColor';

// ---- Plugins ----
export { withInlines } from './core/plugins/withInlines';
export { withImages, insertImage } from './core/plugins/withImages';
export { withLinks, wrapLink, unwrapLink, insertLink, isLinkActive } from './core/plugins/withLinks';
export { withShortcuts } from './core/plugins/withShortcuts';
export { withVariables, insertVariable } from './core/plugins/withVariables';
export { insertVideo } from './core/plugins/withVideos';
export {
  insertTable,
  isInTable,
  getTableDimensions,
  getTableSelection,
  insertRowAbove,
  insertRowBelow,
  insertColumnLeft,
  insertColumnRight,
  deleteRow,
  deleteColumn,
  deleteTable,
  selectNextTableCell,
  selectPreviousTableCell,
} from './core/plugins/withTables';
export type { TableSelection } from './core/plugins/withTables';
export { parseVideoUrl, VIDEO_PROVIDERS, type ParsedVideoUrl } from './core/utils/video';
export { getBlockAlign, setBlockAlign } from './core/utils/alignment';

// ---- Components ----
export { RichTextEditor } from './components/RichTextEditor';
export { Toolbar, DEFAULT_TOOLBAR_CONFIG } from './components/Toolbar/Toolbar';
export { ToolbarButton } from './components/Toolbar/ToolbarButton';
export { ToolbarDivider } from './components/Toolbar/ToolbarDivider';
export { ToolbarSelect } from './components/Toolbar/ToolbarSelect';
export { HoveringToolbar } from './components/HoveringToolbar';
export { InputModal, type InputModalProps, type ModalAnchorPos } from './components/InputModal';
export { LinkModal, type LinkModalProps } from './components/LinkModal';
export { SlashMenu, type SlashMenuProps, SLASH_COMMANDS, filterCommands, type SlashCommand } from './components/SlashMenu';

export {
  Paragraph,
  Heading,
  Blockquote,
  CodeBlock,
  BulletedList,
  NumberedList,
  ListItem,
  ImageElement,
  LinkElement,
  VariableElement,
  VideoElement,
  DefaultElement,
} from './components/Elements';
export { Leaf } from './components/Leaves';

// ---- Hooks ----
export { useRichTextEditor } from './hooks/useRichTextEditor';

// ---- Serializers ----
export { htmlSerializer } from './serializers/html';
export { markdownSerializer } from './serializers/markdown';
export { plaintextSerializer } from './serializers/plaintext';

// ---- Theme ----
export { defaultTheme } from './theme/defaultTheme';
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
