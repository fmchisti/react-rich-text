import { describe, it, expect } from 'vitest';
import type { Descendant } from 'slate';
import { htmlSerializer } from './html';

describe('htmlSerializer.serialize', () => {
  it('serializes a paragraph', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'Hello world' }] },
    ];
    expect(htmlSerializer.serialize(value)).toBe('<p>Hello world</p>');
  });

  it('serializes bold text', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'bold', bold: true }] },
    ];
    expect(htmlSerializer.serialize(value)).toContain('<strong>bold</strong>');
  });

  it('serializes italic text', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: 'italic', italic: true }] },
    ];
    expect(htmlSerializer.serialize(value)).toContain('<em>italic</em>');
  });

  it('serializes headings with correct level', () => {
    const value: Descendant[] = [
      { type: 'heading', level: 2, children: [{ text: 'Title' }] },
    ];
    expect(htmlSerializer.serialize(value)).toBe('<h2>Title</h2>');
  });

  it('serializes a blockquote', () => {
    const value: Descendant[] = [
      { type: 'blockquote', children: [{ text: 'quote text' }] },
    ];
    expect(htmlSerializer.serialize(value)).toBe(
      '<blockquote>quote text</blockquote>'
    );
  });

  it('serializes a code block', () => {
    const value: Descendant[] = [
      { type: 'code-block', children: [{ text: 'const x = 1;' }] },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('<pre>');
    expect(html).toContain('const x = 1;');
  });

  it('serializes bulleted lists', () => {
    const value: Descendant[] = [
      {
        type: 'bulleted-list',
        children: [
          { type: 'list-item', children: [{ text: 'Item 1' }] },
          { type: 'list-item', children: [{ text: 'Item 2' }] },
        ],
      },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>Item 1</li>');
    expect(html).toContain('<li>Item 2</li>');
  });

  it('serializes links', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://example.com',
            children: [{ text: 'click me' }],
          } as any,
        ],
      },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('href="https://example.com/"');
    expect(html).toContain('click me');
  });

  it('escapes HTML entities in text', () => {
    const value: Descendant[] = [
      { type: 'paragraph', children: [{ text: '<script>alert("xss")</script>' }] },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('rejects unsafe links', () => {
    const html = htmlSerializer.serialize([{
      type: 'paragraph',
      children: [{
        type: 'link',
        url: 'javascript:alert(1)',
        children: [{ text: 'safe label' }],
      } as any],
    }]);
    expect(html).toBe('<p>safe label</p>');
  });

  it('does not interpolate unsafe code languages into attributes', () => {
    const html = htmlSerializer.serialize([{
      type: 'code-block',
      language: 'js"><img src=x onerror=alert(1)>',
      children: [{ text: 'code' }],
    }]);
    expect(html).toBe('<pre><code>code</code></pre>');
  });

  it('does not interpolate untrusted font colors into style attributes', () => {
    const html = htmlSerializer.serialize([{
      type: 'paragraph',
      children: [{
        text: 'safe text',
        fontColor: 'red\"><img src=x onerror=alert(1)>',
      } as any],
    }]);

    expect(html).toBe('<p>safe text</p>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('onerror');
  });
});

describe('htmlSerializer.deserialize', () => {
  it('deserializes a paragraph', () => {
    const result = htmlSerializer.deserialize('<p>Hello</p>');
    expect(result).toHaveLength(1);
    expect((result[0] as any).type).toBe('paragraph');
  });

  it('deserializes headings', () => {
    const result = htmlSerializer.deserialize('<h2>Title</h2>');
    expect((result[0] as any).type).toBe('heading');
    expect((result[0] as any).level).toBe(2);
  });

  it('deserializes bold text', () => {
    const result = htmlSerializer.deserialize('<p><strong>bold</strong></p>');
    const paragraph = result[0] as any;
    const textNode = paragraph.children[0];
    expect(textNode.bold).toBe(true);
    expect(textNode.text).toBe('bold');
  });

  it('returns default value for empty input', () => {
    const result = htmlSerializer.deserialize('');
    expect(result).toHaveLength(1);
    expect((result[0] as any).type).toBe('paragraph');
  });

  it('preserves a valid code language', () => {
    const result = htmlSerializer.deserialize('<pre><code class="language-typescript">const x = 1;</code></pre>');
    expect((result[0] as any).language).toBe('typescript');
  });

  it('flattens unsafe deserialized links to text', () => {
    const result = htmlSerializer.deserialize('<p><a href="javascript:alert(1)">safe label</a></p>');
    expect((result[0] as any).children).toEqual([{ text: 'safe label' }]);
  });
});

describe('htmlSerializer variable support', () => {
  it('serializes a variable element to HTML', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'Hello ' },
          { type: 'variable', name: 'name', children: [{ text: '' }] } as any,
          { text: '!' },
        ],
      },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('data-variable="name"');
    expect(html).toContain('{{name}}');
  });

  it('deserializes a variable span back to variable element', () => {
    const html = '<p>Hello <span data-variable="email">{{email}}</span>!</p>';
    const result = htmlSerializer.deserialize(html);
    const paragraph = result[0] as any;
    expect(paragraph.type).toBe('paragraph');
    const varEl = paragraph.children.find((c: any) => c.type === 'variable');
    expect(varEl).toBeDefined();
    expect(varEl.name).toBe('email');
  });

  it('round-trips variable elements', () => {
    const original: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'Dear ' },
          { type: 'variable', name: 'customer', children: [{ text: '' }] } as any,
          { text: ', welcome!' },
        ],
      },
    ];
    const html = htmlSerializer.serialize(original);
    const result = htmlSerializer.deserialize(html);
    const paragraph = result[0] as any;
    const varEl = paragraph.children.find((c: any) => c.type === 'variable');
    expect(varEl).toBeDefined();
    expect(varEl.name).toBe('customer');
  });
});

