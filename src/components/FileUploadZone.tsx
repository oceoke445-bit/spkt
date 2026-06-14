'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMb?: number;
  hint?: string;
  subHint?: string;
  className?: string;
}

export function FileUploadZone({
  files,
  onFilesChange,
  accept = 'image/*,.pdf',
  maxFiles = 5,
  maxSizeMb = 10,
  hint = 'Klik untuk upload atau drag & drop',
  subHint,
  className,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const maxBytes = maxSizeMb * 1024 * 1024;
    const valid: File[] = [];

    for (const file of incoming) {
      if (file.size > maxBytes) {
        toast.error(`${file.name} melebihi ${maxSizeMb}MB`);
        continue;
      }
      valid.push(file);
    }

    const merged = [...files, ...valid].slice(0, maxFiles);
    if (files.length + valid.length > maxFiles) {
      toast.error(`Maksimal ${maxFiles} file`);
    }
    onFilesChange(merged);
  };

  const openPicker = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        className="border-2 border-dashed border-blue-500/50 rounded-lg p-8 text-center hover:border-blue-400 transition-colors bg-blue-800/30 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50"
      >
        <Upload className="w-10 h-10 text-blue-400 mx-auto mb-3" />
        <span className="text-sm text-blue-200 block">{hint}</span>
        {subHint && <p className="text-xs text-blue-300 mt-1">{subHint}</p>}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple={maxFiles > 1}
        accept={accept}
        onChange={handleChange}
        className="sr-only"
        aria-label="Pilih file"
      />
      {files.length > 0 && (
        <div className="mt-3 space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-2 bg-blue-800/50 rounded border border-blue-600/50"
            >
              <span className="text-sm text-blue-100 truncate">{file.name}</span>
              <span className="text-xs text-blue-300 shrink-0 ml-2">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
