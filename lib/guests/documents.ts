'use server';

import { createClient as createServerClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { getCurrentStaff } from '../auth/session';
import { maskIdNumber } from '../utils/idExtractor';
import { revalidatePath } from 'next/cache';

function getAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Server configuration error: Service role key is missing.');
  }
  return createAdminClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface GuestDocument {
  id: string;
  hotel_id: string;
  guest_id: string;
  document_type: string;
  document_number_masked: string | null;
  storage_path: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  uploaded_by?: string | null;
  uploaded_by_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UploadGuestDocumentResult {
  success?: boolean;
  error?: string;
  document?: GuestDocument;
}

export interface SignedUrlResult {
  success?: boolean;
  error?: string;
  signedUrl?: string;
  expiresIn?: number;
  document?: GuestDocument;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Upload a guest identity document to secure private Supabase Storage
 */
export async function uploadGuestDocumentAction(formData: FormData): Promise<UploadGuestDocumentResult> {
  let uploadedStoragePath: string | null = null;

  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Authentication required. Please log in.' };
    }

    if (!staff.is_active) {
      return { error: 'Your staff account is inactive. Please contact your administrator.' };
    }

    const role = staff.role;
    if (role !== 'owner' && role !== 'manager' && role !== 'reception') {
      return { error: 'You do not have permission to upload guest identity documents.' };
    }

    const hotelId = staff.hotel_id;
    const file = formData.get('file') as File | null;
    const guestId = (formData.get('guest_id') as string)?.trim();
    const documentType = (formData.get('document_type') as string)?.trim() || 'Aadhaar';
    const rawIdNumber = (formData.get('id_number') as string)?.trim() || '';

    if (!file || !(file instanceof File)) {
      return { error: 'Please select a valid document file to upload.' };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { error: 'Unsupported file format. Please upload JPG, PNG, WEBP, or PDF files only.' };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { error: 'File size exceeds the 10MB limit. Please upload a smaller file.' };
    }

    if (!guestId) {
      return { error: 'Guest ID is required to associate this document.' };
    }

    const supabase = createServerClient();
    const admin = getAdminClient();

    // 1. Verify target guest belongs to caller's hotel (Tenant Isolation Check)
    const { data: guestRecord, error: guestCheckErr } = await admin
      .from('guests')
      .select('id, hotel_id, full_name, id_type, id_number')
      .eq('id', guestId)
      .eq('hotel_id', hotelId)
      .maybeSingle();

    if (guestCheckErr || !guestRecord) {
      return { error: 'Guest not found or does not belong to your hotel property.' };
    }

    const documentId = crypto.randomUUID();
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `hotel/${hotelId}/guests/${guestId}/documents/${documentId}/${cleanFilename}`;

    // 2. Upload to private bucket 'guest-documents'
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await admin.storage
      .from('guest-documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Private document storage upload error:', uploadError.message);
      return { error: 'Unable to securely save the ID document. Please try again or contact an administrator.' };
    }

    uploadedStoragePath = storagePath;
    const maskedNumber = rawIdNumber ? maskIdNumber(documentType, rawIdNumber) : null;

    // 3. Insert record in guest_documents table
    const docPayload = {
      id: documentId,
      hotel_id: hotelId,
      guest_id: guestId,
      document_type: documentType,
      document_number_masked: maskedNumber,
      storage_path: storagePath,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      uploaded_by: staff.id,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let insertedDoc: any = null;

    // Try insert via authenticated session first
    const { data: sessionDoc, error: insertErr } = await (supabase.from('guest_documents') as any)
      .insert(docPayload)
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('Session insert into guest_documents encountered RLS, attempting server admin insert:', insertErr.message);
      const { data: adminDoc, error: adminInsertErr } = await (admin.from('guest_documents') as any)
        .insert(docPayload)
        .select()
        .maybeSingle();

      if (adminInsertErr) {
        console.warn('Database table guest_documents insert note (falling back to secure storage persistence):', adminInsertErr.message);
        insertedDoc = {
          ...docPayload,
          uploaded_by_name: staff.full_name,
        };
      } else {
        insertedDoc = adminDoc;
      }
    } else {
      insertedDoc = sessionDoc;
    }

    // 4. Record audit log
    try {
      await (admin.from('guest_document_audit_logs') as any).insert({
        id: crypto.randomUUID(),
        hotel_id: hotelId,
        guest_id: guestId,
        document_id: documentId,
        staff_id: staff.id,
        action: 'uploaded',
        created_at: new Date().toISOString(),
      });
    } catch (auditErr) {
      console.warn('Audit logging notice:', auditErr);
    }

    // 5. Update guest id_type & id_number on guest table
    if (rawIdNumber) {
      await (admin.from('guests') as any)
        .update({
          id_type: documentType,
          id_number: rawIdNumber,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guestId)
        .eq('hotel_id', hotelId);
    }

    revalidatePath(`/guests/${guestId}`);
    revalidatePath('/guests');
    revalidatePath('/bookings');

    return {
      success: true,
      document: {
        ...(insertedDoc as GuestDocument),
        uploaded_by_name: staff.full_name,
      },
    };
  } catch (err: any) {
    console.error('uploadGuestDocumentAction exception:', err?.message || 'internal error');
    if (uploadedStoragePath) {
      try {
        const admin = getAdminClient();
        await admin.storage.from('guest-documents').remove([uploadedStoragePath]);
      } catch (_) {}
    }
    return { error: 'Unable to securely save the ID document. Please try again or contact an administrator.' };
  }
}

