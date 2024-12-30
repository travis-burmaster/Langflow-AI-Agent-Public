'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RemarkGfm from 'remark-gfm';
import RehypeHighlight from 'rehype-highlight';
import RehypeKatex from 'rehype-katex';
import RehypeRaw from 'rehype-raw';
import { unified } from 'unified';

interface MessageContentProps {
  content: string;
  html?: string;
  className?: string;
  isAssistant?: boolean;
}

export function MessageContent({ content, html, className = '', isAssistant }: MessageContentProps) {
  const handleExport = () => {
    const blob = new Blob([html || content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-response-${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Process content with remark and syntax highlighting
  const processedContent = React.useMemo(() => {
    if (html) return html;

    try {
      // Process markdown and add syntax highlighting
      const result = unified()
        .use(RemarkGfm)
        .use(RehypeRaw)
        .use(RehypeHighlight, {
          ignore: ['text'],
          detect: true,
          theme: 'github-dark',
        })
        .use(RehypeKatex)
        .processSync(content)
        .toString();

      return result;
    } catch (error) {
      console.error('Error processing content:', error);
      return content;
    }
  }, [content, html]);

  return (
    <div className={`relative group ${className}`}>
      <div
        className={`
          rounded-lg
          p-4
          ${isAssistant ? 'bg-gray-50 border border-gray-200' : 'bg-white'}
          prose prose-sm max-w-none
          prose-pre:bg-[#0d1117] prose-pre:text-white
          prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline
          prose-code:text-sm prose-code:font-mono
          prose-code:before:content-none prose-code:after:content-none
          prose-headings:text-gray-900 prose-headings:font-semibold
          prose-strong:text-gray-900 prose-strong:font-semibold
          prose-ul:my-2 prose-ul:list-disc prose-ul:pl-4
          prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-4
          prose-li:my-1
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:my-2
          prose-hr:my-4 prose-hr:border-gray-200
          prose-table:border-collapse prose-table:my-2
          prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:bg-gray-100
          prose-td:border prose-td:border-gray-300 prose-td:p-2
          prose-img:my-2 prose-img:rounded-lg
          prose-figure:my-2
          prose-figcaption:text-gray-600 prose-figcaption:text-sm
        `}
      >
        <div dangerouslySetInnerHTML={{ __html: processedContent }} />
      </div>
      
      <div className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExport}
          className="p-1"
          title="Export as HTML"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}