import { useCallback, useMemo, useRef } from 'react';
import type { Descendant } from 'slate';
import type { RenderElementProps, RenderLeafProps } from 'slate-react';

import type { EditorPlugin, RichTextEditor } from '../core/types';
import { DEFAULT_INITIAL_VALUE } from '../core/constants';
import { createRichTextEditor } from '../core/createEditor';

import { Leaf } from '../components/Leaves/Leaf';
import {
  Paragraph,
  Heading,
  Blockquote,
  CodeBlock,
  BulletedList,
  NumberedList,
  ListItem,
  ImageElement,
  LinkElement,
  VariableElement,
  VideoElement,
  Table,
  TableRow,
  TableCell,
  DefaultElement,
} from '../components/Elements';

interface UseRichTextEditorOptions {
  /** Initial document value */
  initialValue?: Descendant[];
  /** Additional plugins */
  plugins?: EditorPlugin[];
}

interface UseRichTextEditorReturn {
  /** The configured Slate editor instance */
  editor: RichTextEditor;
  /** The initial value to pass to <Slate> */
  initialValue: Descendant[];
  /** Default renderElement function */
  renderElement: (props: RenderElementProps) => JSX.Element;
  /** Default renderLeaf function */
  renderLeaf: (props: RenderLeafProps) => JSX.Element;
}

/**
 * Headless hook that provides a configured editor instance and default
 * renderers without any UI wrapper.
 *
 * Use this when you want full control over the layout and need to
 * compose your own `<Slate>` + `<Editable>` setup.
 *
 * @example
 * ```tsx
 * import { useRichTextEditor } from 'fc-react-rich-editor';
 * import { Slate, Editable } from 'slate-react';
 *
 * function MyEditor() {
 *   const { editor, initialValue, renderElement, renderLeaf } = useRichTextEditor();
 *
 *   return (
 *     <Slate editor={editor} initialValue={initialValue}>
 *       <MyCustomToolbar />
 *       <Editable
 *         renderElement={renderElement}
 *         renderLeaf={renderLeaf}
 *       />
 *     </Slate>
 *   );
 * }
 * ```
 */
export function useRichTextEditor(
  options: UseRichTextEditorOptions = {}
): UseRichTextEditorReturn {
  const { initialValue: userInitialValue, plugins } = options;

  const editor = useMemo(
    () => createRichTextEditor(plugins),
    [] // stable across renders
  );

  const initialValue = useMemo(
    () => userInitialValue ?? DEFAULT_INITIAL_VALUE,
    []
  );

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case 'paragraph':
        return <Paragraph {...props} />;
      case 'heading':
        return <Heading {...props} />;
      case 'blockquote':
        return <Blockquote {...props} />;
      case 'code-block':
        return <CodeBlock {...props} />;
      case 'bulleted-list':
        return <BulletedList {...props} />;
      case 'numbered-list':
        return <NumberedList {...props} />;
      case 'list-item':
        return <ListItem {...props} />;
      case 'image':
        return <ImageElement {...props} />;
      case 'link':
        return <LinkElement {...props} />;
      case 'variable':
        return <VariableElement {...props} />;
      case 'video':
        return <VideoElement {...props} />;
      case 'table':
        return <Table {...props} />;
      case 'table-row':
        return <TableRow {...props} />;
      case 'table-cell':
        return <TableCell {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    return <Leaf {...props} />;
  }, []);

  return {
    editor,
    initialValue,
    renderElement,
    renderLeaf,
  };
}