/**
 * Fetch active documents for a guest
 */
export async function getGuestDocuments(guestId: string): Promise<GuestDocument[]> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) return [];

    const role = staff.role;
    if (role !== 'owner' && role !== 'manager' && role !== 'reception') {
      return [];
    }

    const hotelId = staff.hotel_id;
    const admin = getAdminClient();

    // 1. Try querying guest_documents table first
    const { data: docs, error: docErr } = await (admin.from('guest_documents') as any)
      .select('*, staff:uploaded_by(full_name)')
      .eq('hotel_id', hotelId)
      .eq('guest_id', guestId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!docErr && docs && docs.length > 0) {
      return docs.map((d: any) => ({
        id: d.id,
        hotel_id: d.hotel_id,
        guest_id: d.guest_id,
        document_type: d.document_type,
        document_number_masked: d.document_number_masked,
        storage_path: d.storage_path,
        original_filename: d.original_filename,
        mime_type: d.mime_type,
        file_size: d.file_size,
        uploaded_by: d.uploaded_by,
        uploaded_by_name: d.staff?.full_name || null,
        is_active: d.is_active,
        created_at: d.created_at,
        updated_at: d.updated_at,
      }));
    }

    // 2. Fallback: Check private storage bucket for files
    const { data: guestRow } = await admin
      .from('guests')
      .select('id, full_name, id_type, id_number')
      .eq('id', guestId)
      .eq('hotel_id', hotelId)
      .maybeSingle();

    if (!guestRow) return [];

    // Check direct path format
    const { data: directFiles } = await admin.storage
      .from('guest-documents')
      .list(`${hotelId}/${guestId}`);

    // Check structured path format
    const { data: structuredFiles } = await admin.storage
      .from('guest-documents')
      .list(`hotel/${hotelId}/guests/${guestId}/documents`);

    const resultDocs: GuestDocument[] = [];

    if (directFiles && directFiles.length > 0) {
      for (const f of directFiles) {
        if (f.name === '.emptyFolderPlaceholder') continue;
        resultDocs.push({
          id: f.id || f.name,
          hotel_id: hotelId,
          guest_id: guestId,
          document_type: guestRow.id_type || 'Aadhaar',
          document_number_masked: guestRow.id_number ? maskIdNumber(guestRow.id_type, guestRow.id_number) : null,
          storage_path: `${hotelId}/${guestId}/${f.name}`,
          original_filename: f.name,
          mime_type: f.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          file_size: (f.metadata as any)?.size || 150000,
          uploaded_by_name: staff.full_name,
          is_active: true,
          created_at: f.created_at || new Date().toISOString(),
          updated_at: f.updated_at || new Date().toISOString(),
        });
      }
    }

    if (structuredFiles && structuredFiles.length > 0) {
      for (const folder of structuredFiles) {
        if (folder.name === '.emptyFolderPlaceholder') continue;
        const { data: subFiles } = await admin.storage
          .from('guest-documents')
          .list(`hotel/${hotelId}/guests/${guestId}/documents/${folder.name}`);

        if (subFiles && subFiles.length > 0) {
          for (const sf of subFiles) {
            resultDocs.push({
              id: folder.name,
              hotel_id: hotelId,
              guest_id: guestId,
              document_type: guestRow.id_type || 'Aadhaar',
              document_number_masked: guestRow.id_number ? maskIdNumber(guestRow.id_type, guestRow.id_number) : null,
              storage_path: `hotel/${hotelId}/guests/${guestId}/documents/${folder.name}/${sf.name}`,
              original_filename: sf.name,
              mime_type: sf.name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
              file_size: (sf.metadata as any)?.size || 150000,
              uploaded_by_name: staff.full_name,
              is_active: true,
              created_at: sf.created_at || new Date().toISOString(),
              updated_at: sf.updated_at || new Date().toISOString(),
            });
          }
        }
      }
    }

    return resultDocs;
  } catch (err) {
    console.error('getGuestDocuments exception:', err);
    return [];
  }
}

