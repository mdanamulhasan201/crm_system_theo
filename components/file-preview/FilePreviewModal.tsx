'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Trash2,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { formatMimeLabel, getPreviewKind } from '@/lib/filePreviewKind';
import { useFilePreviewStore, type FilePreviewItem } from '@/stores/file-preview';
import { openFilePreview } from '@/lib/fileDownload';

import { ImagePreviewPane } from './ImagePreviewPane';

const PdfPreviewPane = dynamic(
  () => import('./PdfPreviewPane').then((m) => ({ default: m.PdfPreviewPane })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20 text-white/60">
        <span className="text-sm">PDF wird vorbereitet…</span>
      </div>
    ),
  }
);

export type FilePreviewModalProps = {
  /** Human-readable size (e.g. from your formatter). */
  formatBytes: (size?: number) => string;
  formatDate: (iso?: string) => string;
  /** Optional delete handler; shows a destructive control when provided. */
  onDelete?: (file: FilePreviewItem) => void | Promise<void>;
};

export default function FilePreviewModal({
  formatBytes,
  formatDate,
  onDelete,
}: FilePreviewModalProps) {
  const isOpen = useFilePreviewStore((s) => s.isOpen);
  const current = useFilePreviewStore((s) => s.current);
  const playlist = useFilePreviewStore((s) => s.playlist);
  const close = useFilePreviewStore((s) => s.close);
  const goNext = useFilePreviewStore((s) => s.goNext);
  const goPrev = useFilePreviewStore((s) => s.goPrev);

  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const [previewWidth, setPreviewWidth] = useState(720);
  const [deleting, setDeleting] = useState(false);

  const previewPanelRef = useCallback((node: HTMLDivElement | null) => {
    setPortalEl(node);
    if (!node) return;
    const ro = new ResizeObserver(() => setPreviewWidth(node.clientWidth));
    ro.observe(node);
    setPreviewWidth(node.clientWidth);
    return () => ro.disconnect();
  }, []);

  const kind = current ? getPreviewKind(current) : 'unknown';
  const index = current ? playlist.findIndex((f) => f.id === current.id) : -1;
  const canNav = playlist.length > 1;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
      if (e.key === 'ArrowRight' && canNav) goNext();
      if (e.key === 'ArrowLeft' && canNav) goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close, canNav, goNext, goPrev]);

  const handleDelete = async () => {
    if (!current || !onDelete) return;
    const ok =
      typeof window !== 'undefined' &&
      window.confirm(`„${current.name}“ wirklich löschen?`);
    if (!ok) return;
    setDeleting(true);
    try {
      await onDelete(current);
      close();
    } catch {
      /* Parent sollte toast / Fehler anzeigen */
    } finally {
      setDeleting(false);
    }
  };

  const previewBody = useMemo(() => {
    if (!current) return null;

    if (kind === 'image') {
      return (
        <ImagePreviewPane
          url={current.url}
          name={current.name}
          portalContainer={portalEl}
        />
      );
    }

    if (kind === 'pdf') {
      return <PdfPreviewPane url={current.url} maxWidth={previewWidth - 32} />;
    }

    if (kind === 'video') {
      return (
        <div className="flex h-full min-h-[240px] w-full items-center justify-center p-4">
          <video
            key={current.url}
            src={current.url}
            controls
            playsInline
            className="max-h-[min(78vh,calc(100vh-8rem))] max-w-full rounded-lg bg-black shadow-2xl"
          />
        </div>
      );
    }

    if (kind === 'audio') {
      return (
        <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-6 p-8">
          <div className="rounded-2xl bg-white/10 px-8 py-6 ring-1 ring-white/10">
            <audio key={current.url} src={current.url} controls className="w-[min(100%,360px)]" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center text-white/80">
        <FileQuestion className="h-14 w-14 text-white/40" aria-hidden />
        <p className="max-w-sm text-sm">Für diesen Dateityp ist keine eingebettete Vorschau verfügbar.</p>
        <Button
          type="button"
          variant="secondary"
          className="bg-white/15 text-white hover:bg-white/25"
          onClick={() => openFilePreview(current.url)}
        >
          Im neuen Tab öffnen
        </Button>
      </div>
    );
  }, [current, kind, portalEl, previewWidth]);

  if (!isOpen || !current) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex"
      role="dialog"
      aria-modal="true"
      aria-label="Dateivorschau"
    >
      <div className="absolute inset-0 bg-black/88 backdrop-blur-[2px]" aria-hidden />

      <button
        type="button"
        className="absolute right-4 top-4 z-[210] rounded-full bg-white/10 p-2.5 text-white ring-1 ring-white/20 transition hover:bg-white/20"
        onClick={close}
        aria-label="Schließen"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          ref={previewPanelRef}
          className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-auto"
        >
          {canNav ? (
            <>
              <button
                type="button"
                aria-label="Vorherige Datei"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30 md:left-4"
                onClick={goPrev}
                disabled={index <= 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Nächste Datei"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30 md:right-4"
                onClick={goNext}
                disabled={index < 0 || index >= playlist.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}

          <div className="flex min-h-0 flex-1 flex-col">{previewBody}</div>
        </div>

        <aside className="flex w-full shrink-0 flex-col border-t border-white/10 bg-[#1a1d24] md:w-[300px] md:border-l md:border-t-0">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Details</h2>
          </div>
          <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 text-sm text-white/90">
            <DetailRow label="Name" value={current.name} emphasize />
            <DetailRow
              label="Typ"
              value={formatMimeLabel(current.mimeType, current.name, current.url)}
            />
            <DetailRow label="Größe" value={formatBytes(current.size)} />
            <DetailRow label="Erstellt" value={formatDate(current.createdAt)} />
            {canNav ? (
              <p className="text-xs text-white/45">
                {index + 1} von {playlist.length} · Pfeiltasten zum Wechseln
              </p>
            ) : null}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-white/10 p-4">
            {onDelete ? (
              <Button
                type="button"
                variant="destructive"
                className="w-full"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {deleting ? 'Wird gelöscht…' : 'Löschen'}
              </Button>
            ) : null}
            <Button type="button" variant="secondary" className="w-full bg-white/10 text-white hover:bg-white/20" onClick={close}>
              Schließen
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/45">{label}</p>
      <p className={`break-words ${emphasize ? 'text-base font-medium text-white' : 'text-white/85'}`}>
        {value || '—'}
      </p>
    </div>
  );
}
