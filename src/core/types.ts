import type { BaseEditor, Descendant } from 'slate';
import type { ReactEditor } from 'slate-react';
import type { HistoryEditor } from 'slate-history';

// ---------------------------------------------------------------------------
// Mark Types
// ---------------------------------------------------------------------------

export type MarkType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';

export type FormattedText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  fontSize?: number;
  fontColor?: string;
};

// ---------------------------------------------------------------------------
// Element Types
// ---------------------------------------------------------------------------

/** Text alignment for block elements */
export type Align = 'left' | 'center' | 'right' | 'justify';

export type ParagraphElement = {
  type: 'paragraph';
  align?: Align;
  children: Descendant[];
};

export type HeadingElement = {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  align?: Align;
  children: Descendant[];
};

export type BlockquoteElement = {
  type: 'blockquote';
  align?: Align;
  children: Descendant[];
};

export type CodeBlockElement = {
  type: 'code-block';
  language?: string;
  children: Descendant[];
};

export type BulletedListElement = {
  type: 'bulleted-list';
  children: Descendant[];
};

export type NumberedListElement = {
  type: 'numbered-list';
  children: Descendant[];
};

export type ListItemElement = {
  type: 'list-item';
  align?: Align;
  children: Descendant[];
};

export type LinkElement = {
  type: 'link';
  url: string;
  children: Descendant[];
};

export type ImageElement = {
  type: 'image';
  url: string;
  alt?: string;
  children: [{ text: '' }];
};

export type VariableElement = {
  type: 'variable';
  /** The variable name, e.g. "name", "email", "company" */
  name: string;
  children: [{ text: '' }];
};

export type VideoProvider = 'youtube' | 'vimeo' | 'dailymotion' | 'loom' | 'wistia' | 'direct';

export type VideoElement = {
  type: 'video';
  /** The original URL provided by the user */
  url: string;
  /** The embed-ready URL (iframe src) */
  embedUrl: string;
  /** Detected provider */
  provider: VideoProvider;
  /** Optional caption */
  caption?: string;
  children: [{ text: '' }];
};

export type TableElement = {
  type: 'table';
  /** Column widths in pixels. Length must match column count. When set, columns are resizable and fixed. */
  colWidths?: number[];
  children: Descendant[];
};

export type TableRowElement = {
  type: 'table-row';
  children: Descendant[];
};

export type TableCellElement = {
  type: 'table-cell';
  /** When true, render as <th> */
  header?: boolean;
  children: Descendant[];
};

export type CustomElement =
  | ParagraphElement
  | HeadingElement
  | BlockquoteElement
  | CodeBlockElement
  | BulletedListElement
  | NumberedListElement
  | ListItemElement
  | LinkElement
  | ImageElement
  | VariableElement
  | VideoElement
  | TableElement
  | TableRowElement
  | TableCellElement;

export type CustomText = FormattedText;

// ---------------------------------------------------------------------------
// Editor Type
// ---------------------------------------------------------------------------

export type RichTextEditor = BaseEditor & ReactEditor & HistoryEditor;

// ---------------------------------------------------------------------------
// Block & Element Type Helpers
// ---------------------------------------------------------------------------

export type BlockType = CustomElement['type'];

export const LIST_TYPES: BlockType[] = ['bulleted-list', 'numbered-list'];
export const VOID_TYPES: BlockType[] = ['image', 'variable', 'video'];
export const INLINE_TYPES: BlockType[] = ['link', 'variable'];

// ---------------------------------------------------------------------------
// Plugin Type
// ---------------------------------------------------------------------------

export type EditorPlugin = (editor: RichTextEditor) => RichTextEditor;

// ---------------------------------------------------------------------------
// Toolbar Config Types
// ---------------------------------------------------------------------------

export type ToolbarItemMark = {
  type: 'mark';
  mark: MarkType;
  icon?: React.ReactNode;
  tooltip?: string;
};

