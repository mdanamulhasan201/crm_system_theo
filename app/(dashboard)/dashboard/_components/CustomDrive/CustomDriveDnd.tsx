'use client';

import React from 'react';
import { type UniqueIdentifier, useDraggable, useDroppable } from '@dnd-kit/core';
import type { DriveEntityType } from '@/apis/googleCustomDriveApis';

export const dragItemId = (type: DriveEntityType, id: string) => `${type}:${id}`;

export const parseDragItemId = (value: UniqueIdentifier) => {
  const [type, id] = String(value).split(':');
  if (!id || (type !== 'folder' && type !== 'file')) return null;
  return { type: type as DriveEntityType, id };
};

export const parseDropTargetId = (value: UniqueIdentifier | null | undefined) => {
  if (!value) return null;
  const raw = String(value);
  if (!raw.startsWith('folder-drop:')) return null;
  return raw.replace('folder-drop:', '');
};

export function DragContainer({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
          : undefined,
        opacity: isDragging ? 0.6 : 1,
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
  const { setNodeRef, isOver } = useDroppable({ id: `folder-drop:${id}` });

  return (
    <div
      ref={setNodeRef}
      className={isOver ? 'ring-2 ring-[#5f8fdd] ring-offset-1 rounded-xl' : undefined}
    >
      {children}
    </div>
  );
}

