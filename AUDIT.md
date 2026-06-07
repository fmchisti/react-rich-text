# Codebase Audit: Bugs, Best Practices, Optimizations

**Date:** 2026-02  
**Scope:** `fc-react-rich-editor` — core, components, plugins, serializers.

---

## Summary (latest pass)

| Category | Fixed in this pass |
|----------|-------------------|
| **Modal selection** | Save/restore Slate selection before link/image/video/table modals open |
| **Controlled `value`** | Sync external `value` prop into editor when parent updates |
| **Serialization race** | Generation counter drops stale async HTML/Markdown callbacks |
| **Hovering toolbar** | Effect deps fixed; `position: fixed`; scroll/resize listeners |
| **Void inserts** | Trailing paragraph skipped inside lists/tables/blockquotes |
| **Image paste** | Restore selection before async `FileReader` insert |
| **findPath** | `safeFindPath()` wrapper — no false `null` checks on throwing API |
| **HTML security** | `fontColor` from pasted HTML allowlisted |
| **Auto-link** | `www.example.com` URLs recognized on paste/space |
| **Table resize** | Handle height tracks measured table height via `ResizeObserver` |
| **Perf** | Stable modal callbacks; memoized `editableStyle` |

All **93 tests** pass after fixes.

---

## P0 — Critical (fixed)

### 1. Selection lost when modals open
**Files:** `RichTextEditor.tsx`, `core/utils/selection.ts`  
**Fix:** `saveSelection()` before opening modals; `restoreSelection()` before `wrapLink`, `insertImage`, `insertVideo`, `insertTable`.

### 2. Controlled `value` not synced
**File:** `RichTextEditor.tsx`  
**Fix:** `useEffect` compares external `value` to `editor.children` and updates when parent changes content (with `isInternalChangeRef` to avoid feedback loops).

### 3. Async HTML/Markdown race
**File:** `RichTextEditor.tsx`  
**Fix:** `serializeGenRef` increments on each change; stale `import().then()` callbacks are ignored.

---

## P1 — High impact (fixed)

### 4. HoveringToolbar ran positioning on every render
**File:** `HoveringToolbar.tsx`  
**Fix:** `useSlateSelector` for selection; `updateToolbarPosition` in `useEffect` with proper deps.

### 5. Hovering toolbar stale on scroll
**Files:** `HoveringToolbar.tsx`, `hovering-toolbar.css`  
**Fix:** `position: fixed` + viewport coords; `scroll`/`resize` listeners on window and editable.

### 6. `insertImage` / `insertVideo` trailing paragraph in wrong context
**Files:** `withImages.ts`, `withVideos.ts`, `core/utils/insertVoid.ts`  
**Fix:** `shouldInsertTrailingParagraph()` skips list-item, blockquote, table structures.

### 7. Image paste async without selection
**File:** `withImages.ts`  
**Fix:** Save selection before `FileReader`; restore on load.

### 8. `ReactEditor.findPath` null checks incorrect
**Files:** `ImageElement.tsx`, `VariableElement.tsx`, `Table.tsx`, `core/utils/slatePath.ts`  
**Fix:** `safeFindPath()` wraps in try/catch.

### 9. Unsanitized `fontColor` from HTML paste
**File:** `serializers/html.ts`  
**Fix:** Allowlist hex, rgb/rgba, hsl/hsla, named colors; reject `url(`, `;`, etc.

### 10. Auto-link required `http://` prefix
**File:** `withLinks.ts`  
**Fix:** Fallback `https://${text}` for hostnames like `www.example.com`.

---

## P2 — Medium (fixed / partial)

| Item | Status |
|------|--------|
| Table resize handle height (`bottom: -100px` fixed) | **Fixed** — dynamic `handleExtent` from `ResizeObserver` |
| HoveringToolbar `orderedIds` stale deps | **Fixed** — explicit `resolved.*` deps |
| Unstable modal `onClose` inline functions | **Fixed** — `useCallback` handlers |
| Unstable `Editable` style object | **Fixed** — `useMemo` `editableStyle` |

---

## P2 — Remaining (not fixed — lower priority)

| Item | Location | Suggestion |
|------|----------|------------|
| **No `withTables` normalization plugin** | `createEditor.ts` | Add `normalizeNode` for table → row → cell structure |
| **Context menu search** | `SlashMenu` | `ctxMenuSearch` never wired to keyboard input |
| **Variable sub-menu keyboard** | `SlashMenu.tsx` | Arrow/Enter disabled when `showVarSub` is true |
| **Markdown tables** | `markdown.ts` | Tables fall through to default; add GFM or HTML fallback |
| **Markdown mark nesting** | `markdown.ts` | Bold + code order may produce invalid MD |
| **`plugins` prop mount-only** | `RichTextEditor.tsx` | Documented; recreate editor if plugins change |
| **Element `React.memo`** | Paragraph, Leaf, etc. | Profile first; Table already memoized |
| **`renderElement` typed `any`** | `types.ts` | Use `RenderElementProps` from slate-react |
| **SlashMenu `dangerouslySetInnerHTML`** | `SlashMenu.tsx` | Sanitize custom command SVG paths |

---

## Previous pass (still valid)

| Item | Location | Fix |
|------|----------|-----|
| Empty table crash | `Table.tsx` | Guard when `colCount <= 0` |
| Unstable table ref callback | `Table.tsx` | `slateRefRef` + stable `setTableRef` |
| Table memoization | `Table.tsx` | `React.memo` on Table/TableRow/TableCell |

---

## Empty editor click / cursor (fixed earlier)

- Removed flex placeholder layout that hid caret
- `handleEditableMouseDown` focuses empty editor
- First block `min-height` fills editable area via `--rte-editable-min-height`

---

## Testing

```bash
npm run lint   # tsc --noEmit
npm test       # 93 tests
npm run build
```

Recommended future tests: modal selection restore, controlled `value` sync, table normalization.

---

## Author

**Fahim Mahmud Chisti** — [fahimcode.com](https://fahimcode.com/) · [GitHub](https://github.com/fmchisti/react-rich-text)
