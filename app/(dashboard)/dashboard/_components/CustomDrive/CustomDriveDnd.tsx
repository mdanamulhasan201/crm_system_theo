'use client';

import React from 'react';
import { type UniqueIdentifier, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DriveEntityType } from '@/apis/googleCustomDriveApis';
import { cn } from '@/lib/utils';

export const FOLDER_DROP_PREFIX = 'folder-drop:' as const;
export const ROOT_DROP_ID = `${FOLDER_DROP_PREFIX}root` as const;

export const dragItemId = (type: DriveEntityType, id: string) => `${type}:${id}`;

export const parseDragItemId = (value: UniqueIdentifier) => {
  const [type, id] = String(value).split(':');
  if (!id || (type !== 'folder' && type !== 'file')) return null;
  return { type: type as DriveEntityType, id };
};

/**
 * @returns `undefined` — kein gültiges Ziel · `null` — Stammverzeichnis · `string` — Ordner-ID
 */
export const parseDropTargetId = (
  value: UniqueIdentifier | null | undefined
): string | null | undefined => {
  if (value == null) return undefined;
  const raw = String(value);
  if (!raw.startsWith(FOLDER_DROP_PREFIX)) return undefined;
  const suffix = raw.slice(FOLDER_DROP_PREFIX.length);
  if (suffix === 'root') return null;
  return suffix;
};

export function DragContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        // Kein translate: das eigentliche Karten-Layout bleibt am Platz; die Vorschau kommt nur aus <DragOverlay>.
        opacity: isDragging ? 0 : 1,
        pointerEvents: isDragging ? 'none' : undefined,
      }}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}

export function FolderDropContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${FOLDER_DROP_PREFIX}${id}` });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-[#5f8fdd] ring-offset-1 rounded-xl' : undefined}
    >
      {children}
    </div>
  );
}

/** Pfad-Segment im Header: Drop auf übergeordneten Ordner (oder My Drive). */
export function BreadcrumbDropZone({
  folderId,
  children,
  className,
}: {
  folderId: string | null;
  children: React.ReactNode;
  className?: string;
}) {
  const dropId = folderId === null ? ROOT_DROP_ID : `${FOLDER_DROP_PREFIX}${folderId}`;
  const { setNodeRef, isOver } = useDroppable({ id: dropId });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'inline-flex min-h-9 max-w-[min(220px,50vw)] shrink-0 items-center rounded-md px-0.5 py-0.5 transition',
        isOver && 'bg-[#61A175]/20 ring-2 ring-[#61A175] ring-offset-1',
        className
      )}
    >
      {children}
    </div>
  );
}
