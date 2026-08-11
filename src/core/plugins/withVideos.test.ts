import { createEditor, Transforms, Element as SlateElement } from 'slate';
import { describe, expect, it } from 'vitest';
import { insertVideo } from './withVideos';

function makeEditor() {
  const editor = createEditor();
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  return editor;
}

describe('video tool', () => {
  it('inserts a supported video with trusted embed metadata', () => {
    const editor = makeEditor();
    const inserted = insertVideo(
      editor,
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'Demo video'
    );

    const video = editor.children.find(
      (node) => SlateElement.isElement(node) && node.type === 'video'
    ) as any;
    expect(inserted).toBe(true);
    expect(video).toMatchObject({
      type: 'video',
      provider: 'youtube',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      caption: 'Demo video',
    });
  });

  it('rejects an unsupported video URL without changing the document', () => {
    const editor = makeEditor();
    const before = JSON.stringify(editor.children);

    expect(insertVideo(editor, 'https://example.com/not-a-video')).toBe(false);
    expect(JSON.stringify(editor.children)).toBe(before);
  });
});
