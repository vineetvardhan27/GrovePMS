'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

interface IdUploadDropzoneProps {
  onFileSelected?: (file: File | null) => void;
  disabled?: boolean;
}

export default function IdUploadDropzone({
  onFileSelected,
  disabled = false,
}: IdUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    setErrorMessage(null);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    const isAllowed = allowedTypes.includes(file.type) || /\.(jpe?g|png|webp|pdf)$/i.test(file.name);

    if (!isAllowed) {
      setErrorMessage('Unsupported format. Please select a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    setSelectedFile(file);
    if (onFileSelected) {
      onFileSelected(file);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelected) {
      onFileSelected(null);
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
        id="guest_id_upload_input"
      />

      {errorMessage && (
        <div className="flex items-center gap-2 p-2.5 bg-status-red/10 border border-status-red/20 rounded-lg text-xs text-status-red">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {selectedFile ? (
        /* Attached File State */
        <div className="p-3.5 bg-brand-sand/30 border border-brand-forest/20 rounded-xl flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-brand-forest/10 text-brand-forest flex items-center justify-center shrink-0">
              {selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf') ? (
                <FileText className="w-5 h-5" />
              ) : (
                <ImageIcon className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-xs text-ink truncate block max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-status-green bg-status-green/10 px-1.5 py-0.5 rounded shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Attached
                </span>
              </div>
              <p className="text-[11px] text-ink-muted">
                {formatFileSize(selectedFile.size)} • Stored securely with reservation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="px-2.5 py-1 text-xs font-semibold text-brand-forest hover:bg-brand-sand rounded-lg transition-colors cursor-pointer min-h-touch"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="p-1 text-ink-muted hover:text-status-red rounded-lg transition-colors cursor-pointer"
              title="Remove file"
              aria-label="Remove attached file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Empty Dropzone State */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? 'border-brand-forest bg-brand-forest/5 scale-[0.99]'
              : 'border-border-subtle hover:border-brand-forest/40 hover:bg-brand-sand/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-brand-sand flex items-center justify-center text-brand-forest mb-0.5">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-ink">
              <span className="text-brand-forest underline underline-offset-2">Click to select ID card</span> or drag &amp; drop
            </p>
            <p className="text-[11px] text-ink-muted">
              Supported formats: JPG, PNG, PDF (up to 10MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
