'use client';

import { useCallback, useMemo, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2 } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

type PdfPreviewPaneProps = {
  url: string;
  maxWidth: number;
};

export function PdfPreviewPane({ url, maxWidth }: PdfPreviewPaneProps) {
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const file = useMemo(() => url, [url]);

  const onLoadSuccess = useCallback((pdf: { numPages: number }) => {
    setNumPages(pdf.numPages);
    setLoadError(null);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    setLoadError(err.message || 'PDF konnte nicht geladen werden.');
  }, []);

  const pageWidth = Math.max(280, Math.min(maxWidth, 920));

  return (
    <div className="flex flex-col items-center pb-8">
      <Document
        file={file}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={
          <div className="flex flex-col items-center gap-2 py-16 text-white/70">
            <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
            <span className="text-sm">PDF wird geladen…</span>
          </div>
        }
        error={
          <div className="rounded-lg bg-white/10 px-4 py-3 text-sm text-red-200">
            {loadError || 'PDF konnte nicht angezeigt werden.'}
          </div>
        }
      >
        {numPages > 0
          ? Array.from({ length: numPages }, (_, idx) => (
              <Page
                key={idx + 1}
                pageNumber={idx + 1}
                width={pageWidth}
                className="mb-4 shadow-2xl"
                renderTextLayer
                renderAnnotationLayer
              />
            ))
          : null}
      </Document>
    </div>
  );
}
