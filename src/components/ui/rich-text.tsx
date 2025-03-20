import { cn } from '@/lib/utils';
import { LexicalContent } from '@/lib/types';

interface RichTextProps {
  content: LexicalContent | undefined | null;
  className?: string;
}

export function RichText({ content, className }: RichTextProps) {
  if (!content?.root?.children) return null;

  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      {content.root.children.map((child, index) => {
        if (!child.children) return null;

        // Handle lists
        if (child.type === 'list') {
          const ListComponent = child.listType === 'number' ? 'ol' : 'ul';
          return (
            <ListComponent
              key={index}
              className={cn(
                'mb-4',
                child.listType === 'number' ? 'list-decimal' : 'list-disc',
                'list-inside'
              )}
            >
              {child.children.map((listItem, itemIndex) => (
                <li key={itemIndex} className='ml-4'>
                  {listItem.children?.map((node, nodeIndex) => {
                    if (!node.text) return null;
                    return (
                      <span
                        key={nodeIndex}
                        className={cn(
                          node.format === 1 && 'font-bold',
                          node.format === 2 && 'italic',
                          node.format === 4 && 'underline'
                        )}
                      >
                        {node.text}
                      </span>
                    );
                  })}
                </li>
              ))}
            </ListComponent>
          );
        }

        // Handle regular paragraphs
        return (
          <div key={index} className='mb-4'>
            {child.children.map((node, nodeIndex) => {
              if (!node.text) return null;

              return (
                <span
                  key={nodeIndex}
                  className={cn(
                    node.format === 1 && 'font-bold',
                    node.format === 2 && 'italic',
                    node.format === 4 && 'underline'
                  )}
                >
                  {node.text}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
