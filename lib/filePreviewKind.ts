import type { FilePreviewItem } from '@/stores/file-preview/filePreview.store';

export type PreviewKind = 'image' | 'pdf' | 'video' | 'audio' | 'unknown';

export const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|svg|heic|ico)$/i;
const PDF_EXT = /\.pdf$/i;
const VIDEO_EXT = /\.(mp4|webm|ogg)$/i;
const AUDIO_EXT = /\.(mp3|wav|ogg|m4a|aac|flac)$/i;

function extFromName(name: string): string {
  const m = name.match(/\.[^.]+$/);
  return m ? m[0].toLowerCase() : '';
}

/** Last path segment of a URL (for extension when display name was renamed without suffix). */
function fileNameFromUrl(url: string): string {
  try {
    const decoded = decodeURIComponent(new URL(url).pathname.split('/').pop() || '');
    return decoded || '';
  } catch {
    return '';
  }
}

/**
 * Drive API often sends `type: ".png"` (extension) instead of `image/png`.
 * After rename, `name` may have no extension; fall back to `url` pathname.
 */
export function classifyPreviewKind(
  name: string,
  url: string | undefined,
  apiType: string | undefined
): PreviewKind {
  const n = name || '';
  const u = url || '';
  const api = (apiType || '').trim().toLowerCase();

  if (api.startsWith('image/')) return 'image';
  if (api === 'application/pdf' || (api.includes('pdf') && !api.startsWith('.'))) return 'pdf';
  if (api.startsWith('video/')) return 'video';
  if (api.startsWith('audio/')) return 'audio';

  if (api.startsWith('.')) {
    if (IMAGE_EXT.test(api)) return 'image';
    if (PDF_EXT.test(api)) return 'pdf';
    if (VIDEO_EXT.test(api)) return 'video';
    if (AUDIO_EXT.test(api)) return 'audio';
  }

  if (IMAGE_EXT.test(n)) return 'image';
  if (PDF_EXT.test(n)) return 'pdf';
  if (VIDEO_EXT.test(n)) return 'video';
  if (AUDIO_EXT.test(n)) return 'audio';

  const leaf = fileNameFromUrl(u);
  if (leaf) {
    if (IMAGE_EXT.test(leaf)) return 'image';
    if (PDF_EXT.test(leaf)) return 'pdf';
    if (VIDEO_EXT.test(leaf)) return 'video';
    if (AUDIO_EXT.test(leaf)) return 'audio';
  }

  return 'unknown';
}

export function getPreviewKind(file: FilePreviewItem): PreviewKind {
  return classifyPreviewKind(file.name || '', file.url, file.mimeType);
}

/** Grid thumbnails / icons — same rules as `getPreviewKind`. */
export function isImageFileNameOrMime(name: string, apiType?: string, url?: string): boolean {
  return classifyPreviewKind(name, url, apiType) === 'image';
}

/**
 * Sidebar label: real MIME, or `".png"` → PNG, else extension from name or URL.
 */
export function formatMimeLabel(mime?: string, name?: string, url?: string): string {
  const m = (mime || '').trim();
  if (m.startsWith('.')) return m.replace(/^\./, '').toUpperCase();
  if (m) return m;

  let ext = extFromName(name || '');
  if (!ext && url) {
    const leaf = fileNameFromUrl(url);
    const hit = leaf.match(/\.[^./]+$/i);
    ext = hit ? hit[0].toLowerCase() : '';
  }
  return ext ? ext.replace(/^\./, '').toUpperCase() : '—';
}
