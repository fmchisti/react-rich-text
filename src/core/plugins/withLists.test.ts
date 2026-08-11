import { createEditor, Element as SlateElement, Transforms } from 'slate';
import { describe, expect, it } from 'vitest';
import { withLists } from './withLists';

type ListType = 'bulleted-list' | 'numbered-list';

function createListEditor(type: ListType, items: string[], activeIndex: number) {
  const editor = withLists(createEditor());
  editor.children = [{
    type,
    children: items.map((text) => ({
      type: 'list-item',
      children: [{ text }],
    })),
  }];
  Transforms.select(editor, {
    path: [0, activeIndex, 0],
    offset: items[activeIndex].length,
  });
  return editor;
}

describe('withLists Enter behavior', () => {
  it.each(['bulleted-list', 'numbered-list'] as const)(
    'exits an empty %s item into a paragraph',
    (type) => {
      const editor = createListEditor(type, [''], 0);

      editor.insertBreak();

      expect(editor.children).toEqual([{
        type: 'paragraph',
        children: [{ text: '' }],
      }]);
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      });
    }
  );

  it('splits a list around an empty item in the middle', () => {
    const editor = createListEditor('bulleted-list', ['one', '', 'three'], 1);

    editor.insertBreak();

    expect(editor.children).toEqual([
      {
        type: 'bulleted-list',
        children: [{ type: 'list-item', children: [{ text: 'one' }] }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
      {
        type: 'bulleted-list',
        children: [{ type: 'list-item', children: [{ text: 'three' }] }],
      },
    ]);
    expect(editor.selection?.anchor.path).toEqual([1, 0]);
  });

  it('keeps normal Enter behavior in a non-empty list item', () => {
    const editor = createListEditor('numbered-list', ['one'], 0);

    editor.insertBreak();

    const list = editor.children[0];
    expect(SlateElement.isElement(list) && list.type).toBe('numbered-list');
    expect(SlateElement.isElement(list) && list.children).toEqual([
      { type: 'list-item', children: [{ text: 'one' }] },
      { type: 'list-item', children: [{ text: '' }] },
    ]);
    expect(editor.selection?.anchor.path).toEqual([0, 1, 0]);
  });

  it('outdents an empty nested list item by one level', () => {
    const editor = withLists(createEditor());
    editor.children = [{
      type: 'bulleted-list',
      children: [
        { type: 'list-item', children: [{ text: 'parent' }] },
        {
          type: 'bulleted-list',
          children: [{ type: 'list-item', children: [{ text: '' }] }],
        },
      ],
    }];
    Transforms.select(editor, { path: [0, 1, 0, 0], offset: 0 });

    editor.insertBreak();

    expect(editor.children).toEqual([{
      type: 'bulleted-list',
      children: [
        { type: 'list-item', children: [{ text: 'parent' }] },
        { type: 'list-item', children: [{ text: '' }] },
      ],
    }]);
    expect(editor.selection?.anchor.path).toEqual([0, 1, 0]);
  });

  it('delegates Enter outside a list', () => {
    const editor = withLists(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: 'hello' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 5 });

    editor.insertBreak();

    expect(editor.children).toEqual([
      { type: 'paragraph', children: [{ text: 'hello' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
  });
});
