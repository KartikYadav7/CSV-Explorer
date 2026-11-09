import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { UploadCloud, AlertTriangle } from 'lucide-react';
import { glass } from './UI';

export default function FileUpload({ onFile, error }) {
  const [over, setOver] = useState(false);
  const input = useRef(null);
  const pick = (f) => f && onFile(f);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center">
      <h1 className="text-balance bg-gradient-to-br from-white to-slate-400 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl">
        Drop a CSV. Filter it any way you like.
      </h1>
      <p className="mt-3 max-w-lg text-slate-400">
        Files are parsed in your browser and never uploaded. Stack filter rules across columns, sort, and export what’s left.
      </p>
      <div
        role="button" tabIndex={0} aria-label="Upload a CSV file"
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), input.current?.click())}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
        className={`${glass} mt-8 flex cursor-pointer flex-col items-center gap-3 border-dashed px-6 py-14 text-center outline-none transition focus-visible:ring-2 focus-visible:ring-teal-400/60 ${
          over ? 'scale-[1.01] border-teal-400/70 bg-teal-400/10' : 'hover:border-white/25'
        }`}
      >
        <input ref={input} type="file" accept=".csv,text/csv" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }} />
        <div className={`rounded-2xl bg-teal-400/10 p-4 text-teal-300 transition ${over ? '-translate-y-1' : ''}`}>
          <UploadCloud className="h-8 w-8" />
        </div>
        <p className="font-medium text-white">{over ? 'Release to load this file' : 'Drag a .csv file here, or click to browse'}</p>
        <p className="text-sm text-slate-500">The first row is used as column names</p>
      </div>
      {error && (
        <div role="alert" className="mt-4 flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-sm text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span>
        </div>
      )}
    </div>
  );
}
FileUpload.propTypes = { onFile: PropTypes.func.isRequired, error: PropTypes.string };
