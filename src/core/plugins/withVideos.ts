import { Transforms, type Editor } from 'slate';
import { parseVideoUrl } from '../utils/video';
import { insertTrailingParagraph, shouldInsertTrailingParagraph } from '../utils/insertVoid';

/**
 * Insert a video element at the current selection.
 *
 * Accepts any supported video URL (YouTube, Vimeo, Dailymotion, Loom, Wistia,
 * or a direct .mp4/.webm/.ogg/.mov URL).
 *
 * @param editor - The Slate editor instance
 * @param url - The video URL
 * @param caption - Optional caption text
 * @returns `true` if the video was inserted, `false` if the URL was not recognized
 */
export function insertVideo(editor: Editor, url: string, caption?: string): boolean {
  const parsed = parseVideoUrl(url);
  if (!parsed) return false;

  const video = {
    type: 'video' as const,
    url: parsed.url,
    embedUrl: parsed.embedUrl,
    provider: parsed.provider,
    caption: caption ?? '',
    children: [{ text: '' as const }],
  };

  Transforms.insertNodes(editor, video as any);
  if (shouldInsertTrailingParagraph(editor)) {
    insertTrailingParagraph(editor);
  }

  return true;
}