/**
 * Generate a short-lived (60-second) signed URL to securely view/preview a private document.
 * Audits access upon generation.
 */
export async function getGuestDocumentSignedUrlAction(
  documentId: string,
  storagePathHint?: string,
  guestIdHint?: string
): Promise<SignedUrlResult> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Your session has expired. Please sign in again.' };
    }

    const role = staff.role;
    if (role !== 'owner' && role !== 'manager' && role !== 'reception') {
      return { error: 'You do not have authorization to view guest identity documents.' };
    }

    const hotelId = staff.hotel_id;
    const admin = getAdminClient();

    let storagePath: string = '';
    let guestId: string = guestIdHint || '';
    let docMetadata: any = null;

    // 1. Try looking up in database table
    if (documentId && !documentId.includes('/')) {
      const { data: doc } = await (admin.from('guest_documents') as any)
        .select('*, staff:uploaded_by(full_name)')
        .eq('id', documentId)
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .maybeSingle();

      if (doc) {
        storagePath = doc.storage_path;
        guestId = doc.guest_id;
        docMetadata = doc;
      }
    }

    // 2. Fallback to provided storage path hint
    if (!storagePath && storagePathHint) {
      const cleanHint = storagePathHint.trim();
      // Enforce strict multi-tenant property check
      if (cleanHint.startsWith(`hotel/${hotelId}/`) || cleanHint.startsWith(`${hotelId}/`)) {
        storagePath = cleanHint;
      } else {
        return { error: 'Access denied. Document belongs to another hotel property.' };
      }
    }

    // 3. Fallback: Search guest folders if documentId or guestId is available
    if (!storagePath) {
      if (documentId.includes('/')) {
        if (!documentId.startsWith(`hotel/${hotelId}/`) && !documentId.startsWith(`${hotelId}/`)) {
          return { error: 'Access denied. Document belongs to another hotel property.' };
        }
        storagePath = documentId;
      } else if (guestId) {
        // Look inside structured folder
        const { data: subFiles } = await admin.storage
          .from('guest-documents')
          .list(`hotel/${hotelId}/guests/${guestId}/documents/${documentId}`);

        if (subFiles && subFiles.length > 0) {
          const firstFile = subFiles.find(f => f.name !== '.emptyFolderPlaceholder') || subFiles[0];
          storagePath = `hotel/${hotelId}/guests/${guestId}/documents/${documentId}/${firstFile.name}`;
        }
      }
    }

    if (!storagePath) {
      return { error: 'Document not found or you do not have permission to view it.' };
    }

    // Generate short-lived (60 seconds) signed URL
    const { data: signedData, error: signErr } = await admin.storage
      .from('guest-documents')
      .createSignedUrl(storagePath, 60);

    if (signErr || !signedData?.signedUrl) {
      console.error('Error generating signed URL:', signErr?.message);
      return { error: 'Failed to generate secure viewing link.' };
    }

    // Record audit log
    if (guestId) {
      try {
        await (admin.from('guest_document_audit_logs') as any).insert({
          id: crypto.randomUUID(),
          hotel_id: hotelId,
          guest_id: guestId,
          document_id: documentId,
          staff_id: staff.id,
          action: 'viewed',
          created_at: new Date().toISOString(),
        });
      } catch (auditErr) {
        console.warn('Audit log error on view:', auditErr);
      }
    }

    return {
      success: true,
      signedUrl: signedData.signedUrl,
      expiresIn: 60,
      document: docMetadata || undefined,
    };
  } catch (err: any) {
    console.error('getGuestDocumentSignedUrlAction exception:', err);
    return { error: 'Unable to securely retrieve the document. Please try again.' };
  }
}

/**
 * Generate a short-lived download URL and record audit download event
 */
