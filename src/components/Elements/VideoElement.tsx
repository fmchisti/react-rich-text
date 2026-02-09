import React from 'react';
import { useSelected, useFocused, type RenderElementProps } from 'slate-react';
import type { VideoElement as VideoElementType } from '../../core/types';
import { VIDEO_PROVIDERS } from '../../core/utils/video';

/**
 * Renders a video embed as a responsive iframe (YouTube, Vimeo, etc.)
 * or a native `<video>` element for direct file URLs.
 *
 * This is a void element -- the children are empty but must be rendered.
 */
export function VideoElement({ attributes, children, element }: RenderElementProps) {
  const el = element as VideoElementType;
  const selected = useSelected();
  const focused = useFocused();
  const isHighlighted = selected && focused;

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <div className={`rte-video-wrapper${isHighlighted ? ' rte-video--selected' : ''}`}>
          {el.provider === 'direct' ? (
            <video
              src={el.embedUrl}
              controls
              className="rte-video-player"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="rte-video-embed">
              <iframe
                src={el.embedUrl}
                title={`${VIDEO_PROVIDERS[el.provider]} video`}
                className="rte-video-iframe"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
          {el.caption && (
            <p className="rte-video-caption">{el.caption}</p>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
