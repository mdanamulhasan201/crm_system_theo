'use client';

import type { ReactNode } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { ZoomIn, ZoomOut } from 'lucide-react';

import 'react-photo-view/dist/react-photo-view.css';

type ImagePreviewPaneProps = {
  url: string;
  name: string;
  /** When set, the zoom overlay is portaled inside this node (keeps Drive-like split layout). */
  portalContainer?: HTMLElement | null;
};

export function ImagePreviewPane({ url, name, portalContainer }: ImagePreviewPaneProps) {
  return (
    <PhotoProvider
      portalContainer={portalContainer ?? undefined}
      maskOpacity={0.92}
      photoClosable
      maskClosable
      pullClosable
      bannerVisible
      toolbarRender={({ onScale, scale, onRotate, rotate }) => (
        <div className="flex flex-wrap items-center justify-center gap-1 px-2 py-1 text-white">
          <ToolbarBtn label="Verkleinern" onClick={() => onScale(scale - 0.25)}>
            <ZoomOut className="h-4 w-4" />
          </ToolbarBtn>
          <span className="min-w-[3rem] text-center text-xs tabular-nums opacity-90">
            {Math.round(scale * 100)}%
          </span>
          <ToolbarBtn label="Vergrößern" onClick={() => onScale(scale + 0.25)}>
            <ZoomIn className="h-4 w-4" />
          </ToolbarBtn>
          <ToolbarBtn label="Drehen" onClick={() => onRotate((rotate + 90) % 360)}>
            ↻
          </ToolbarBtn>
        </div>
      )}
    >
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center p-4">
        <PhotoView src={url}>
          <img
            src={url}
            alt={name}
            className="max-h-[min(78vh,calc(100vh-8rem))] max-w-full cursor-zoom-in rounded-lg object-contain shadow-2xl ring-1 ring-white/10"
            draggable={false}
          />
        </PhotoView>
        <p className="mt-3 text-center text-xs text-white/50">Klicken zum Zoomen und Schwenken</p>
      </div>
    </PhotoProvider>
  );
}

function ToolbarBtn({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="rounded-md bg-white/15 px-2 py-1.5 text-sm transition hover:bg-white/25"
    >
      {children}
    </button>
  );
}