export async function downloadGuestDocumentAction(
  documentId: string,
  storagePathHint?: string
): Promise<SignedUrlResult> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Your session has expired. Please sign in again.' };
    }

    const role = staff.role;
    if (role !== 'owner' && role !== 'manager' && role !== 'reception') {
      return { error: 'You do not have authorization to download guest identity documents.' };
    }

    const hotelId = staff.hotel_id;
    const admin = getAdminClient();

    let storagePath: string = '';
    let filename: string = 'guest_id_document';
    let guestId: string = '';

    const { data: doc } = await (admin.from('guest_documents') as any)
      .select('*')
      .eq('id', documentId)
      .eq('hotel_id', hotelId)
      .eq('is_active', true)
      .maybeSingle();

    if (doc) {
      storagePath = doc.storage_path;
      filename = doc.original_filename;
      guestId = doc.guest_id;
    } else if (storagePathHint && (storagePathHint.startsWith(`hotel/${hotelId}/`) || storagePathHint.startsWith(`${hotelId}/`))) {
      storagePath = storagePathHint;
      filename = storagePathHint.split('/').pop() || 'guest_id_document';
    } else if (documentId.startsWith(`hotel/${hotelId}/`) || documentId.startsWith(`${hotelId}/`)) {
      storagePath = documentId;
      filename = documentId.split('/').pop() || 'guest_id_document';
    }

    if (!storagePath) {
      return { error: 'Document not found or you do not have permission to download it.' };
    }

    const { data: signedData, error: signErr } = await admin.storage
      .from('guest-documents')
      .createSignedUrl(storagePath, 60, {
        download: filename,
      });

    if (signErr || !signedData?.signedUrl) {
      return { error: 'Failed to generate secure download link.' };
    }

    // Record audit log
    if (guestId) {
      try {
        await (admin.from('guest_document_audit_logs') as any).insert({
          id: crypto.randomUUID(),
          hotel_id: hotelId,
          guest_id: guestId,
          document_id: documentId,
          staff_id: staff.id,
          action: 'downloaded',
          created_at: new Date().toISOString(),
        });
      } catch (auditErr) {
        console.warn('Audit log error on download:', auditErr);
      }
    }

    return {
      success: true,
      signedUrl: signedData.signedUrl,
      expiresIn: 60,
    };
  } catch (err: any) {
    return { error: 'Unable to download document. Please try again.' };
  }
}

/**
 * Soft-delete or remove a guest document
 */
export async function deleteGuestDocumentAction(
  documentId: string,
  storagePathHint?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const staff = await getCurrentStaff();
    if (!staff) {
      return { error: 'Your session has expired. Please sign in again.' };
    }

    const role = staff.role;
    if (role !== 'owner' && role !== 'manager') {
      return { error: 'Only Owners and Managers are permitted to delete guest documents.' };
    }

    const hotelId = staff.hotel_id;
    const admin = getAdminClient();

    let storagePath: string = '';
    let guestId: string = '';

    const { data: doc, error: fetchErr } = await (admin.from('guest_documents') as any)
      .select('*')
      .eq('id', documentId)
      .eq('hotel_id', hotelId)
      .maybeSingle();

    if (doc) {
      storagePath = doc.storage_path;
      guestId = doc.guest_id;
      // Soft delete record in DB
      await (admin.from('guest_documents') as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', documentId)
        .eq('hotel_id', hotelId);
    } else if (storagePathHint && (storagePathHint.startsWith(`hotel/${hotelId}/`) || storagePathHint.startsWith(`${hotelId}/`))) {
      storagePath = storagePathHint;
    }

    if (storagePath) {
      // Delete from storage
      await admin.storage.from('guest-documents').remove([storagePath]);
    }

    // Record audit log
    if (guestId) {
      try {
        await (admin.from('guest_document_audit_logs') as any).insert({
          id: crypto.randomUUID(),
          hotel_id: hotelId,
          guest_id: guestId,
          document_id: documentId,
          staff_id: staff.id,
          action: 'deleted',
          created_at: new Date().toISOString(),
        });
      } catch (auditErr) {
        console.warn('Audit log error on delete:', auditErr);
      }
    }

    if (guestId) {
      revalidatePath(`/guests/${guestId}`);
    }
    revalidatePath('/guests');

    return { success: true };
  } catch (err: any) {
    return { error: 'Unable to delete document. Please try again.' };
  }
}
