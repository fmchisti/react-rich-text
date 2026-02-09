import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  SLASH_COMMANDS,
  filterCommands,
  filterCustomCommands,
  CATEGORY_LABELS,
  TABLE_CONTEXT_COMMANDS,
  type SlashCommand,
  type TableContextCommand,
  type CustomContextMenuCommand,
} from './slashCommands';

export type ContextMenuCommand = SlashCommand | TableContextCommand;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SlashMenuProps {
  /** Whether the menu is open */
  open: boolean;
  /** Current search text (after the /) */
  search: string;
  /** Position relative to .rte-root */
  anchorPos: { top: number; left: number };
  /** Whether the cursor is inside a table (shows table actions at top) */
  inTable?: boolean;
  /** Custom context menu commands (user-defined) */
  customCommands?: CustomContextMenuCommand[];
  /** Available variable names */
  variables?: string[];
  /** Called when a command is selected */
  onSelect: (command: ContextMenuCommand, variableName?: string) => void;
  /** Called when the menu should close */
  onClose: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SlashMenu({
  open,
  search,
  anchorPos,
  inTable = false,
  customCommands,
  variables,
  onSelect,
  onClose,
}: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVarSub, setShowVarSub] = useState(false);

  const filtered = useMemo(() => filterCommands(search), [search]);
  const customFiltered = useMemo(
    () => filterCustomCommands(customCommands, search),
    [customCommands, search]
  );
  const allFiltered = useMemo<SlashCommand[]>(
    () => [...filtered, ...customFiltered],
    [filtered, customFiltered]
  );
  const flatList = useMemo<ContextMenuCommand[]>(
    () => (inTable ? [...TABLE_CONTEXT_COMMANDS, ...allFiltered] : allFiltered),
    [inTable, allFiltered]
  );

  // Reset active index when list changes
  useEffect(() => {
    setActiveIndex(0);
    setShowVarSub(false);
  }, [search, inTable]);

  const handleSelect = useCallback(
    (cmd: ContextMenuCommand) => {
      if (cmd.action.type === 'variable') {
        setShowVarSub(true);
        return;
      }
      onSelect(cmd);
    },
    [onSelect]
  );

  // Click outside to close (ignore when target is detached — e.g. menu item just unmounted when opening variable sub-menu)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!menuRef.current) return;
      if (menuRef.current.contains(target)) return;
      // Target may be a node that was unmounted when we opened the variable sub-menu; don't close in that case
      if (!document.body.contains(target)) return;
      onClose();
    };
    // Delay so the triggering right-click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [open, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showVarSub) {
        // Variable sub-menu navigation handled separately
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % flatList.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatList[activeIndex]) {
            handleSelect(flatList[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, flatList, activeIndex, showVarSub, onClose, handleSelect]);

  // Scroll active item into view
  useEffect(() => {
    if (!menuRef.current) return;
    const active = menuRef.current.querySelector('.rte-slash-item--active');
    if (active) {
      active.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // Clamp position within container
  useEffect(() => {
    if (!open || !menuRef.current) return;
    const menu = menuRef.current;
    const parent = menu.parentElement;
    if (!parent) return;
    const pRect = parent.getBoundingClientRect();
    const mRect = menu.getBoundingClientRect();

    let top = anchorPos.top;
    let left = anchorPos.left;

    if (left + mRect.width > pRect.width - 8) {
      left = Math.max(8, pRect.width - mRect.width - 8);
    }
    if (left < 8) left = 8;
    if (top + mRect.height > pRect.height - 8) {
      top = Math.max(8, anchorPos.top - mRect.height - 8);
    }
    if (top < 8) top = 8;

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }, [open, anchorPos, flatList.length]);

  const handleVariableSelect = useCallback(
    (name: string) => {
      const cmd = SLASH_COMMANDS.find((c) => c.id === 'variable')!;
      onSelect(cmd, name);
    },
    [onSelect]
  );

  if (!open || flatList.length === 0) return null;

  // Group built-in + custom commands by category (table commands rendered separately when inTable)
  const grouped = new Map<string, SlashCommand[]>();
  for (const cmd of allFiltered) {
    const list = grouped.get(cmd.category) ?? [];
    list.push(cmd);
    grouped.set(cmd.category, list);
  }

  // Flat index for keyboard nav (matches flatList order)
  let flatIndex = 0;

  return (
    <div ref={menuRef} className="rte-slash-menu" role="listbox">
      {showVarSub ? (
        // Variable sub-menu
        <div className="rte-slash-section">
          <div className="rte-slash-category">Select Variable</div>
          {(variables ?? ['name', 'email', 'company', 'date', 'phone', 'address']).map((v) => (
            <button
              key={v}
              className="rte-slash-item"
              role="option"
              onMouseDown={(e) => {
                e.preventDefault();
                handleVariableSelect(v);
              }}
            >
              <span className="rte-slash-item-icon">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                  <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                  <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                  <path d="M12 8v8" />
                </svg>
              </span>
              <span className="rte-slash-item-content">
                <span className="rte-slash-item-label">{`{{${v}}}`}</span>
              </span>
            </button>
          ))}
          <button
            className="rte-slash-item rte-slash-item--back"
            onMouseDown={(e) => {
              e.preventDefault();
              setShowVarSub(false);
            }}
          >
            <span className="rte-slash-item-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </span>
            <span className="rte-slash-item-content">
              <span className="rte-slash-item-label">Back</span>
            </span>
          </button>
        </div>
      ) : (
        // Main command list: Table section (when inTable) + grouped slash commands
        <>
          {inTable && (
            <div className="rte-slash-section">
              <div className="rte-slash-category">Table</div>
              {TABLE_CONTEXT_COMMANDS.map((cmd) => {
                const idx = flatIndex++;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    className={`rte-slash-item${isActive ? ' rte-slash-item--active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(cmd);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="rte-slash-item-icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        dangerouslySetInnerHTML={{ __html: cmd.iconPaths }}
                      />
                    </span>
                    <span className="rte-slash-item-content">
                      <span className="rte-slash-item-label">{cmd.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {Array.from(grouped.entries()).map(([category, cmds]) => (
            <div key={category} className="rte-slash-section">
              <div className="rte-slash-category">{CATEGORY_LABELS[category] ?? category}</div>
              {cmds.map((cmd) => {
                const idx = flatIndex++;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={cmd.id}
                    className={`rte-slash-item${isActive ? ' rte-slash-item--active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(cmd);
                    }}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="rte-slash-item-icon">
                      <svg
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        dangerouslySetInnerHTML={{ __html: cmd.iconPaths }}
                      />
                    </span>
                    <span className="rte-slash-item-content">
                      <span className="rte-slash-item-label">{cmd.label}</span>
                      <span className="rte-slash-item-desc">{cmd.description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
