import { createEditor, Transforms, Element as SlateElement } from 'slate';
import { describe, expect, it } from 'vitest';
import { insertImage, withImages } from './withImages';

function makeEditor() {
  const editor = withImages(createEditor());
  editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
  Transforms.select(editor, { path: [0, 0], offset: 0 });
  return editor;
}

describe('image tool', () => {
  it('inserts an image with its URL and alt text', () => {
    const editor = makeEditor();
    insertImage(editor, 'https://example.com/photo.png', 'Example photo');

    const image = editor.children.find(
      (node) => SlateElement.isElement(node) && node.type === 'image'
    ) as any;
    expect(image).toMatchObject({
      type: 'image',
      url: 'https://example.com/photo.png',
      alt: 'Example photo',
      children: [{ text: '' }],
    });
  });

  it('marks inserted images as void elements', () => {
    const editor = makeEditor();
    const image = {
      type: 'image' as const,
      url: 'https://example.com/photo.png',
      alt: '',
      children: [{ text: '' as const }],
    };

    expect(editor.isVoid(image as any)).toBe(true);
  });
});
