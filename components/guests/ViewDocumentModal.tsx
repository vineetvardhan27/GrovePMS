'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Download,
  FileText,
  ShieldCheck,
  Calendar,
  User,
  ExternalLink,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
} from 'lucide-react';
import { GuestDocument, downloadGuestDocumentAction } from '../../lib/guests/documents';
import { formatDate } from '../../lib/utils/dates';

interface ViewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: GuestDocument | null;
  signedUrl: string | null;
  guestName: string;
}

export default function ViewDocumentModal({
  isOpen,
  onClose,
  document,
  signedUrl,
  guestName,
}: ViewDocumentModalProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setImageLoaded(false);
    }
  }, [isOpen, document]);

  if (!isOpen || !document) return null;

  const isPdf = document.mime_type === 'application/pdf' || document.original_filename.toLowerCase().endsWith('.pdf');

  const handleDownload = async () => {
    if (!document) return;
    setIsDownloading(true);
    try {
      const res = await downloadGuestDocumentAction(document.id);
      if (res.signedUrl && typeof window !== 'undefined') {
        const link = window.document.createElement('a');
        link.href = res.signedUrl;
        link.download = document.original_filename;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      }
    } catch (e) {
      console.error('Download error:', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-border-subtle overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view_doc_title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-brand-sand/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-forest/10 text-brand-forest border border-brand-forest/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="view_doc_title" className="font-serif font-bold text-ink text-base">
                  {document.document_type} Document
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand-forest/10 text-brand-forest border border-brand-forest/20 font-mono">
                  {document.document_number_masked || 'ID Protected'}
                </span>
              </div>
              <p className="text-xs text-ink-muted flex items-center gap-1.5 mt-0.5">
                <span>Guest: <strong>{guestName}</strong></span>
                <span>•</span>
                <span>Uploaded {formatDate(document.created_at)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-brand-sand border border-border-subtle text-xs font-semibold text-ink rounded-lg transition-colors shadow-2xs min-h-touch disabled:opacity-50"
              title="Download original document"
            >
              {isDownloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-brand-forest" />}
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-brand-sand transition-colors min-h-touch min-w-[44px] flex items-center justify-center"
              aria-label="Close document viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="flex-1 overflow-auto bg-stone-900/95 relative flex items-center justify-center p-4 min-h-[380px]">
          {!signedUrl ? (
            <div className="text-center p-8 text-white/80 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-sand" />
              <p className="text-sm font-medium">Securing private viewing channel...</p>
            </div>
          ) : isPdf ? (
            <iframe
              src={`${signedUrl}#toolbar=0`}
              className="w-full h-full min-h-[500px] rounded-lg bg-white border-0"
              title={`${document.document_type} PDF Viewer`}
            />
          ) : (
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden min-h-[400px]">
              <img
                src={signedUrl}
                alt={`${guestName} - ${document.document_type}`}
                onLoad={() => setImageLoaded(true)}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />

              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                </div>
              )}

              {/* Floating Image Controls */}
              {imageLoaded && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink/80 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 text-white text-xs shadow-xl">
                  <button
                    onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] px-1 font-semibold">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Zoom In"
                    aria-label="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-white/20 my-auto" />
                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                    title="Rotate 90°"
                    aria-label="Rotate Document"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer & Privacy Banner */}
        <div className="px-6 py-3 border-t border-border-subtle bg-brand-sand/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-muted">
          <div className="flex items-center gap-1.5 text-brand-forest">
            <ShieldCheck className="w-4 h-4 text-brand-forest shrink-0" />
            <span>Private &amp; encrypted. View session expires automatically in 60s.</span>
          </div>

          <div className="flex items-center gap-4 text-ink-muted">
            <span>File: <strong className="font-mono text-ink">{document.original_filename}</strong> ({Math.round(document.file_size / 1024)} KB)</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-ink text-white hover:bg-ink/90 font-medium rounded-lg text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
