'use client';

import {
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { useState, useCallback, useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection } from 'lexical';
import { mergeRegister } from '@lexical/utils';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered } from 'lucide-react';
import { cn } from '@/lib/utils';

const LowPriority = 1;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isInBulletList, setIsInBulletList] = useState(false);
  const [isInNumberedList, setIsInNumberedList] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, $updateToolbar]);

  const formatBold = (e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
    editor.focus();
  };

  const formatItalic = (e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
    editor.focus();
  };

  const formatUnderline = (e: React.MouseEvent) => {
    e.preventDefault();
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
    editor.focus();
  };

  const formatBulletList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      setIsInBulletList(false);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      setIsInBulletList(true);
    }
    editor.focus();
  };

  const formatNumberedList = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInNumberedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
      setIsInNumberedList(false);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      setIsInNumberedList(true);
    }
    editor.focus();
  };

  return (
    <div className='flex flex-wrap gap-1 p-1 border-b'>
      <Button
        variant='outline'
        size='sm'
        onClick={formatBold}
        className={cn(
          'h-8 w-8 p-0',
          isBold && 'bg-primary text-primary-foreground'
        )}
      >
        <Bold className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={formatItalic}
        className={cn(
          'h-8 w-8 p-0',
          isItalic && 'bg-primary text-primary-foreground'
        )}
      >
        <Italic className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={formatUnderline}
        className={cn(
          'h-8 w-8 p-0',
          isUnderline && 'bg-primary text-primary-foreground'
        )}
      >
        <Underline className='h-4 w-4' />
      </Button>
      <div className='w-px h-6 bg-border mx-1' />
      <Button
        variant='outline'
        size='sm'
        onClick={formatBulletList}
        className='h-8 w-8 p-0'
      >
        <List className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={formatNumberedList}
        className='h-8 w-8 p-0'
      >
        <ListOrdered className='h-4 w-4' />
      </Button>
    </div>
  );
}
