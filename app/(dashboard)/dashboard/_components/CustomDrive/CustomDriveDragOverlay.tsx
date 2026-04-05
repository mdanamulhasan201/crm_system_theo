'use client';

import type { ReactNode } from 'react';
import { DragOverlay, useDndContext } from '@dnd-kit/core';
import { getEventCoordinates } from '@dnd-kit/utilities';
import { FileText, Folder, Image as ImageIcon } from 'lucide-react';
import type { DriveFile, DriveFolder } from '@/stores/google-custom-drive/googleCustomDrive.store';
import { parseDragItemId } from './CustomDriveDnd';

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.heic', '.ico'];

function fileKind(file: DriveFile): 'image' | 'pdf' | 'other' {
  const t = (file.type || '').toLowerCase();
  const n = file.name.toLowerCase();
  if (t.includes('pdf') || n.endsWith('.pdf')) return 'pdf';
  const extFromType = t.startsWith('.') ? t : '';
  if (IMAGE_EXT.includes(extFromType)) return 'image';
  if (IMAGE_EXT.some((e) => n.endsWith(e))) return 'image';
  return 'other';
}

function DragPreviewCard({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none flex max-w-[min(280px,85vw)] cursor-grabbing items-center gap-2.5 rounded-2xl bg-white px-4 py-2.5 shadow-xl ring-1 ring-black/10">
      {children}
    </div>
  );
}

/**
 * Places the compact preview at the same point where the user pressed (viewport coords vs. active node),
 * so the pointer stays with the pill instead of snapping to the card’s top-left or center.
 */
function GrabAnchoredPreview({ children }: { children: ReactNode }) {
  const { activatorEvent, activeNodeRect } = useDndContext();

  if (!activatorEvent || !activeNodeRect) {
    return <div className="pointer-events-none flex h-full w-full items-start justify-start">{children}</div>;
  }

  const coords = getEventCoordinates(activatorEvent);
  if (!coords) {
    return <div className="pointer-events-none flex h-full w-full items-start justify-start">{children}</div>;
  }

  const left = coords.x - activeNodeRect.left;
  const top = coords.y - activeNodeRect.top;

  return (
    <div className="pointer-events-none relative h-full min-h-[48px] w-full min-w-[48px] overflow-visible">
      <div className="absolute" style={{ left, top }}>
        {children}
      </div>
    </div>
  );
}

function FileDragGlyph({ file }: { file: DriveFile }) {
  const kind = fileKind(file);
  if (kind === 'image') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500">
        <ImageIcon className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  if (kind === 'pdf') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500">
        <FileText className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-500">
      <FileText className="h-4 w-4 text-white" strokeWidth={2} aria-hidden />
    </span>
  );
}

type CustomDriveDragOverlayProps = {
  activeId: string | null;
  folders: DriveFolder[];
  files: DriveFile[];
};

export default function CustomDriveDragOverlay({ activeId, folders, files }: CustomDriveDragOverlayProps) {
  const parsed = activeId ? parseDragItemId(activeId) : null;
  const folder = parsed?.type === 'folder' ? folders.find((f) => f.id === parsed.id) : null;
  const file = parsed?.type === 'file' ? files.find((f) => f.id === parsed.id) : null;

  return (
    <DragOverlay
      dropAnimation={{
        duration: 180,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {folder ? (
        <GrabAnchoredPreview>
          <DragPreviewCard>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#5f8fdd]">
              <Folder className="h-5 w-5 text-white" aria-hidden />
            </span>
            <span className="truncate text-sm font-medium text-slate-800">{folder.name}</span>
          </DragPreviewCard>
        </GrabAnchoredPreview>
      ) : file ? (
        <GrabAnchoredPreview>
          <DragPreviewCard>
            <FileDragGlyph file={file} />
            <span className="truncate text-sm font-medium text-slate-800">{file.name}</span>
          </DragPreviewCard>
        </GrabAnchoredPreview>
      ) : null}
    </DragOverlay>
  );
}
