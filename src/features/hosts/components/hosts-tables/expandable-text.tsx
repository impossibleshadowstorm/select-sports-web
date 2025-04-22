import { useState } from 'react';

export function ExpandableText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const previewLength = 30; // Adjust as needed

  return (
    <div>
      {expanded ? text : text.slice(0, previewLength) + '... '}
      {text.length > previewLength && (
        <span
          className='cursor-pointer text-blue-500'
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show Less' : 'Read More'}
        </span>
      )}
    </div>
  );
}
