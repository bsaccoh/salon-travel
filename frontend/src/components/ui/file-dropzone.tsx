'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { apiClient } from '@/lib/api-client';

export interface FileDropzoneProps {
  onUploadSuccess?: (result: { url: string; key: string; fileName: string; fileSize: number; mimeType: string }) => void;
  folder?: 'documents' | 'services' | 'avatars' | 'general';
  acceptedTypes?: string[];
  maxSizeMB?: number;
  label?: string;
  description?: string;
  className?: string;
}

export function FileDropzone({
  onUploadSuccess,
  folder = 'documents',
  acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  maxSizeMB = 10,
  label = 'Upload File',
  description = 'Drag & drop your PDF or image here, or browse from device (up to 10MB)',
  className = '',
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploadSuccess(false);

    // Validate type
    if (acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
      setError(`Invalid file type (${file.type || 'unknown'}). Please upload a PDF or image (JPEG, PNG, WebP).`);
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);

    // Generate preview if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    // Auto upload
    try {
      setIsUploading(true);
      const res = await apiClient.uploadFile(file, folder);
      setIsUploading(false);
      setUploadSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(res);
      }
    } catch (err: any) {
      setIsUploading(false);
      setError(err.message || 'Failed to upload file. Please try again.');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadSuccess(false);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-xs font-semibold text-text uppercase tracking-wider">{label}</label>}

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.01]'
              : 'border-border hover:border-primary/50 hover:bg-surface/80 bg-surface'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-text mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-text-muted max-w-sm mx-auto">
            {description}
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="w-12 h-12 object-cover rounded-xl border border-border shrink-0"
              />
            ) : selectedFile.type === 'application/pdf' ? (
              <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}

            <div className="min-w-0">
              <p className="text-sm font-bold text-text truncate">{selectedFile.name}</p>
              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                <span>{formatFileSize(selectedFile.size)}</span>
                <span>•</span>
                {isUploading ? (
                  <span className="text-primary flex items-center gap-1 font-medium">
                    <Loader2 className="w-3 h-3 animate-spin" /> Uploading...
                  </span>
                ) : uploadSuccess ? (
                  <span className="text-success flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded successfully
                  </span>
                ) : (
                  <span className="text-text-muted uppercase text-[10px] font-bold">Ready</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors shrink-0"
            title="Remove file"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-danger font-medium mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
