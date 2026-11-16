import { supabase, isLiveSupabaseConfigured } from './supabaseClient';

export interface StorageUploadResult {
  publicUrl: string;
  fileName: string;
  filePath: string;
  error?: string | null;
}

export const CLASS_NOTES_BUCKET = 'class-notes';

/**
 * Uploads a course handout / PDF / slide deck to Supabase Storage bucket 'class-notes'.
 * Automatically resolves to public URL via Supabase Storage API, with offline fallback for development.
 */
export async function uploadClassNoteAttachment(
  file: File,
  classId: string
): Promise<StorageUploadResult> {
  // Validate file size (max 25MB)
  const MAX_SIZE_MB = 25;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return {
      publicUrl: '',
      fileName: file.name,
      filePath: '',
      error: `File size exceeds ${MAX_SIZE_MB}MB limit. Please upload a smaller file.`,
    };
  }

  // Live Supabase Storage Flow
  if (isLiveSupabaseConfigured && supabase) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const uniqueTimestamp = Date.now();
      const filePath = `${classId}/${uniqueTimestamp}_${sanitizedName}`;

      const { data, error: uploadError } = await supabase.storage
        .from(CLASS_NOTES_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'application/octet-stream',
        });

      if (uploadError) {
        console.error('[Supabase Storage] Upload error:', uploadError);
        return {
          publicUrl: '',
          fileName: file.name,
          filePath: '',
          error: uploadError.message,
        };
      }

      // Generate public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(CLASS_NOTES_BUCKET).getPublicUrl(data.path);

      return {
        publicUrl,
        fileName: file.name,
        filePath: data.path,
        error: null,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Storage upload failed';
      console.error('[Supabase Storage] Unexpected error:', err);
      return {
        publicUrl: '',
        fileName: file.name,
        filePath: '',
        error: msg,
      };
    }
  }

  // Local / Demo Fallback Mode
  const demoUrl =
    typeof window !== 'undefined'
      ? URL.createObjectURL(file)
      : `https://storage.local/class-notes/${encodeURIComponent(file.name)}`;

  return {
    publicUrl: demoUrl,
    fileName: file.name,
    filePath: `demo/${file.name}`,
    error: null,
  };
}

/**
 * Removes an attachment from Supabase Storage
 */
export async function deleteClassNoteAttachment(filePath: string): Promise<boolean> {
  if (isLiveSupabaseConfigured && supabase && filePath && !filePath.startsWith('demo/')) {
    try {
      const { error } = await supabase.storage
        .from(CLASS_NOTES_BUCKET)
        .remove([filePath]);
      return !error;
    } catch (err) {
      console.error('[Supabase Storage] Delete error:', err);
      return false;
    }
  }
  return true;
}
