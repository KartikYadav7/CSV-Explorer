import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Download, RotateCcw, HardDrive, AlertTriangle } from 'lucide-react';
import FileUpload from './components/FileUpload';
import FilterBuilder from './components/FilterBuilder';
import DataTable from './components/DataTable';
import Pagination from './components/Pagination';
import DashboardSkeleton from './components/DashboardSkeleton';
import { btnGhost, glass } from './components/UI.js';
import { PAGE_SIZES, applyFilters, exportCsv, formatBytes, inferTypes, parseCsv, sortRows } from './lib/csv';
import { clearAll, load, save } from './lib/storage';

const Stat = ({ label, value }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
    <div className="text-lg font-semibold tabular-nums text-white">{value}</div>
    <div className="text-xs text-slate-400">{label}</div>
  </div>
);

export default function App() {
  const [status, setStatus] = useState('restoring'); // restoring | idle | parsing | ready
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [saved, setSaved] = useState(false); // is the current dataset stored on this device?
  const [rules, setRules] = useState([]);
  const [mode, setMode] = useState('all');
  const [sort, setSort] = useState({ column: null, dir: 'asc' });
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Restore the previous session (dataset + filters/sort/page) on first load.
  useEffect(() => {
    let off = false;
    (async () => {
      const [ds, view] = await Promise.all([load('dataset'), load('view')]);
      if (off) return;
      const valid = ds && Array.isArray(ds.columns) && Array.isArray(ds.rows) && ds.rows.length && ds.types && ds.file;
      if (!valid) return setStatus('idle');
      const cols = new Set(ds.columns);
      setData({ columns: ds.columns, rows: ds.rows, types: ds.types });
      setFile(ds.file);
      setSaved(true);
      if (view) {
        setRules((view.rules ?? []).filter((r) => cols.has(r.column)));
        setMode(view.mode === 'any' ? 'any' : 'all');
        if (view.sort?.column && cols.has(view.sort.column)) setSort(view.sort);
        if (PAGE_SIZES.includes(view.pageSize)) setPageSize(view.pageSize);
        if (Number.isInteger(view.page) && view.page >= 0) setPage(view.page);
      }
      setStatus('ready');
    })();
    return () => { off = true; };
  }, []);

  // Remember filters, sort and paging (debounced). The big dataset is written once, at upload.
  useEffect(() => {
    if (status !== 'ready') return undefined;
    const t = setTimeout(() => save('view', { rules, mode, sort, page, pageSize }), 300);
    return () => clearTimeout(t);
  }, [status, rules, mode, sort, page, pageSize]);

  const deferredRules = useDeferredValue(rules);
  const updating = deferredRules !== rules;

  const filtered = useMemo(() => (data ? applyFilters(data.rows, deferredRules, mode) : []), [data, deferredRules, mode]);
  const sorted = useMemo(
    () => (sort.column ? sortRows(filtered, sort.column, sort.dir, data.types[sort.column]) : filtered),
    [filtered, sort, data],
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const pageRows = useMemo(() => sorted.slice(start, start + pageSize), [sorted, start, pageSize]);

  const loadFile = useCallback(async (f) => {
    setError('');
    if (!/\.csv$/i.test(f.name) && !f.type.includes('csv')) return setError('That file isn’t a CSV. Choose a file ending in .csv.');
    setStatus('parsing');
    try {
      const { columns, rows } = await parseCsv(f);
      const types = inferTypes(columns, rows);
      const meta = { name: f.name, size: f.size };
      setData({ columns, rows, types });
      setFile(meta);
      setRules([]); setMode('all'); setSort({ column: null, dir: 'asc' }); setPage(0);
      setSaved(false);
      setStatus('ready');
      setSaved(await save('dataset', { columns, rows, types, file: meta }));
    } catch (e) {
      setError(e.message);
      setStatus('idle');
    }
  }, []);

  const changeRules = useCallback((r) => { setRules(r); setPage(0); }, []);
  const toggleSort = useCallback((column) => {
    setSort((s) => (s.column !== column ? { column, dir: 'asc' } : s.dir === 'asc' ? { column, dir: 'desc' } : { column: null, dir: 'asc' }));
    setPage(0);
  }, []);
  const newFile = () => { clearAll(); setData(null); setSaved(false); setStatus('idle'); };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-200 antialiased">
      <div aria-hidden className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-[28rem] w-[28rem] rounded-full bg-teal-500/20 blur-[120px]" />
        <div className="absolute -right-32 top-1/3 h-[26rem] w-[26rem] rounded-full bg-sky-600/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {(status === 'restoring' || status === 'parsing') && <DashboardSkeleton />}
        {status === 'idle' && <FileUpload onFile={loadFile} error={error} />}
        {status === 'ready' && data && (
          <div className="space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="rounded-xl bg-teal-400/10 p-2.5 text-teal-300"><FileSpreadsheet className="h-5 w-5" /></div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-white">{file.name}</h1>
                  <p className="flex flex-wrap items-center gap-x-3 text-sm text-slate-400">
                    {formatBytes(file.size)}
                    {saved ? (
                      <span className="inline-flex items-center gap-1 text-teal-300" title="Stored in this browser only. Click New file to erase it.">
                        <HardDrive className="h-3.5 w-3.5" />Saved on this device
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-300" title="The browser couldn’t store this file, so it will be gone after a refresh.">
                        <AlertTriangle className="h-3.5 w-3.5" />Not saved
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Stat label="Total rows" value={data.rows.length.toLocaleString()} />
                <Stat label="Columns" value={data.columns.length} />
                <Stat label="Matching" value={sorted.length.toLocaleString()} />
                <button onClick={newFile} className={btnGhost}><RotateCcw className="h-4 w-4" />New file</button>
              </div>
            </header>

            <FilterBuilder columns={data.columns} types={data.types} rules={rules} mode={mode}
              onRulesChange={changeRules} onModeChange={(m) => { setMode(m); setPage(0); }} />

            <section className={`${glass} overflow-hidden`} aria-label="Data table">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <p className="text-sm text-slate-400" aria-live="polite">
                  {sorted.length === 0 ? 'No matching records' : (
                    <>Showing <b className="font-medium tabular-nums text-white">{(start + 1).toLocaleString()}–{(start + pageRows.length).toLocaleString()}</b> of{' '}
                      <b className="font-medium tabular-nums text-white">{sorted.length.toLocaleString()}</b> filtered records
                      <span className="text-slate-600"> · {data.rows.length.toLocaleString()} total</span></>
                  )}
                </p>
                <button onClick={() => exportCsv(data.columns, sorted, file.name)} disabled={!sorted.length} className={btnGhost}>
                  <Download className="h-4 w-4" />Export filtered CSV
                </button>
              </div>
              <div className={`transition-opacity ${updating ? 'opacity-60' : ''}`}>
                <DataTable columns={data.columns} types={data.types} rows={pageRows} startIndex={start}
                  sort={sort} onSort={toggleSort} onClearFilters={() => changeRules([])} />
              </div>
              <Pagination page={safePage} pageCount={pageCount} pageSize={pageSize} onPage={setPage}
                onPageSize={(n) => { setPageSize(n); setPage(0); }} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}