export type ToolbarItemBlock = {
  type: 'block';
  block: BlockType;
  icon?: React.ReactNode;
  tooltip?: string;
};

export type ToolbarItemHeadingSelect = {
  type: 'heading-select';
};

export type ToolbarItemLink = {
  type: 'link';
};

export type ToolbarItemImage = {
  type: 'image';
};

export type ToolbarItemFontSize = {
  type: 'font-size';
};

export type ToolbarItemVariable = {
  type: 'variable';
  /** List of available variable names to show in the dropdown */
  variables?: string[];
};

export type ToolbarItemVideo = {
  type: 'video';
};

export type ToolbarItemTable = {
  type: 'table';
  icon?: React.ReactNode;
  tooltip?: string;
};

export type ToolbarItemAlign = {
  type: 'align';
  align: Align;
  icon?: React.ReactNode;
  tooltip?: string;
};

export type ToolbarItemCustom = {
  type: 'custom';
  render: (editor: RichTextEditor) => React.ReactNode;
};

export type ToolbarItem =
  | ToolbarItemMark
  | ToolbarItemBlock
  | ToolbarItemHeadingSelect
  | ToolbarItemLink
  | ToolbarItemImage
  | ToolbarItemVideo
  | ToolbarItemTable
  | ToolbarItemFontSize
  | ToolbarItemAlign
  | ToolbarItemVariable
  | ToolbarItemCustom;

export type ToolbarGroup = {
  items: ToolbarItem[];
};

export type ToolbarConfig = {
  groups: ToolbarGroup[];
};

// ---------------------------------------------------------------------------
// Theme Types
// ---------------------------------------------------------------------------

export interface RichTextTheme {
  fontFamily: string;
  fontSize: string;
  lineHeight: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  padding: string;
  focusRingColor: string;
  toolbarBg: string;
  toolbarBorderColor: string;
  buttonHoverBg: string;
  buttonActiveBg: string;
  buttonActiveColor: string;
  codeBg: string;
  codeFont: string;
  blockquoteBorderColor: string;
  blockquoteBg: string;
  imageBorderRadius: string;
  linkColor: string;
  placeholderColor: string;
  variableBg: string;
  variableColor: string;
  variableBorderColor: string;
  hoveringToolbarBg: string;
  hoveringToolbarColor: string;
  hoveringToolbarShadow: string;
}

// ---------------------------------------------------------------------------
// Hovering Toolbar Config
// ---------------------------------------------------------------------------

/** Item ids for the hovering toolbar. Use in `order` to control visibility and order. */
export type HoveringToolbarItemId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'code'
  | 'fontSize'
  | 'alignLeft'
  | 'alignCenter'
  | 'alignRight'
  | 'alignJustify'
  | 'fontColor'
  | 'link'
  | 'divider';

export interface HoveringToolbarConfig {
  /** Show bold button. Default: true */
  bold?: boolean;
  /** Show italic button. Default: true */
  italic?: boolean;
  /** Show underline button. Default: true */
  underline?: boolean;
  /** Show strikethrough button. Default: true in full mode */
  strikethrough?: boolean;
  /** Show inline code button. Default: true in full mode */
  code?: boolean;
  /** Show link button. Default: true */
  link?: boolean;
  /** Show font color picker. Default: true */
  fontColor?: boolean;
  /** Custom color palette for font color picker */
  colors?: string[];
  /** Show heading select dropdown. Default: true in full mode */
  headingSelect?: boolean;
  /** Show font size controls. Default: true in full mode */
  fontSize?: boolean;
  /** Show blockquote button. Default: true in full mode */
  blockquote?: boolean;
  /** Show code block button. Default: true in full mode */
  codeBlock?: boolean;
  /** Show bulleted list button. Default: true in full mode */
  bulletedList?: boolean;
  /** Show numbered list button. Default: true in full mode */
  numberedList?: boolean;
  /** Show image insert button. Default: true in full mode */
  image?: boolean;
  /** Show video insert button. Default: true in full mode */
  video?: boolean;
  /** Show variable insert dropdown. Default: true in full mode */
  variable?: boolean;
  /** Show alignment buttons (left, center, right, justify). Default: true */
  align?: boolean;
  /**
   * Order of items in the hovering toolbar. Only listed items are shown, in this order.
   * Use 'divider' to insert a vertical divider. Omit to use default order.
   * @example ['bold', 'italic', 'underline', 'divider', 'alignLeft', 'alignCenter', 'alignRight', 'alignJustify', 'divider', 'link', 'fontColor']
   */
  order?: HoveringToolbarItemId[];
}

