'use client';

import { useState } from 'react';
import { Upload, File, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/utils/supabase/client';

type UploadStatus = {
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
};

export default function DocumentsPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      
      // Initialize status for new files
      const newStatuses = newFiles.map(file => ({
        fileName: file.name,
        status: 'pending' as const,
        progress: 0
      }));
      setUploadStatus(prev => [...prev, ...newStatuses]);
    }
  };

  const updateFileStatus = (fileName: string, update: Partial<UploadStatus>) => {
    setUploadStatus(prev => prev.map(status => 
      status.fileName === fileName ? { ...status, ...update } : status
    ));
  };

  const processFile = async (file: File) => {
    try {
      // Update status to processing
      updateFileStatus(file.name, { status: 'processing', progress: 30 });

      // Read file content
      const text = await file.text();
      
      // Call your API to process the file
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          fileName: file.name
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      // Update status to completed
      updateFileStatus(file.name, { status: 'completed', progress: 100 });
    } catch (error) {
      console.error('Error processing file:', error);
      updateFileStatus(file.name, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error', 
        progress: 0
      });
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      // Process all files sequentially
      for (const file of files) {
        await processFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadStatus(prev => prev.filter(status => status.fileName !== fileName));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Document Upload</h1>
        
        <div className="mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".txt,.doc,.docx,.pdf"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <span className="text-gray-600">Drag and drop your files here or click to browse</span>
              <span className="text-sm text-gray-500 mt-2">Supported formats: TXT, DOC, DOCX, PDF</span>
            </label>
          </div>
        </div>

        {uploadStatus.length > 0 && (
          <div className="space-y-4 mb-6">
            {uploadStatus.map((status) => (
              <div key={status.fileName} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <File className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700 font-medium">{status.fileName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(status.fileName)}
                    disabled={isUploading}
                  >
                    Remove
                  </Button>
                </div>
                
                <Progress value={status.progress} className="h-2" />
                
                <div className="mt-2 text-sm">
                  {status.status === 'pending' && (
                    <span className="text-gray-500">Pending</span>
                  )}
                  {status.status === 'processing' && (
                    <span className="text-blue-500">Processing...</span>
                  )}
                  {status.status === 'completed' && (
                    <span className="text-green-500">Completed</span>
                  )}
                  {status.status === 'error' && (
                    <span className="text-red-500">{status.error || 'Error processing file'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isUploading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload Documents'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
