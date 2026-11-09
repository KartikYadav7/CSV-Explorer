import Papa from 'papaparse';

export const PAGE_SIZES = [10, 25, 50, 100];
export const OPERATORS = {
  contains: 'Contains',
  equals: 'Equals',
  startsWith: 'Starts with',
  gt: 'Greater than',
  lt: 'Less than',
};
// Operators offered depend on what the column actually contains.
export const OPS_BY_TYPE = {
  text: ['contains', 'equals', 'startsWith'],
  number: ['gt', 'lt', 'equals'],
};

export const toNum = (v) => {
  const s = String(v ?? '').replace(/[,$%\s]/g, '');
  if (s === '') return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

/**
 * Parses a File in 1 MB chunks. Each chunk is read asynchronously, so the event loop gets a turn
 * between chunks and the UI stays responsive. No Web Worker needed, which keeps the build
 * independent of the bundler (PapaParse's `worker: true` breaks under Vite, and bundler-specific
 * worker syntax has failed on some hosts).
 */
export const parseCsv = (file) =>
  new Promise((resolve, reject) => {
    const rows = [];
    let columns = [];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      chunkSize: 1024 * 1024,
      chunk: ({ data, meta }) => {
        if (!columns.length && meta.fields) columns = meta.fields;
        for (let i = 0; i < data.length; i++) rows.push(data[i]);
      },
      complete: () => {
        if (!columns.length || !rows.length) {
          reject(new Error('No rows found. Check that the file has a header row and at least one data row.'));
        } else resolve({ columns, rows });
      },
      error: (err) => reject(new Error(`Couldn’t read the file: ${err.message}`)),
    });
  });

/** A column is "number" when ≥90% of its non-empty sampled values parse as numbers. */
export const inferTypes = (columns, rows) => {
  const sample = rows.slice(0, 500);
  return Object.fromEntries(
    columns.map((c) => {
      let filled = 0, nums = 0;
      for (const r of sample) {
        if (r[c] === '' || r[c] == null) continue;
        filled++;
        if (!Number.isNaN(toNum(r[c]))) nums++;
      }
      return [c, filled && nums / filled >= 0.9 ? 'number' : 'text'];
    }),
  );
};

// Rules compile to predicates once, so the per-row work stays minimal.
const compile = ({ column, op, value }) => {
  const t = value.trim().toLowerCase();
  const tn = toNum(t);
  return (row) => {
    const c = String(row[column] ?? '').trim().toLowerCase();
    switch (op) {
      case 'contains': return c.includes(t);
      case 'startsWith': return c.startsWith(t);
      case 'equals': { const n = toNum(c); return !Number.isNaN(tn) && !Number.isNaN(n) ? n === tn : c === t; }
      case 'gt':
      case 'lt': {
        const n = toNum(c);
        const d = !Number.isNaN(tn) && !Number.isNaN(n) ? n - tn : c.localeCompare(t, undefined, { numeric: true });
        return op === 'gt' ? d > 0 : d < 0;
      }
      default: return true;
    }
  };
};

export const applyFilters = (rows, rules, mode) => {
  const preds = rules.filter((r) => r.column && r.value.trim() !== '').map(compile);
  if (!preds.length) return rows;
  return rows.filter((row) => (mode === 'all' ? preds.every((p) => p(row)) : preds.some((p) => p(row))));
};

export const sortRows = (rows, column, dir, type) => {
  const m = dir === 'asc' ? 1 : -1;
  const num = type === 'number';
  const keyed = rows.map((r) => ({ r, k: num ? toNum(r[column]) : String(r[column] ?? '') }));
  const empty = (k) => (num ? Number.isNaN(k) : k === '');
  keyed.sort((a, b) => {
    const ea = empty(a.k), eb = empty(b.k);
    if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1; // blanks always sink
    return m * (num ? a.k - b.k : a.k.localeCompare(b.k, undefined, { numeric: true, sensitivity: 'base' }));
  });
  return keyed.map((x) => x.r);
};

export const exportCsv = (columns, rows, fileName) => {
  const csv = Papa.unparse({ fields: columns, data: rows.map((r) => columns.map((c) => r[c] ?? '')) });
  const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: fileName.replace(/\.csv$/i, '') + '-filtered.csv' });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const formatBytes = (n) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(1)} MB`;