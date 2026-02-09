import React, { useCallback, useRef, useState } from 'react';
import { useSelected, useFocused, useSlateStatic, ReactEditor, type RenderElementProps } from 'slate-react';
import { Transforms } from 'slate';
import type { ImageElement as ImageElementType, ImageAlign } from '../../core/types';

const MIN_IMAGE_WIDTH = 80;

const ALIGN_OPTIONS: { value: ImageAlign; title: string; icon: React.ReactNode }[] = [
  { value: 'left', title: 'Align left', icon: <AlignLeftIcon /> },
  { value: 'center', title: 'Align center', icon: <AlignCenterIcon /> },
  { value: 'right', title: 'Align right', icon: <AlignRightIcon /> },
];

function AlignLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 2h12v1H2V2zm0 3h8v1H2V5zm0 3h12v1H2V8zm0 3h8v1H2v-1z" />
    </svg>
  );
}
function AlignCenterIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 2h12v1H2V2zm2 3h8v1H4V5zm-2 3h12v1H2V8zm2 3h8v1H4v-1z" />
    </svg>
  );
}
function AlignRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M2 2h12v1H2V2zm4 3h8v1H6V5zm-4 3h12v1H2V8zm4 3h8v1H6v-1z" />
    </svg>
  );
}
const MAX_IMAGE_WIDTH = 1200;

export function ImageElement({ attributes, children, element }: RenderElementProps) {
  const editor = useSlateStatic();
  const el = element as ImageElementType;
  const selected = useSelected();
  const focused = useFocused();
  const isHighlighted = selected && focused;

  const [isResizing, setIsResizing] = useState(false);
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const currentWidthRef = useRef(0);

  const imgStyle: React.CSSProperties = {};
  if (dragWidth !== null) {
    imgStyle.width = dragWidth;
    imgStyle.maxWidth = '100%';
    imgStyle.height = 'auto';
  } else if (el.width != null) {
    imgStyle.width = el.width;
    imgStyle.maxWidth = '100%';
    if (el.height != null) imgStyle.height = el.height;
    else imgStyle.height = 'auto';
  } else {
    imgStyle.maxWidth = '100%';
    imgStyle.height = 'auto';
  }

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const path = ReactEditor.findPath(editor, element);
      if (path == null) return;
      startXRef.current = e.clientX;
      const currentWidth = el.width ?? undefined;
      startWidthRef.current = currentWidth ?? (e.currentTarget.closest('.rte-image-wrapper')?.querySelector('img')?.getBoundingClientRect().width ?? 400);
      currentWidthRef.current = startWidthRef.current;
      setIsResizing(true);
      setDragWidth(startWidthRef.current);
    },
    [editor, element, el.width]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      let w = Math.round(startWidthRef.current + delta);
      w = Math.max(MIN_IMAGE_WIDTH, Math.min(MAX_IMAGE_WIDTH, w));
      currentWidthRef.current = w;
      setDragWidth(w);
    },
    []
  );

  const handleResizeEnd = useCallback(() => {
    if (!isResizing) return;
    setIsResizing(false);
    setDragWidth(null);
    const width = currentWidthRef.current || startWidthRef.current;
    const path = ReactEditor.findPath(editor, element);
    if (path == null) return;
    Transforms.setNodes(
      editor,
      { width: Math.max(MIN_IMAGE_WIDTH, Math.min(MAX_IMAGE_WIDTH, Math.round(width))) },
      { at: path }
    );
  }, [editor, element, isResizing]);

  const currentAlign: ImageAlign = el.align ?? 'center';
  const alignmentClass = `rte-image-wrapper--${currentAlign}`;

  const setAlign = useCallback(
    (align: ImageAlign) => {
      const path = ReactEditor.findPath(editor, element);
      if (path == null) return;
      Transforms.setNodes(editor, { align }, { at: path });
    },
    [editor, element]
  );

  React.useEffect(() => {
    if (!isResizing) return;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <div className={`rte-image-wrapper ${alignmentClass}${isHighlighted ? ' rte-image--selected' : ''}${isResizing ? ' rte-image--resizing' : ''}`}>
          <img
            src={el.url}
            alt={el.alt || ''}
            className="rte-image"
            draggable={false}
            style={imgStyle}
          />
          {isHighlighted && !isResizing && (
            <>
              <div
                className="rte-image-resize-handle"
                onMouseDown={handleResizeStart}
                title="Drag to resize"
                aria-label="Resize image"
              />
              <div className="rte-image-align-bar" role="toolbar" aria-label="Image alignment">
                {ALIGN_OPTIONS.map(({ value, title, icon }) => (
                  <button
                    key={value}
                    type="button"
                    title={title}
                    aria-label={title}
                    data-active={currentAlign === value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setAlign(value);
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
