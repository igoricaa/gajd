'use client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { ListItemNode, ListNode } from '@lexical/list';
import { EditorState } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { debounce } from '@/lib/utils/debounce';
import ToolbarPlugin from '../dashboard/forms/toolbar-plugin';
import { LexicalContent } from '@/lib/types';

interface LexicalEditorProps {
  onChangeHandler?: (editorState: LexicalContent) => void;
  value?: LexicalContent | null;
  placeholder?: string;
  className?: string;
}

const theme = {
  paragraph: 'mb-2',
  heading: {
    h1: 'text-4xl font-bold mb-4',
    h2: 'text-3xl font-bold mb-3',
    h3: 'text-2xl font-bold mb-2',
    h4: 'text-xl font-bold mb-2',
    h5: 'text-lg font-bold mb-2',
    h6: 'text-base font-bold mb-2',
  },
  list: {
    ul: 'list-disc list-inside mb-2',
    ol: 'list-decimal list-inside mb-2',
    listitem: 'ml-4',
  },
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline',
    strikethrough: 'line-through',
  },
};

const initialConfig = {
  namespace: 'ResourceOverview',
  theme,
  onError: (error: Error) => {
    console.error(error);
  },
  nodes: [HeadingNode, QuoteNode, ListItemNode, ListNode],
};

function EditorContent({
  onChangeHandler,
  // value,
  placeholder = 'Enter your content here...',
  className,
}: LexicalEditorProps) {
  const [editor] = useLexicalComposerContext();

  // useEffect(() => {
  //   if (value) {
  //     editor.update(() => {
  //       const root = $getRoot();
  //       root.clear();
  //       if (value.root?.children) {
  //         value.root.children.forEach((child) => {
  //           if (child.children) {
  //             child.children.forEach((node) => {
  //               if (node.text) {
  //                 const textNode = $createTextNode(node.text);
  //                 if (node.format) {
  //                   textNode.setFormat(node.format);
  //                 }
  //                 root.append(textNode);
  //               }
  //             });
  //           }
  //         });
  //       }
  //     });
  //   }
  // }, [value, editor]);

  const debouncedOnChange = useCallback(
    debounce((editorState: EditorState) => {
      handleChange(editorState);
    }, 250),
    [onChangeHandler]
  );

  const handleChange = useCallback(
    (editorState: EditorState) => {
      editorState.read(() => {
        const jsonContent = editorState.toJSON() as LexicalContent;
        onChangeHandler?.(jsonContent);
      });
    },
    [onChangeHandler]
  );

  return (
    <div
      className={cn(
        'relative w-full rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        className
      )}
    >
      <ToolbarPlugin />
      <div className='px-3 py-2 relative'>
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className='min-h-[150px] outline-none'
              aria-placeholder={placeholder}
              placeholder={
                <div className='absolute top-2 left-3 pointer-events-none select-none text-muted-foreground'>
                  {placeholder}
                </div>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <HistoryPlugin />
        <OnChangePlugin onChange={debouncedOnChange} />
      </div>
    </div>
  );
}

export function LexicalEditor(props: LexicalEditorProps) {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      <EditorContent {...props} />
    </LexicalComposer>
  );
}
