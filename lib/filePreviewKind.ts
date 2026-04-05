import type { FilePreviewItem } from '@/stores/file-preview/filePreview.store';

export type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'unknown';

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const PDF_EXT = /\.pdf$/i;
const VIDEO_EXT = /\.(mp4|webm|ogg)$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

function extFromName(name: string): string {
  const m = name.match(/\.[^.]+$/);
  return m ? m[0].toLowerCase() : '';
}

/** Infer preview handler from mime type and/or file name. */
export function getPreviewKind(file: FilePreviewItem): PreviewKind {
  const mime = (file.mimeType || '').toLowerCase();
  const name = file.name || '';

  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf' || mime.includes('pdf')) return 'pdf';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';

  if (IMAGE_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name)) return 'pdf';
  if (VIDEO_EXT.test(name)) return 'video';
  if (AUDIO_EXT.test(name)) return 'audio';

  return 'unknown';
}

export function formatMimeLabel(mime?: string, name?: string): string {
  if (mime && mime.trim()) return mime;
  const ext = extFromName(name || '');
  return ext ? ext.replace(/^\./, '').toUpperCase() : '—';
}
