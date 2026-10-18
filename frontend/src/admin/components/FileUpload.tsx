import { useRef, useState } from 'react';
import { uploadFile, uploadImage } from '../../api/admin';
import { errorMessage } from '../../api/client';
import type { UploadResponse } from '../../types';

interface Props {
  label: string;
  value?: string;
  onChange: (url: string | undefined, upload?: UploadResponse) => void;
  accept?: string;
  kind?: 'image' | 'file';
  /** Accept PDFs and store everything as JPEG (PDF → first page). */
  convertToJpeg?: boolean;
  /** With convertToJpeg: also keep the original PDF (returned as `sourceUrl`). */
  keepPdf?: boolean;
}

const IMAGE_TYPES = 'image/png,image/jpeg,image/webp,image/gif';

/** Uploads to the backend and returns the served URL. Supports drag & drop and preview. */
export default function FileUpload({ label, value, onChange, accept, kind = 'image', convertToJpeg = false, keepPdf = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const acceptTypes = accept ?? (convertToJpeg ? `${IMAGE_TYPES},application/pdf` : IMAGE_TYPES);

  const handle = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setProgress(0);
    const isPdf = file.type === 'application/pdf';
    try {
      const res = convertToJpeg
        ? await uploadImage(file, keepPdf, (pct) => {
            setProgress(pct);
            if (pct >= 100) setProcessing(isPdf ? 'Converting PDF to JPG…' : 'Optimising image…');
          })
        : await uploadFile(file, setProgress);
      onChange(res.url, res);
    } catch (e) {
      setError(errorMessage(e, 'Upload failed'));
    } finally {
      setProgress(null);
      setProcessing(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <span className="label">{label}</span>
      <div
        className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-4 text-center transition ${
          dragging ? 'border-cyan bg-cyan/5' : 'border-navy-500'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handle(e.dataTransfer.files[0]);
        }}
      >
        {value && kind === 'image' && <img src={value} alt="Preview" className="max-h-40 rounded-md border border-cyan/20 object-contain" />}
        {value && kind === 'file' && (
          <a href={value} target="_blank" rel="noopener noreferrer" className="break-all font-mono text-xs text-cyan hover:underline">
            {value}
          </a>
        )}
        {progress !== null ? (
          <div className="w-full">
            <div className="h-2 w-full overflow-hidden rounded-full bg-navy-700">
              <div className={`h-full bg-cyan transition-all ${processing ? 'animate-pulse' : ''}`} style={{ width: `${progress}%` }} />
            </div>
            {processing && <p className="mt-2 text-xs text-cyan">{processing}</p>}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" className="btn-outline px-3 py-2 text-xs" onClick={() => inputRef.current?.click()}>
              {value ? 'Replace' : 'Upload'}
            </button>
            {value && (
              <button type="button" className="btn-ghost px-3 py-2 text-xs text-rose-400" onClick={() => onChange(undefined)}>
                Remove
              </button>
            )}
          </div>
        )}
        <p className="text-[11px] text-slate-500">
          {convertToJpeg ? 'Image or PDF — drag & drop or click upload. Shown on the site as JPG (PDF: first page).' : 'Drag & drop or click upload'}
        </p>
        <input ref={inputRef} type="file" accept={acceptTypes} className="hidden" onChange={(e) => void handle(e.target.files?.[0])} />
      </div>
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}
