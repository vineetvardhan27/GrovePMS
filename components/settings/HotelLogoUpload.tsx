'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';
import { uploadHotelLogoAction, deleteHotelLogoAction } from '../../lib/hotels/actions';
import { useAuth } from '../providers/AuthProvider';

interface HotelLogoUploadProps {
  currentLogoUrl?: string | null;
  hotelName?: string;
  onLogoChange?: (newLogoUrl: string | null) => void;
}

const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const MAX_FILE_SIZE_MB = 5;

export default function HotelLogoUpload({
  currentLogoUrl = null,
  hotelName = 'Hotel Property',
  onLogoChange,
}: HotelLogoUploadProps) {
  const router = useRouter();
  const { refreshStaff } = useAuth();

  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Invalid format (${file.type || 'unknown'}). Please upload a PNG, JPG, or WebP image.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed is ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFileUpload = async (file: File) => {
    const errorMsg = validateFile(file);
    if (errorMsg) {
      setFeedback({ type: 'error', message: errorMsg });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const result = await uploadHotelLogoAction(formData);

      if (result.success && result.logoUrl) {
        setLogoUrl(result.logoUrl);
        onLogoChange?.(result.logoUrl);
        setFeedback({
          type: 'success',
          message: 'Property logo uploaded successfully! Branding has been updated across the PMS.',
        });

        // Immediately update client auth state and server layout
        await refreshStaff();
        router.refresh();

        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: 'error',
          message: result.error || 'Failed to upload logo. Please try again.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'A network error occurred while uploading the logo.',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this property logo? The PMS will revert to default branding.')) {
      return;
    }

    setIsRemoving(true);
    setFeedback(null);

    try {
      const result = await deleteHotelLogoAction();
      if (result.success) {
        setLogoUrl(null);
        onLogoChange?.(null);
        setFeedback({
          type: 'success',
          message: 'Property logo removed. Default PMS branding restored.',
        });

        await refreshStaff();
        router.refresh();

        setTimeout(() => setFeedback(null), 5000);
      } else {
        setFeedback({
          type: 'error',
          message: result.error || 'Failed to remove logo.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'An error occurred while removing the logo.',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        id="hotel-logo-file-input"
      />

      {/* Status Feedback Toast */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-status-green/10 border-status-green/30 text-status-green'
              : 'bg-action-danger/10 border-action-danger/30 text-action-danger'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed">{feedback.message}</span>
        </div>
      )}

      {/* Main Logo Container */}
      {logoUrl ? (
        /* Preview & Replace / Remove View */
        <div className="bg-brand-sand/40 border border-border-subtle rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left: Current Logo Display */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl border border-border-subtle p-2 flex items-center justify-center shadow-xs shrink-0 overflow-hidden relative group">
                <img
                  src={logoUrl}
                  alt={`${hotelName} Logo`}
                  className="max-h-full max-w-full object-contain"
                  loading="eager"
                  crossOrigin="anonymous"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-status-green/15 text-status-green">
                    <Sparkles className="w-3 h-3" />
                    Active Property Logo
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink truncate max-w-xs">{hotelName}</h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Appears on dashboard header, guest folios, F&amp;B receipts, banquet invoices, and PDF reports.
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isRemoving}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-brand-sand/70 text-ink border border-border-subtle rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 cursor-pointer min-h-touch"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-forest" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-brand-forest" />
                    <span>Replace Logo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={isUploading || isRemoving}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-action-danger/10 text-action-danger border border-border-subtle hover:border-action-danger/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer min-h-touch"
                title="Remove logo and use default PMS branding"
              >
                {isRemoving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Upload Dropzone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? 'border-brand-forest bg-brand-forest/5 scale-[1.005]'
              : 'border-border-subtle hover:border-brand-forest/50 hover:bg-brand-sand/30 bg-white'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-forest/10 flex items-center justify-center text-brand-forest">
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <UploadCloud className="w-6 h-6" />
              )}
            </div>

            <div>
              <p className="text-sm font-bold text-ink">
                {isUploading ? (
                  'Uploading logo to secure storage...'
                ) : (
                  <>
                    <span className="text-brand-forest underline underline-offset-2">Click to upload</span> or drag and drop logo image
                  </>
                )}
              </p>
              <p className="text-xs text-ink-muted mt-1">
                Supported formats: <strong>PNG, JPG, JPEG, WebP</strong> (Max {MAX_FILE_SIZE_MB}MB)
              </p>
            </div>

            <button
              type="button"
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-forest hover:bg-brand-forest-dark text-white text-xs font-bold rounded-lg transition-colors shadow-xs disabled:opacity-50 cursor-pointer pointer-events-none mt-1"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Choose Logo File</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recommended Specs Note */}
      <div className="flex items-start gap-2 text-[11px] text-ink-muted bg-brand-sand/30 p-2.5 rounded-lg border border-border-subtle/70">
        <Info className="w-4 h-4 text-brand-forest shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tip for crisp invoices &amp; dashboard:</strong> Transparent PNG or high-res WebP with a square (1:1) or horizontal (up to 3:1) aspect ratio works best. High-resolution logos look sharp on printable bills.
        </p>
      </div>
    </div>
  );
}
