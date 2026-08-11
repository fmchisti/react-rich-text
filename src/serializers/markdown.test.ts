import { describe, it, expect } from 'vitest';
import type { Descendant } from 'slate';
import { markdownSerializer } from './markdown';

describe('markdownSerializer.serialize', () => {
  it('serializes a paragraph', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'Hello world' }] },
    ];
    expect(markdownSerializer.serialize(value)).toBe('Hello world');
  });

  it('serializes bold text', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'bold', bold: true }] },
    ];
    expect(markdownSerializer.serialize(value)).toContain('**bold**');
  });

  it('serializes headings', () => {
    const value: Descendant[] = [
      { type: 'heading', level: 1, children: [{ text: 'Title' }] },
    ];
    expect(markdownSerializer.serialize(value)).toContain('# Title');
  });

  it('serializes heading level 3', () => {
    const value: Descendant[] = [
      { type: 'heading', level: 3, children: [{ text: 'Sub' }] },
    ];
    expect(markdownSerializer.serialize(value)).toContain('### Sub');
  });

  it('serializes code blocks', () => {
    const value: Descendant[] = [
      { type: 'code-block', language: 'js', children: [{ text: 'const x = 1;' }] },
    ];
    const md = markdownSerializer.serialize(value);
    expect(md).toContain('```js');
    expect(md).toContain('const x = 1;');
    expect(md).toContain('```');
  });

  it('serializes links', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'link' }],
          } as any,
        ],
      },
    ];
    expect(markdownSerializer.serialize(value)).toContain('[link](https://example.com/)');
  });

  it('does not add empty quoted lines after a blockquote', () => {
    const value: Descendant[] = [
      {
        type: 'blockquote',
        children: [{ type: 'paragraph', children: [{ text: 'Some quote' }] }],
      },
    ];

    expect(markdownSerializer.serialize(value)).toBe('> Some quote');
  });

  it('serializes video embeds as valid text links', () => {
    const value: Descendant[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        provider: 'youtube',
        caption: 'Demo video',
        children: [{ text: '' }],
      } as any,
    ];

    const markdown = markdownSerializer.serialize(value);
    expect(markdown).toBe('[Demo video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)');
    expect(markdown).not.toContain('![Video]');
    expect(markdown).not.toContain('/embed/');
  });

  it('uses an accessible label when a video caption is empty', () => {
    const value: Descendant[] = [{
      type: 'video',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      provider: 'youtube',
      caption: '',
      children: [{ text: '' }],
    } as any];
    expect(markdownSerializer.serialize(value)).toBe('[Video](https://youtu.be/dQw4w9WgXcQ)');
  });

  it('escapes literal Markdown without changing it on round-trip', () => {
    const original = '**plain** and [not a link]';
    const markdown = markdownSerializer.serialize([
      { type: 'paragraph', children: [{ text: original }] },
    ]);
    const result = markdownSerializer.deserialize(markdown);
    expect((result[0] as any).children).toEqual([{ text: original }]);
  });

  it('round-trips inline code containing backticks', () => {
    const markdown = markdownSerializer.serialize([{
      type: 'paragraph',
      children: [{ text: 'a ` b', code: true }],
    }]);
    expect(markdown).toBe('``a ` b``');
    expect((markdownSerializer.deserialize(markdown)[0] as any).children).toEqual([
      { text: 'a ` b', code: true },
    ]);
  });

  it('round-trips combined bold and italic marks', () => {
    const markdown = markdownSerializer.serialize([{
      type: 'paragraph',
      children: [{ text: 'both', bold: true, italic: true }],
    }]);
    expect(markdown).toBe('***both***');
    expect((markdownSerializer.deserialize(markdown)[0] as any).children).toEqual([
      { text: 'both', bold: true, italic: true },
    ]);
  });

  it('round-trips literal angle brackets', () => {
    const markdown = markdownSerializer.serialize([{
      type: 'paragraph',
      children: [{ text: '<tag>' }],
    }]);
    expect((markdownSerializer.deserialize(markdown)[0] as any).children).toEqual([
      { text: '<tag>' },
    ]);
  });

  it('round-trips image alt text containing a closing bracket', () => {
    const markdown = markdownSerializer.serialize([{
      type: 'image',
      url: 'https://example.com/image.png',
      alt: 'a]b',
      children: [{ text: '' }],
    } as any]);
    const image = markdownSerializer.deserialize(markdown)[0] as any;
    expect(image.type).toBe('image');
    expect(image.alt).toBe('a]b');
    expect(image.url).toBe('https://example.com/image.png');
  });

  it('escapes paragraph text that resembles a list', () => {
    const markdown = markdownSerializer.serialize([
      { type: 'paragraph', children: [{ text: '- plain text' }] },
    ]);
    expect(markdown).toBe('\\- plain text');
    expect((markdownSerializer.deserialize(markdown)[0] as any).type).toBe('paragraph');
  });

  it('drops unsafe link destinations', () => {
    const markdown = markdownSerializer.serialize([{
      type: 'paragraph',
      children: [{
        type: 'link',
        url: 'javascript:alert(1)',
        children: [{ text: 'safe label' }],
      } as any],
    }]);
    expect(markdown).toBe('safe label');
  });
});

describe('markdownSerializer.deserialize', () => {
  it('deserializes a heading', () => {
    const result = markdownSerializer.deserialize('# Hello');
    expect((result[0] as any).type).toBe('heading');
    expect((result[0] as any).level).toBe(1);
  });

  it('deserializes a paragraph', () => {
    const result = markdownSerializer.deserialize('Hello world');
    expect((result[0] as any).type).toBe('paragraph');
  });

  it('deserializes a code block', () => {
    const md = '```js\nconst x = 1;\n```';
    const result = markdownSerializer.deserialize(md);
    expect((result[0] as any).type).toBe('code-block');
    expect((result[0] as any).language).toBe('js');
  });

  it('deserializes bulleted list', () => {
    const md = '- Item 1\n- Item 2';
    const result = markdownSerializer.deserialize(md);
    expect((result[0] as any).type).toBe('bulleted-list');
    expect((result[0] as any).children).toHaveLength(2);
  });

  it('deserializes blockquote', () => {
    const md = '> Some quote';
    const result = markdownSerializer.deserialize(md);
    expect((result[0] as any).type).toBe('blockquote');
  });

  it('returns default value for empty input', () => {
    const result = markdownSerializer.deserialize('');
    expect(result).toHaveLength(1);
    expect((result[0] as any).type).toBe('paragraph');
  });
});

describe('markdownSerializer variable support', () => {
  it('serializes variable elements as {{name}} in markdown', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'Hi ' },
          { type: 'variable', name: 'name', children: [{ text: '' }] } as any,
          { text: '!' },
        ],
      },
    ];
    const md = markdownSerializer.serialize(value);
    expect(md).toContain('{{name}}');
    expect(md).toContain('Hi ');
  });
});
