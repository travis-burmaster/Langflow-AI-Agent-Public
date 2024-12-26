'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageContentProps {
  content: string;
  html?: string;
  className?: string;
}

export function MessageContent({ content, html, className = '' }: MessageContentProps) {
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

  return (
    <div className={`relative group ${className}`}>
      {html ? (
        <div 
          dangerouslySetInnerHTML={{ __html: html }}
          className="prose prose-sm max-w-none prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline"
        />
      ) : (
        <p>{content}</p>
      )}
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