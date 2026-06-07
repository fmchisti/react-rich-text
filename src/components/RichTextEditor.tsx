import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Slate, Editable, ReactEditor, type RenderElementProps, type RenderLeafProps } from 'slate-react';
import type { Descendant } from 'slate';
import { Range, Editor, Transforms, Element as SlateElement } from 'slate';
import isHotkey from 'is-hotkey';

import type { RichTextEditorProps, ToolbarConfig, HoveringToolbarConfig, SlashMenuConfig } from '../core/types';
import { HOTKEYS } from '../core/constants';
import { DEFAULT_INITIAL_VALUE } from '../core/constants';
import { createRichTextEditor } from '../core/createEditor';
import { toggleMark } from '../core/utils/marks';
import { increaseFontSize, decreaseFontSize } from '../core/utils/fontSize';
import { isLinkActive, wrapLink, unwrapLink, insertLink } from '../core/plugins/withLinks';
import { insertImage } from '../core/plugins/withImages';
import { insertVideo } from '../core/plugins/withVideos';
import { insertVariable } from '../core/plugins/withVariables';
import {
  insertTable,
  isInTable,
  insertRowAbove,
  insertRowBelow,
  insertColumnLeft,
  insertColumnRight,
  deleteRow,
  deleteColumn,
  deleteTable,
  selectNextTableCell,
  selectPreviousTableCell,
} from '../core/plugins/withTables';
import { toggleBlock } from '../core/utils/blocks';
import { cloneRange, restoreSelection } from '../core/utils/selection';

import { ThemeProvider } from '../theme/ThemeProvider';
import { Toolbar, DEFAULT_TOOLBAR_CONFIG } from './Toolbar/Toolbar';
import { HoveringToolbar } from './HoveringToolbar';
import { InputModal, type ModalAnchorPos } from './InputModal';
import { LinkModal } from './LinkModal';
import { ImageModal } from './ImageModal';
import { TableInsertModal } from './TableInsertModal';
import { ImageIcon, VideoIcon } from './Toolbar/icons';
import { SlashMenu, type ContextMenuCommand } from './SlashMenu';
import { Leaf } from './Leaves/Leaf';
import {
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
  Table,
  TableRow,
  TableCell,
  DefaultElement,
} from './Elements';

// Import styles
import '../styles/editor.css';
import '../styles/toolbar.css';
import '../styles/hovering-toolbar.css';
import '../styles/modal.css';
import '../styles/slash-menu.css';

/** True when the document is a single empty paragraph (placeholder visible). */
function isDocumentEmpty(editor: Editor): boolean {
  const { children } = editor;
  if (children.length !== 1) return false;
  const first = children[0];
  if (!SlateElement.isElement(first) || first.type !== 'paragraph') return false;
  return Editor.isEmpty(editor, first);
}

/**
 * The main RichTextEditor component.
 *
 * Provides a ready-to-use rich text editing experience with a configurable
 * toolbar, keyboard shortcuts, theme support, and full rendering customization.
 *
 * @example
 * ```tsx
 * <RichTextEditor
 *   value={value}
 *   onChange={setValue}
 *   placeholder="Start writing..."
 * />
 * ```
 */
