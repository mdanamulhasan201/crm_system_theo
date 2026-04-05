import { create } from 'zustand';

/**
 * @example
 * ```tsx
 * const open = useFilePreviewStore((s) => s.open);
 * open(
 *   { id: '1', name: 'doc.pdf', url: 'https://…/doc.pdf', size: 1024, createdAt: new Date().toISOString() },
 *   playlist // optional: enables ← → navigation
 * );
 * ```
 */

/** Serializable file entry for the preview modal (Drive or any URL-backed file). */
export type FilePreviewItem = {
  id: string;
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
};

type FilePreviewState = {
  isOpen: boolean;
  current: FilePreviewItem | null;
  /** Ordered list for optional next/prev navigation (e.g. current folder files). */
  playlist: FilePreviewItem[];
};

type FilePreviewActions = {
  open: (file: FilePreviewItem, playlist?: FilePreviewItem[]) => void;
  close: () => void;
  goNext: () => void;
  goPrev: () => void;
};

const initial: FilePreviewState = {
  isOpen: false,
  current: null,
  playlist: [],
};

export const useFilePreviewStore = create<FilePreviewState & FilePreviewActions>((set, get) => ({
  ...initial,

  open: (file, playlist) => {
    const list = playlist?.length ? playlist : [file];
    set({
      isOpen: true,
      current: file,
      playlist: list,
    });
  },

  close: () => set({ isOpen: false, current: null, playlist: [] }),

  goNext: () => {
    const { current, playlist } = get();
    if (!current || playlist.length < 2) return;
    const i = playlist.findIndex((f) => f.id === current.id);
    if (i < 0 || i >= playlist.length - 1) return;
    set({ current: playlist[i + 1] });
  },

  goPrev: () => {
    const { current, playlist } = get();
    if (!current || playlist.length < 2) return;
    const i = playlist.findIndex((f) => f.id === current.id);
    if (i <= 0) return;
    set({ current: playlist[i - 1] });
  },
}));
