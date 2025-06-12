'use client';

import { forwardRef, useRef } from 'react';
import { Paperclip } from 'lucide-react';
import { clsx } from 'clsx';
import type { FileAttachment } from './types';

interface FileUploaderProps {
  onFilesSelect: (files: FileAttachment[]) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onFilesSelect, disabled, accept = "*/*", maxSize = 10 * 1024 * 1024, maxFiles = 5 }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      
      if (files.length === 0) return;

      const validFiles: FileAttachment[] = [];
      
      for (const file of files.slice(0, maxFiles)) {
        if (file.size > maxSize) {
          alert(`File "${file.name}" is too large. Maximum size is ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
          continue;
        }

        const attachment: FileAttachment = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file)
        };

        // For small files, convert to base64
        if (file.size < 1024 * 1024) { // 1MB
          const reader = new FileReader();
          reader.onload = (e) => {
            attachment.data = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        validFiles.push(attachment);
      }

      if (validFiles.length > 0) {
        onFilesSelect(validFiles);
      }

      // Reset input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    return (
      <>
        <input
          ref={ref || inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => (ref as React.RefObject<HTMLInputElement>)?.current?.click() || inputRef.current?.click()}
          className={clsx(
            'p-2 rounded-lg transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          disabled={disabled}
          title="Attach files"
        >
          <Paperclip size={20} />
        </button>
      </>
    );
  }
);

FileUploader.displayName = 'FileUploader';