export function RichTextEditor({
  value,
  defaultValue,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  autoFocus = false,
  plugins,
  theme,
  toolbar = true,
  variables,
  hoveringToolbar = true,
  slashMenu: slashMenuProp = true,
  renderElement: userRenderElement,
  renderLeaf: userRenderLeaf,
  onFocus,
  onBlur,
  onKeyDown: userOnKeyDown,
  onHTMLChange,
  onMarkdownChange,
  className,
  style,
  minHeight,
  editorClassName,
  onImageUpload,
}: RichTextEditorProps) {
  // Editor is created once and persisted. Plugins are intentionally omitted from deps
  // so the editor identity stays stable; plugins are only applied at mount.
  const editor = useMemo(() => createRichTextEditor(plugins), []);

  // Track the current value for uncontrolled mode
  const internalValue = useRef<Descendant[]>(
    value ?? defaultValue ?? DEFAULT_INITIAL_VALUE
  );

  // Determine the initial value
  const initialValue = useMemo(
    () => value ?? defaultValue ?? DEFAULT_INITIAL_VALUE,
    [] // Only compute once on mount
  );

  // Resolve toolbar config
  const toolbarConfig: ToolbarConfig | false = useMemo(() => {
    if (toolbar === false) return false;
    if (toolbar === true) return DEFAULT_TOOLBAR_CONFIG;
    return toolbar;
  }, [toolbar]);

  // Resolve hovering toolbar config
  const hoveringConfig: HoveringToolbarConfig | false = useMemo(() => {
    if (hoveringToolbar === false) return false;
    if (hoveringToolbar === true) return {};
    return hoveringToolbar;
  }, [hoveringToolbar]);

  // Resolve slash menu config
  const slashConfig: SlashMenuConfig | false = useMemo(() => {
    if (slashMenuProp === false) return false;
    if (slashMenuProp === true) return { enabled: true };
    return slashMenuProp;
  }, [slashMenuProp]);

  // ---- Context menu (right-click) state ----
  const [ctxMenuOpen, setCtxMenuOpen] = useState(false);
  const [ctxMenuSearch, setCtxMenuSearch] = useState('');
  const [ctxMenuAnchor, setCtxMenuAnchor] = useState<ModalAnchorPos>({ top: 0, left: 0 });
  const [ctxMenuInTable, setCtxMenuInTable] = useState(false);

  /** Handle right-click on the editable area */
  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (readOnly || slashConfig === false) return;
      e.preventDefault();

      if (!rootRef.current) return;
      const rootRect = rootRef.current.getBoundingClientRect();

      setCtxMenuAnchor({
        top: e.clientY - rootRect.top,
        left: e.clientX - rootRect.left,
      });
      setCtxMenuSearch('');
      setCtxMenuInTable(isInTable(editor));
      setCtxMenuOpen(true);
    },
    [readOnly, slashConfig, editor]
  );

  // ---- Modal state ----
  const rootRef = useRef<HTMLDivElement>(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkHasSelection, setLinkHasSelection] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoError, setVideoError] = useState('');
  const [showTableInsertModal, setShowTableInsertModal] = useState(false);
  const [modalAnchor, setModalAnchor] = useState<ModalAnchorPos>({ top: 0, left: 0 });
  const savedSelectionRef = useRef<ReturnType<typeof cloneRange>>(null);
  const serializeGenRef = useRef(0);
  const isInternalChangeRef = useRef(false);

  const saveSelection = useCallback(() => {
    savedSelectionRef.current = cloneRange(editor.selection);
  }, [editor]);

  /** Calculate position relative to .rte-root from the clicked button */
  const getAnchorFromEvent = useCallback((e?: React.MouseEvent) => {
    if (!e || !rootRef.current) return { top: 48, left: 8 }; // fallback below toolbar
    const rootRect = rootRef.current.getBoundingClientRect();
    const btnEl = (e.target as HTMLElement).closest('.rte-toolbar-button') as HTMLElement | null;
    if (btnEl) {
      const btnRect = btnEl.getBoundingClientRect();
      return {
        top: btnRect.bottom - rootRect.top + 4,
        left: btnRect.left - rootRect.left,
      };
    }
    return {
      top: e.clientY - rootRect.top + 4,
      left: e.clientX - rootRect.left,
    };
  }, []);

  const handleLinkClick = useCallback((e?: React.MouseEvent) => {
    if (isLinkActive(editor)) {
      unwrapLink(editor);
    } else {
      saveSelection();
      const { selection } = editor;
      setLinkHasSelection(!!(selection && !Range.isCollapsed(selection)));
      setModalAnchor(getAnchorFromEvent(e));
      setShowLinkModal(true);
    }
  }, [editor, getAnchorFromEvent, saveSelection]);

  const handleLinkSubmit = useCallback(
    (url: string, text: string) => {
      restoreSelection(editor, savedSelectionRef.current);
      if (linkHasSelection) {
        wrapLink(editor, url);
      } else {
        insertLink(editor, url, text || url);
      }
      setShowLinkModal(false);
    },
    [editor, linkHasSelection]
  );

  const handleImageClick = useCallback((e?: React.MouseEvent) => {
    saveSelection();
    setModalAnchor(getAnchorFromEvent(e));
    setShowImageModal(true);
  }, [getAnchorFromEvent, saveSelection]);

  const handleImageSubmit = useCallback(
    (url: string) => {
      restoreSelection(editor, savedSelectionRef.current);
      insertImage(editor, url);
      setShowImageModal(false);
    },
    [editor]
  );

  const handleVideoClick = useCallback((e?: React.MouseEvent) => {
    saveSelection();
    setVideoError('');
    setModalAnchor(getAnchorFromEvent(e));
    setShowVideoModal(true);
  }, [getAnchorFromEvent, saveSelection]);

  const handleVideoSubmit = useCallback(
    (url: string) => {
      restoreSelection(editor, savedSelectionRef.current);
      const success = insertVideo(editor, url);
      if (success) {
        setShowVideoModal(false);
        setVideoError('');
      } else {
        setVideoError('Unrecognized URL. Supports YouTube, Vimeo, Dailymotion, Loom, Wistia, or .mp4/.webm/.ogg files.');
      }
    },
    [editor]
  );

  const handleTableClick = useCallback((e?: React.MouseEvent) => {
    saveSelection();
    setModalAnchor(getAnchorFromEvent(e));
    setShowTableInsertModal(true);
  }, [getAnchorFromEvent, saveSelection]);

  const handleTableInsert = useCallback(
    (rows: number, cols: number) => {
      restoreSelection(editor, savedSelectionRef.current);
      insertTable(editor, rows, cols);
      setShowTableInsertModal(false);
    },
    [editor]
  );

  const closeLinkModal = useCallback(() => setShowLinkModal(false), []);
  const closeImageModal = useCallback(() => setShowImageModal(false), []);
  const closeVideoModal = useCallback(() => {
    setShowVideoModal(false);
    setVideoError('');
  }, []);
  const closeTableInsertModal = useCallback(() => setShowTableInsertModal(false), []);
  const closeSlashMenu = useCallback(() => {
    setCtxMenuOpen(false);
    setCtxMenuSearch('');
  }, []);

  /** Execute a command from the context menu */
  const handleCtxMenuSelect = useCallback(
    (cmd: ContextMenuCommand, variableName?: string) => {
      setCtxMenuOpen(false);
      setCtxMenuSearch('');

      const { action } = cmd;
      if (action.type === 'custom') {
        if (slashConfig && typeof slashConfig === 'object' && slashConfig.onContextMenuCommand) {
          slashConfig.onContextMenuCommand(action.customId, editor);
        }
        return;
      }
      if (action.type === 'table') {
        switch (action.tableAction) {
          case 'insert-row-above':
            insertRowAbove(editor);
            break;
          case 'insert-row-below':
            insertRowBelow(editor);
            break;
          case 'insert-column-left':
            insertColumnLeft(editor);
            break;
          case 'insert-column-right':
            insertColumnRight(editor);
            break;
          case 'delete-row':
            deleteRow(editor);
            break;
          case 'delete-column':
            deleteColumn(editor);
            break;
          case 'delete-table':
            deleteTable(editor);
            break;
        }
        return;
      }

      switch (action.type) {
        case 'block':
          if (action.block === 'table') {
            setModalAnchor(ctxMenuAnchor);
            setShowTableInsertModal(true);
          } else if (action.block === 'heading' && action.level) {
            toggleBlock(editor, 'heading', action.level);
          } else {
            toggleBlock(editor, action.block);
          }
          break;
        case 'modal':
          setTimeout(() => {
            if (action.modal === 'image') handleImageClick();
            else if (action.modal === 'video') handleVideoClick();
            else if (action.modal === 'link') handleLinkClick();
          }, 0);
          break;
        case 'variable':
          if (variableName) {
            insertVariable(editor, variableName);
          }
          break;
      }
    },
    [editor, handleImageClick, handleVideoClick, handleLinkClick, ctxMenuAnchor, slashConfig]
  );

  // ---- Element renderer ----
  const renderElement = useCallback(
    (props: RenderElementProps) => {
      // Let user override first
      if (userRenderElement) {
        const result = userRenderElement(props);
        if (result !== undefined) return result;
      }

      switch (props.element.type) {
        case 'paragraph':
          return <Paragraph {...props} />;
        case 'heading':
          return <Heading {...props} />;
        case 'blockquote':
          return <Blockquote {...props} />;
        case 'code-block':
          return <CodeBlock {...props} />;
        case 'bulleted-list':
          return <BulletedList {...props} />;
        case 'numbered-list':
          return <NumberedList {...props} />;
        case 'list-item':
          return <ListItem {...props} />;
        case 'image':
          return <ImageElement {...props} />;
        case 'link':
          return <LinkElement {...props} />;
        case 'variable':
          return <VariableElement {...props} />;
        case 'video':
          return <VideoElement {...props} />;
        case 'table':
          return <Table {...props} />;
        case 'table-row':
          return <TableRow {...props} />;
        case 'table-cell':
          return <TableCell {...props} />;
        default:
          return <DefaultElement {...props} />;
      }
    },
    [userRenderElement]
  );

  // ---- Leaf renderer ----
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => {
      // Let user override first
      if (userRenderLeaf) {
        const result = userRenderLeaf(props);
        if (result !== undefined) return result;
      }
      return <Leaf {...props} />;
    },
    [userRenderLeaf]
  );

  // ---- Change handler ----
  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      isInternalChangeRef.current = true;
      internalValue.current = newValue;
      onChange?.(newValue);

      const gen = ++serializeGenRef.current;

      if (onHTMLChange) {
        import('../serializers/html').then(({ htmlSerializer }) => {
          if (gen !== serializeGenRef.current) return;
          onHTMLChange(htmlSerializer.serialize(internalValue.current));
        });
      }
      if (onMarkdownChange) {
        import('../serializers/markdown').then(({ markdownSerializer }) => {
          if (gen !== serializeGenRef.current) return;
          onMarkdownChange(markdownSerializer.serialize(internalValue.current));
        });
      }
    },
    [onChange, onHTMLChange, onMarkdownChange]
  );

  /** Sync controlled `value` from parent when it changes externally */
  useEffect(() => {
    if (value === undefined) return;
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const external = JSON.stringify(value);
    const current = JSON.stringify(editor.children);
    if (external !== current) {
      editor.children = value;
      editor.onChange();
    }
  }, [value, editor]);

  const editableStyle = useMemo(
    () =>
      ({
        ...(minHeight != null
          ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight }
          : {}),
        ['--rte-editable-min-height']:
          minHeight != null
            ? typeof minHeight === 'number'
              ? `${minHeight}px`
              : minHeight
            : '150px',
      }) as React.CSSProperties,
    [minHeight]
  );

  // ---- Keyboard handler ----
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      // Let user handle first
      userOnKeyDown?.(event);

      // Close context menu on any key
      if (ctxMenuOpen) {
        if (event.key === 'Escape') {
          event.preventDefault();
          setCtxMenuOpen(false);
          return;
        }
        // Arrow keys and Enter are handled by the SlashMenu's own keydown listener
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'Enter') {
          return;
        }
      }

      // Table: Tab = next cell, Shift+Tab = previous cell
      if (isInTable(editor)) {
        if (event.key === 'Tab') {
          if (event.shiftKey) {
            if (selectPreviousTableCell(editor)) {
              event.preventDefault();
              return;
            }
          } else {
            if (selectNextTableCell(editor)) {
              event.preventDefault();
              return;
            }
          }
        }
      }

      // Font size shortcuts: Ctrl+Shift+. (increase) and Ctrl+Shift+, (decrease)
      if (isHotkey('mod+shift+.', event as any)) {
        event.preventDefault();
        increaseFontSize(editor);
        return;
      }
      if (isHotkey('mod+shift+,', event as any)) {
        event.preventDefault();
        decreaseFontSize(editor);
        return;
      }

      // Move past variable (inline void) with arrow keys so user can type after it
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const anchor = selection.anchor;
          const [node, path] = Editor.parent(editor, anchor);
          const isInsideVariable = SlateElement.isElement(node) && (node as any).type === 'variable';

          if (event.key === 'ArrowRight') {
            if (isInsideVariable) {
              const after = Editor.after(editor, path);
              if (after) {
                Transforms.select(editor, after);
                event.preventDefault();
                return;
              }
            } else {
              const nextEntry = Editor.next(editor, { at: selection });
              const nextNode = nextEntry?.[0];
              const nextPath = nextEntry?.[1];
              if (nextNode && nextPath && SlateElement.isElement(nextNode) && (nextNode as any).type === 'variable') {
                const after = Editor.after(editor, nextPath);
                if (after) {
                  Transforms.select(editor, after);
                  event.preventDefault();
                  return;
                }
              }
            }
          } else {
            if (isInsideVariable) {
              const before = Editor.before(editor, path);
              if (before) {
                Transforms.select(editor, before);
                event.preventDefault();
                return;
              }
            } else {
              const prevEntry = Editor.previous(editor, { at: selection });
              const prevNode = prevEntry?.[0];
              const prevPath = prevEntry?.[1];
              if (prevNode && prevPath && SlateElement.isElement(prevNode) && (prevNode as any).type === 'variable') {
                const before = Editor.before(editor, prevPath);
                if (before) {
                  Transforms.select(editor, before);
                  event.preventDefault();
                  return;
                }
              }
            }
          }
        }
      }

      // Check hotkeys for marks
      for (const [hotkey, mark] of Object.entries(HOTKEYS)) {
        if (isHotkey(hotkey, event as any)) {
          event.preventDefault();
          toggleMark(editor, mark);
          return;
        }
      }
    },
    [editor, userOnKeyDown, ctxMenuOpen]
  );

  /** Focus and show caret when clicking anywhere in an empty editor */
  const handleEditableMouseDown = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (readOnly) return;
      const target = event.target as HTMLElement;
      if (target.closest('[contenteditable="false"]')) return;

      const editable = event.currentTarget;
      const clickedInside = editable.contains(target);
      if (!clickedInside) return;

      if (isDocumentEmpty(editor) || target === editable) {
        event.preventDefault();
        ReactEditor.focus(editor);
        Transforms.select(editor, Editor.start(editor, [0]));
      }
    },
    [editor, readOnly]
  );

  return (
    <ThemeProvider theme={theme}>
      <div
        ref={rootRef}
        className={`rte-root${className ? ` ${className}` : ''}`}
        style={style}
      >
        <Slate
          editor={editor}
          initialValue={initialValue}
          onChange={handleChange}
        >
          {/* Toolbar */}
          {!readOnly && toolbarConfig !== false && (
            <Toolbar
              config={toolbarConfig}
              variables={variables}
              onLinkClick={handleLinkClick}
              onImageClick={handleImageClick}
              onVideoClick={handleVideoClick}
              onTableClick={handleTableClick}
            />
          )}

          {/* Hovering Toolbar (portal) */}
          {!readOnly && hoveringConfig !== false && (
            <HoveringToolbar
              config={hoveringConfig}
              isToolbarVisible={toolbarConfig !== false}
              onLinkClick={handleLinkClick}
              onImageClick={handleImageClick}
              onVideoClick={handleVideoClick}
              variables={variables}
            />
          )}

          {/* Editable area */}
          <Editable
            className={`rte-editable${editorClassName ? ` ${editorClassName}` : ''}`}
            style={editableStyle}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder={placeholder}
            readOnly={readOnly}
            autoFocus={autoFocus}
            onMouseDown={handleEditableMouseDown}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
            onContextMenu={handleContextMenu}
            spellCheck
          />

          {/* Context Menu (right-click) */}
          {!readOnly && slashConfig !== false && (
            <SlashMenu
              open={ctxMenuOpen}
              search={ctxMenuSearch}
              anchorPos={ctxMenuAnchor}
              inTable={ctxMenuInTable}
              customCommands={typeof slashConfig === 'object' ? slashConfig.customCommands : undefined}
              variables={variables}
              onSelect={handleCtxMenuSelect}
              onClose={closeSlashMenu}
            />
          )}
        </Slate>

        {/* Popover modals — positioned near the clicked button */}
        <LinkModal
          open={showLinkModal}
          hasSelection={linkHasSelection}
          anchorPos={modalAnchor}
          onSubmit={handleLinkSubmit}
          onCancel={closeLinkModal}
        />

        <ImageModal
          open={showImageModal}
          anchorPos={modalAnchor}
          onSubmit={handleImageSubmit}
          onCancel={closeImageModal}
          onImageUpload={onImageUpload}
        />

        <InputModal
          open={showVideoModal}
          title="Insert Video"
          label="Video URL"
          placeholder="https://www.youtube.com/watch?v=..."
          helperText="YouTube, Vimeo, Dailymotion, Loom, Wistia, or direct .mp4/.webm"
          error={videoError}
          submitText="Insert Video"
          icon={<VideoIcon />}
          anchorPos={modalAnchor}
          onSubmit={handleVideoSubmit}
          onCancel={closeVideoModal}
        />

        <TableInsertModal
          open={showTableInsertModal}
          anchorPos={modalAnchor}
          onSubmit={handleTableInsert}
          onCancel={closeTableInsertModal}
        />
      </div>
    </ThemeProvider>
  );
}
