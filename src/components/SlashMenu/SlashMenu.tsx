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
  /** Current command search text */
  search: string;
  /** Called when the command search text changes */
  onSearchChange?: (search: string) => void;
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
  onSearchChange,
  anchorPos,
  inTable = false,
  customCommands,
  variables,
  onSelect,
  onClose,
}: SlashMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showVarSub, setShowVarSub] = useState(false);
  const [variableIndex, setVariableIndex] = useState(0);
  const [query, setQuery] = useState(search);
  const variableOptions = useMemo(
    () => variables ?? ['name', 'email', 'company', 'date', 'phone', 'address'],
    [variables]
  );

  useEffect(() => setQuery(search), [open, search]);

  const filtered = useMemo(() => filterCommands(query), [query]);
  const customFiltered = useMemo(
    () => filterCustomCommands(customCommands, query),
    [customCommands, query]
  );
  const tableFiltered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return TABLE_CONTEXT_COMMANDS;
    return TABLE_CONTEXT_COMMANDS.filter((command) =>
      command.label.toLowerCase().includes(normalized)
    );
  }, [query]);
  const allFiltered = useMemo<SlashCommand[]>(
    () => [...filtered, ...customFiltered],
    [filtered, customFiltered]
  );
  const grouped = useMemo(() => groupCommands(allFiltered), [allFiltered]);
  const flatList = useMemo<ContextMenuCommand[]>(
    () => {
      const renderedCommands = Array.from(grouped.values()).flat();
      return inTable ? [...tableFiltered, ...renderedCommands] : renderedCommands;
    },
    [inTable, grouped, tableFiltered]
  );

  // Reset active index when list changes
  useEffect(() => {
    setActiveIndex(0);
    setShowVarSub(false);
  }, [open, query, inTable]);

  useEffect(() => {
    if (!open || showVarSub) return;
    const timer = setTimeout(() => searchInputRef.current?.focus(), 0);
    return () => clearTimeout(timer);
  }, [open, showVarSub]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setQuery(value);
      onSearchChange?.(value);
    },
    [onSearchChange]
  );

  const handleSelect = useCallback(
    (cmd: ContextMenuCommand) => {
      if (cmd.action.type === 'variable') {
        setVariableIndex(0);
        setShowVarSub(true);
        return;
      }
      onSelect(cmd);
    },
    [onSelect]
  );

  const handleVariableSelect = useCallback(
    (name: string) => {
      const cmd = SLASH_COMMANDS.find((c) => c.id === 'variable')!;
      onSelect(cmd, name);
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
        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            if (variableOptions.length) setVariableIndex((prev) => (prev + 1) % variableOptions.length);
            break;
          case 'ArrowUp':
            e.preventDefault();
            if (variableOptions.length) setVariableIndex((prev) => (prev - 1 + variableOptions.length) % variableOptions.length);
            break;
          case 'Enter':
            e.preventDefault();
            if (variableOptions[variableIndex]) {
              const variableCommand = SLASH_COMMANDS.find((command) => command.id === 'variable');
              if (variableCommand) onSelect(variableCommand, variableOptions[variableIndex]);
            }
            break;
          case 'ArrowLeft':
          case 'Escape':
            e.preventDefault();
            setShowVarSub(false);
            break;
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (flatList.length) setActiveIndex((prev) => (prev + 1) % flatList.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (flatList.length) setActiveIndex((prev) => (prev - 1 + flatList.length) % flatList.length);
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
  }, [open, flatList, activeIndex, showVarSub, variableIndex, variableOptions, onClose, onSelect, handleSelect]);

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

  if (!open) return null;

  // Flat index for keyboard nav (matches flatList order)
  let flatIndex = 0;

  return (
    <div ref={menuRef} className="rte-slash-menu">
      {!showVarSub && (
        <div className="rte-slash-search">
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchInputRef}
            type="search"
            className="rte-slash-search-input"
            aria-label="Search context menu"
            placeholder="Search commands..."
            value={query}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
          {query && (
            <button
              type="button"
              className="rte-slash-search-clear"
              aria-label="Clear context menu search"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSearchChange('')}
            >
              ×
            </button>
          )}
        </div>
      )}
      <div className="rte-slash-results" role="listbox" aria-label="Context menu commands">
        {showVarSub ? (
          // Variable sub-menu
          <div className="rte-slash-section">
            <div className="rte-slash-category">Select Variable</div>
            {variableOptions.map((v, index) => (
              <button
                key={v}
                className={`rte-slash-item${index === variableIndex ? ' rte-slash-item--active' : ''}`}
                role="option"
                aria-selected={index === variableIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => handleVariableSelect(v)}
                onMouseEnter={() => setVariableIndex(index)}
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
              }}
              onClick={() => setShowVarSub(false)}
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
            {inTable && tableFiltered.length > 0 && (
              <div className="rte-slash-section">
                <div className="rte-slash-category">Table</div>
                {tableFiltered.map((cmd) => {
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
                      }}
                      onClick={() => handleSelect(cmd)}
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
                      }}
                      onClick={() => handleSelect(cmd)}
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
            {flatList.length === 0 && (
              <div className="rte-slash-empty">No commands found</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function groupCommands(commands: SlashCommand[]): Map<string, SlashCommand[]> {
  const grouped = new Map<string, SlashCommand[]>();
  for (const command of commands) {
    const group = grouped.get(command.category) ?? [];
    group.push(command);
    grouped.set(command.category, group);
  }
  return grouped;
}
