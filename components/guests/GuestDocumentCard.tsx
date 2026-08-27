'use client';

import { useState } from 'react';
import {
  FileText,
  Lock,
  Eye,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Upload,
  AlertCircle,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import {
  GuestDocument,
  getGuestDocumentSignedUrlAction,
  deleteGuestDocumentAction,
  uploadGuestDocumentAction,
} from '../../lib/guests/documents';
import { maskIdNumber } from '../../lib/utils/idExtractor';
import { formatDate } from '../../lib/utils/dates';
import ViewDocumentModal from './ViewDocumentModal';
import IdUploadDropzone from './IdUploadDropzone';

interface GuestDocumentCardProps {
  guestId: string;
  guestName: string;
  initialDocuments?: GuestDocument[];
  idType?: string | null;
  idNumber?: string | null;
  canManage?: boolean; // Owner / Manager role
}

export default function GuestDocumentCard({
  guestId,
  guestName,
  initialDocuments = [],
  idType,
  idNumber,
  canManage = true,
}: GuestDocumentCardProps) {
  const [documents, setDocuments] = useState<GuestDocument[]>(initialDocuments);
  const [activeDocForViewing, setActiveDocForViewing] = useState<GuestDocument | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeDoc = documents[0] || null;
  const displayIdType = activeDoc?.document_type || idType || 'Identity Document';
  const displayIdNumber = activeDoc?.document_number_masked || (idNumber ? maskIdNumber(idType, idNumber) : 'On File');

  const handleView = async (doc: GuestDocument) => {
    setErrorMessage(null);
    setIsViewing(true);
    setActiveDocForViewing(doc);

    try {
      const res = await getGuestDocumentSignedUrlAction(doc.id, doc.storage_path, doc.guest_id);
      if (res.signedUrl) {
        setSignedUrl(res.signedUrl);
      } else {
        setErrorMessage(res.error || 'Failed to retrieve secure document.');
        setIsViewing(false);
        setActiveDocForViewing(null);
      }
    } catch (err: any) {
      setErrorMessage(`Error loading document: ${err?.message || String(err)}`);
      setIsViewing(false);
      setActiveDocForViewing(null);
    }
  };

  const handleCloseViewer = () => {
    setIsViewing(false);
    setActiveDocForViewing(null);
    setSignedUrl(null); // Clear from browser memory
  };

  const handleDelete = async (doc: GuestDocument) => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await deleteGuestDocumentAction(doc.id, doc.storage_path);
      if (res.success) {
        setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
        setShowDeleteConfirm(null);
      } else {
        setErrorMessage(res.error || 'Failed to delete document.');
      }
    } catch (err: any) {
      setErrorMessage(`Error deleting document: ${err?.message || String(err)}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUploadNewFile = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('guest_id', guestId);
      formData.append('document_type', idType || 'Aadhaar');
      formData.append('id_number', idNumber || '');

      const res = await uploadGuestDocumentAction(formData);
      if (res.success && res.document) {
        setDocuments([res.document, ...documents]);
        setShowUploadForm(false);
      } else {
        setErrorMessage(res.error || 'Upload failed.');
      }
    } catch (err: any) {
      setErrorMessage(`Upload error: ${err?.message || String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border-subtle p-6 shadow-2xs space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-brand-sand rounded-lg text-brand-forest">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-ink text-base">Identity Documents</h3>
            <p className="text-xs text-ink-muted">Government ID verification &amp; private document storage</p>
          </div>
        </div>

        {activeDoc && !showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className="text-xs font-semibold text-brand-forest hover:text-brand-forest-light flex items-center gap-1 min-h-touch"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Replace ID</span>
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-3 bg-status-red/10 border border-status-red/20 rounded-lg text-xs text-status-red">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone when replacing or adding initial document */}
      {(!activeDoc || showUploadForm) && (
        <div className="space-y-3 pt-1">
          <IdUploadDropzone
            onFileSelected={handleUploadNewFile}
            disabled={isUploading}
          />
          {showUploadForm && activeDoc && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="text-xs text-ink-muted hover:text-ink font-medium"
              >
                Cancel replacement
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active Document Card (Hidden by default) */}
      {activeDoc && !showUploadForm && (
        <div className="p-4 bg-brand-sand/25 border border-border-subtle rounded-xl space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-ink text-sm">{displayIdType}</span>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-brand-forest/10 text-brand-forest font-bold border border-brand-forest/20">
                  {displayIdNumber}
                </span>
              </div>
              <p className="text-xs text-ink-muted flex items-center gap-1.5">
                <span>{activeDoc.original_filename}</span>
                <span>•</span>
                <span>Uploaded {formatDate(activeDoc.created_at)}</span>
              </p>
            </div>

            {/* Hidden Document Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Document hidden</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
            <div className="flex items-center gap-1.5 text-xs text-brand-forest font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Private &amp; audited storage</span>
            </div>

            <div className="flex items-center gap-2">
              {canManage && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(activeDoc.id)}
                  className="p-1.5 text-ink-muted hover:text-status-red hover:bg-status-red/10 rounded-lg transition-colors"
                  title="Delete Document"
                  aria-label="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => handleView(activeDoc)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-forest hover:bg-brand-forest-light text-white text-xs font-bold rounded-lg transition-colors shadow-2xs min-h-touch"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-border-subtle space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-status-red">
              <div className="p-2.5 rounded-full bg-status-red/10">
                <Trash2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-ink text-base">Delete ID Document?</h4>
            </div>

            <p className="text-xs text-ink-muted">
              This will permanently remove the uploaded identity document from private storage. The guest profile and stay history will remain preserved.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-brand-sand hover:bg-brand-sand-dark text-ink text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => activeDoc && handleDelete(activeDoc)}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-status-red hover:bg-status-red/90 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-2xs disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Delete ID</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal */}
      <ViewDocumentModal
        isOpen={isViewing}
        onClose={handleCloseViewer}
        document={activeDocForViewing}
        signedUrl={signedUrl}
        guestName={guestName}
      />
    </div>
  );
}
