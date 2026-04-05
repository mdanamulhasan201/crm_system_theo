'use client';

import { useCallback, useEffect, useState } from 'react';
import { FileUp, Loader2, Trash2, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type UploadResponse = {
  message?: string;
  success?: boolean;
};

type CustomDriveUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isUploading: boolean;
  onUpload: (files: File[]) => Promise<UploadResponse | unknown>;
};

export default function CustomDriveUploadModal({
  open,
  onOpenChange,
  isUploading,
  onUpload,
}: CustomDriveUploadModalProps) {
  const [staged, setStaged] = useState<File[]>([]);

  useEffect(() => {
    if (!open) setStaged([]);
  }, [open]);

  const onDrop = useCallback((accepted: File[]) => {
    setStaged((prev) => [...prev, ...accepted]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    multiple: true,
  });

  const removeAt = (index: number) => {
    setStaged((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (staged.length === 0 || isUploading) return;
    await onUpload(staged);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Dateien hochladen</DialogTitle>
          <DialogDescription>
            Dateien hierher ziehen oder klicken, um mehrere Dateien auszuwählen. Anschließend auf Hochladen
            klicken.
          </DialogDescription>
        </DialogHeader>

        <div
          {...getRootProps()}
          className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
            isDragActive ? 'border-[#61A175] bg-[#61A175]/10' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload className="mb-2 h-8 w-8 text-gray-500" />
          <p className="text-center text-sm text-gray-600">
            {isDragActive ? 'Dateien hier ablegen …' : 'Klicken oder Dateien hierher ziehen'}
          </p>
        </div>

        {staged.length > 0 && (
          <ul className="max-h-40 space-y-1 overflow-y-auto rounded-lg border bg-white p-2 text-sm">
            {staged.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center justify-between gap-2 rounded px-2 py-1 hover:bg-gray-50"
              >
                <span className="min-w-0 truncate">{file.name}</span>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(index);
                  }}
                  className="shrink-0 rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                  aria-label="Entfernen"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button
            type="button"
            className="gap-2 bg-[#61A175] hover:bg-[#4f8a61]"
            onClick={() => void handleSubmit()}
            disabled={isUploading || staged.length === 0}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
            Hochladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
