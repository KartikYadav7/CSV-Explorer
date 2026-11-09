// Parses a CSV File off the main thread. Loaded via `new Worker(new URL(...), { type: 'module' })`,
// which Vite bundles correctly (PapaParse's own `worker: true` option does not survive bundling).
import Papa from 'papaparse';

self.onmessage = ({ data: file }) => {
  Papa.parse(file, {
    header: true,
    skipEmptyLines: 'greedy',
    complete: ({ data, meta }) => self.postMessage({ columns: meta.fields ?? [], rows: data }),
    error: (err) => self.postMessage({ error: err.message }),
  });
};