// ---------------------------------------------------------------------------
// Custom context menu command (user-defined items in right-click menu)
// ---------------------------------------------------------------------------

export interface CustomContextMenuCommand {
  id: string;
  label: string;
  description?: string;
  category?: string;
  keywords?: string[];
  /** SVG path(s) for 24x24 viewBox icon */
  iconPaths?: string;
  action: { type: 'custom'; customId: string };
}

// ---------------------------------------------------------------------------
// Slash Menu Config
// ---------------------------------------------------------------------------

export interface SlashMenuConfig {
  /** Enable right-click context menu. Default: true */
  enabled?: boolean;
  /** Custom commands shown in the context menu (e.g. insert custom block) */
  customCommands?: CustomContextMenuCommand[];
  /** Called when a custom command is selected. Use to insert content or run logic. */
  onContextMenuCommand?: (customId: string, editor: RichTextEditor) => void;
}

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

export interface RichTextEditorProps {
  /** Controlled value */
  value?: Descendant[];
  /** Uncontrolled default value */
  defaultValue?: Descendant[];
  /** Called on every change */
  onChange?: (value: Descendant[]) => void;

  /** Placeholder text */
  placeholder?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Auto-focus on mount */
  autoFocus?: boolean;

  /** Additional Slate plugins applied after built-in plugins */
  plugins?: EditorPlugin[];
  /** Theme overrides */
  theme?: Partial<RichTextTheme>;

  /** Toolbar config. `true` = default toolbar, `false` = hidden, object = custom config */
  toolbar?: boolean | ToolbarConfig;

  /** List of available variable names for {{variable}} insertion (e.g. ['name', 'email', 'company']) */
  variables?: string[];

  /** Hovering toolbar shown on text selection. `true` = default, `false` = disabled, object = custom config */
  hoveringToolbar?: boolean | HoveringToolbarConfig;

  /** Right-click context menu for inserting blocks/media. `true` = default, `false` = disabled */
  slashMenu?: boolean | SlashMenuConfig;

  /** Override element rendering. Return undefined to use default. */
  renderElement?: (props: any) => JSX.Element | undefined;
  /** Override leaf rendering. Return undefined to use default. */
  renderLeaf?: (props: any) => JSX.Element | undefined;

  /** Focus event */
  onFocus?: () => void;
  /** Blur event */
  onBlur?: () => void;
  /** KeyDown event - return true to prevent default handling */
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;

  /** Called with serialized HTML on every change */
  onHTMLChange?: (html: string) => void;
  /** Called with serialized Markdown on every change */
  onMarkdownChange?: (md: string) => void;

  /** Additional className on the root container */
  className?: string;
  /** Inline styles on the root container */
  style?: React.CSSProperties;
  /** Minimum height of the editable area (number = px, e.g. 200 or "20rem") */
  minHeight?: number | string;
  /** Additional className on the editable area */
  editorClassName?: string;

  /**
   * When provided, the image insert flow shows an "Upload" option.
   * Callback receives the selected file; upload it (e.g. to your server/S3) and return the image URL.
   * That URL is then used to insert the image.
   */
  onImageUpload?: (file: File) => Promise<string>;
}

// ---------------------------------------------------------------------------
// Slate Module Augmentation
// ---------------------------------------------------------------------------

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: FormattedText;
  }
}