describe('htmlSerializer fontColor support', () => {
  it('serializes fontColor as inline style', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'red text', fontColor: '#ff0000' },
        ],
      },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('color:#ff0000');
    expect(html).toContain('red text');
  });

  it('serializes both fontSize and fontColor together', () => {
    const value: Descendant[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'styled', fontSize: 24, fontColor: '#00ff00' },
        ],
      },
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('font-size:24px');
    expect(html).toContain('color:#00ff00');
    expect(html).toMatch(/<span style="[^"]*">/);
  });

  it('deserializes font color from inline style', () => {
    const html = '<p><span style="color:#ff0000">red</span></p>';
    const result = htmlSerializer.deserialize(html);
    const para = result[0] as any;
    const textNode = para.children.find((c: any) => c.text === 'red');
    expect(textNode).toBeDefined();
    expect(textNode.fontColor).toBe('#ff0000');
  });

  it('deserializes both fontSize and fontColor from inline style', () => {
    const html = '<p><span style="font-size:20px;color:blue">styled</span></p>';
    const result = htmlSerializer.deserialize(html);
    const para = result[0] as any;
    const textNode = para.children.find((c: any) => c.text === 'styled');
    expect(textNode).toBeDefined();
    expect(textNode.fontSize).toBe(20);
    expect(textNode.fontColor).toBe('blue');
  });

  it('rejects malformed functional color values', () => {
    const result = htmlSerializer.deserialize(
      '<p><span style="color:rgb(1, 2, 3) trailing">text</span></p>'
    );
    expect((result[0] as any).children).toEqual([{ text: 'text' }]);
  });
});

describe('htmlSerializer video support', () => {
  it('serializes a YouTube video element to HTML with iframe', () => {
    const value: Descendant[] = [
      {
        type: 'video',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
        provider: 'youtube',
        children: [{ text: '' }],
      } as any,
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('data-video-provider="youtube"');
    expect(html).toContain('iframe');
    expect(html).toContain('title="Embedded video"');
    expect(html).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('serializes a direct video to HTML with <video> tag', () => {
    const value: Descendant[] = [
      {
        type: 'video',
        url: 'https://example.com/clip.mp4',
        embedUrl: 'https://example.com/clip.mp4',
        provider: 'direct',
        children: [{ text: '' }],
      } as any,
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('data-video-provider="direct"');
    expect(html).toContain('<video');
    expect(html).toContain('clip.mp4');
  });

  it('serializes video with caption', () => {
    const value: Descendant[] = [
      {
        type: 'video',
        url: 'https://vimeo.com/123',
        embedUrl: 'https://player.vimeo.com/video/123',
        provider: 'vimeo',
        caption: 'My cool video',
        children: [{ text: '' }],
      } as any,
    ];
    const html = htmlSerializer.serialize(value);
    expect(html).toContain('My cool video');
    expect(html).toContain('title="My cool video"');
  });

  it('uses an accessible title when the caption is empty', () => {
    const value: Descendant[] = [{
      type: 'video',
      url: 'https://youtu.be/dQw4w9WgXcQ',
      embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
      provider: 'youtube',
      caption: '',
      children: [{ text: '' }],
    } as any];
    expect(htmlSerializer.serialize(value)).toContain('title="Embedded video"');
  });

  it('deserializes video HTML back to a video element', () => {
    const html = '<div data-video-provider="youtube" data-video-url="https://youtube.com/watch?v=dQw4w9WgXcQ"><iframe src="https://attacker.example/embed"></iframe></div>';
    const result = htmlSerializer.deserialize(html);
    const video = result[0] as any;
    expect(video.type).toBe('video');
    expect(video.provider).toBe('youtube');
    expect(video.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('does not deserialize arbitrary iframes as trusted videos', () => {
    const html = '<div data-video-provider="youtube" data-video-url="https://attacker.example/video"><iframe src="https://attacker.example/embed"></iframe></div>';
    const result = htmlSerializer.deserialize(html);
    expect(result.some((node: any) => node.type === 'video')).toBe(false);
  });
});
