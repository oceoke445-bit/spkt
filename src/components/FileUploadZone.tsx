'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Upload, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

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

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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

  const openPreview = (file: File) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  const canPreviewInline = previewFile && previewUrl && (isImageFile(previewFile) || isPdfFile(previewFile));

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
              className="flex items-center gap-3 p-2 bg-blue-800/50 rounded border border-blue-600/50"
            >
              <span className="text-sm text-blue-100 truncate flex-1 min-w-0">{file.name}</span>
              <span className="text-xs text-blue-300 shrink-0">
                {(file.size / 1024).toFixed(1)} KB
              </span>
              <Button
                type="button"
                size="sm"
                onClick={() => openPreview(file)}
                className="shrink-0 h-8 px-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white border-0 shadow-md"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5 text-sky-100" />
                Review
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={previewFile !== null} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent
          className="bg-gradient-to-br from-blue-900/95 to-blue-800/95 border-blue-500/50 backdrop-blur max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          <DialogHeader>
            <DialogTitle className="text-white truncate pr-6">
              {previewFile?.name ?? 'Pratinjau File'}
            </DialogTitle>
            <DialogDescription className="text-blue-200">
              {previewFile
                ? `${(previewFile.size / 1024).toFixed(1)} KB`
                : 'Pratinjau dokumen yang diupload'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 overflow-auto rounded-lg border border-blue-500/40 bg-blue-950/50">
            {canPreviewInline && isImageFile(previewFile) && (
              <img
                src={previewUrl}
                alt={previewFile.name}
                className="max-h-[70vh] w-full object-contain mx-auto"
              />
            )}
            {canPreviewInline && isPdfFile(previewFile) && (
              <iframe
                src={previewUrl}
                title={previewFile.name}
                className="w-full h-[70vh] min-h-[400px] bg-white rounded"
              />
            )}
            {previewFile && previewUrl && !isImageFile(previewFile) && !isPdfFile(previewFile) && (
              <div className="p-8 text-center text-blue-200">
                <p className="mb-4">Pratinjau tidak tersedia untuk tipe file ini.</p>
                <Button
                  type="button"
                  onClick={() => window.open(previewUrl, '_blank', 'noopener,noreferrer')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  Buka di tab baru
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
