import { describe, it, expect } from 'vitest';
import type { Descendant } from 'slate';
import { plaintextSerializer } from './plaintext';

describe('plaintextSerializer.serialize', () => {
  it('serializes a paragraph to plain text', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'Hello world' }] },
    ];
    expect(plaintextSerializer.serialize(value)).toBe('Hello world');
  });

  it('strips all formatting', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'bold', bold: true },
          { text: ' and ' },
          { text: 'italic', italic: true },
        ],
      },
    ];
    expect(plaintextSerializer.serialize(value)).toBe('bold and italic');
  });

  it('handles headings as plain text', () => {
    const value: Descendant[] = [
      { type: 'heading', level: 1, children: [{ text: 'Title' }] },
    ];
    expect(plaintextSerializer.serialize(value)).toContain('Title');
  });

  it('handles multiple paragraphs', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'First' }] },
      { type: 'paragraph', children: [{ text: 'Second' }] },
    ];
    const result = plaintextSerializer.serialize(value);
    expect(result).toContain('First');
    expect(result).toContain('Second');
  });

  it('serializes variable elements as {{name}} in plain text', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'Hello ' },
          { type: 'variable', name: 'user', children: [{ text: '' }] } as any,
          { text: '!' },
        ],
      },
    ];
    const result = plaintextSerializer.serialize(value);
    expect(result).toContain('{{user}}');
    expect(result).toBe('Hello {{user}}!');
  });
});
