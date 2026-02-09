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
    expect(markdownSerializer.serialize(value)).toContain('[link](https://example.com)');
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
