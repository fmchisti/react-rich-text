import { createEditor, Editor, Transforms, Element as SlateElement } from 'slate';
import { describe, expect, it } from 'vitest';
import { withVariables } from './withVariables';

describe('withVariables', () => {
  it('converts a completed {{name}} pattern into a variable element', () => {
    const editor = withVariables(createEditor());
    editor.children = [{ type: 'paragraph', children: [{ text: '' }] }];
    Transforms.select(editor, { path: [0, 0], offset: 0 });

    for (const character of '{{name}}') editor.insertText(character);

    const variables = Array.from(Editor.nodes(editor, {
      at: [],
      match: (node) => SlateElement.isElement(node) && node.type === 'variable',
    }));
    expect(variables).toHaveLength(1);
    expect((variables[0][0] as any).name).toBe('name');
  });
});
