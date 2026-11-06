# CSV Explorer

A dark-mode, glassmorphism dashboard for exploring CSV files entirely in the browser. Drop a file, stack filter rules across columns, sort, search and export the result. **Nothing is uploaded anywhere.**

Built with React, Vite, Tailwind CSS, PapaParse and lucide-react.

## Features

- **Drag-and-drop ingestion.** Parsed with PapaParse in a web worker, so large files don't freeze the page. Skeleton loader while parsing, inline errors for non-CSV or empty files.
- **Multi-column filter builder.** Add as many rules as you like, each with a column, operator and value. Results update as you type.
  - Operators: Contains, Equals, Starts with, Greater than, Less than.
  - Operators adapt to the data: numeric columns offer Greater than, Less than and Equals; text columns offer Contains, Equals and Starts with.
  - **Match all** (AND) or **Match any** (OR) when there is more than one rule. Rules with an empty value are ignored.
- **Data table.** Sticky header and row-number column, horizontal and vertical scroll, click-to-sort headers (ascending, descending, off), blanks always sort last, column type icons.
- **Pagination.** 10, 25, 50 or 100 rows per page, first/previous/next/last, and a live count: "Showing 1–25 of 312 filtered records · 1,000 total".
- **Export.** Downloads the filtered and sorted rows as `<name>-filtered.csv` (UTF-8 with BOM so Excel opens it correctly).
- **Remembers your session.** The loaded file, filters, Match all / any, sort, page and page size are kept in the browser (IndexedDB) and restored after a refresh or when you reopen the tab. A "Saved on this device" badge shows when this worked; **New file** erases the saved copy. If the browser can't store it (storage full, private mode), the app shows "Not saved" and behaves as before.
- **Resilience.** Error boundary with a "Try again" button, `prop-types` on every component, keyboard-accessible controls, reduced-motion support.

## Getting started

Requires Node 18 or newer.

```bash
npm create vite@latest csv-explorer -- --template react
cd csv-explorer
npm install papaparse lucide-react prop-types tailwindcss @tailwindcss/vite
```

1. Copy this project's `src/` folder over the one Vite generated (it replaces `App.jsx` and `main.jsx`).
2. Replace the contents of `src/index.css` with:

   ```css
   @import "tailwindcss";
   ```

3. Register the Tailwind plugin in `vite.config.js`:

   ```js
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({ plugins: [react(), tailwindcss()] });
   ```

4. Start it:

   ```bash
   npm run dev      # development
   npm run build    # production build in dist/
   npm run preview  # serve the production build locally
   ```

## Project structure

```
src/
├── main.jsx                  Entry point, wraps <App/> in ErrorBoundary
├── index.css                 @import "tailwindcss";
├── App.jsx                   State, session restore, and the filter → sort → paginate pipeline
├── lib/
│   ├── csv.js                Parsing, column type inference, filter engine, sorting, export
│   └── storage.js            IndexedDB save / load / clear (never throws)
└── components/
    ├── ui.js                 Shared Tailwind class strings (glass, field, buttons)
    ├── ErrorBoundary.jsx
    ├── FileUpload.jsx        Drag-and-drop zone
    ├── FilterBuilder.jsx     Filter rules and Match all / any
    ├── DataTable.jsx         Sticky-header table with sortable columns, memoized rows
    ├── Pagination.jsx
    └── DashboardSkeleton.jsx Loading state shown while parsing
```

## How it works

- **Column types.** A column is treated as numeric when at least 90% of its non-empty values (sampled from the first 500 rows) parse as numbers. Values like `$1,200` and `45%` count as numbers.
- **Filtering.** Each rule is compiled into a predicate once per change, so the per-row work stays small. Typing uses `useDeferredValue`, keeping inputs responsive while the filter pass runs at lower priority. Number comparisons are numeric when both sides are numbers, otherwise they fall back to natural text comparison.
- **Sorting.** Sort keys are computed once per sort, not once per comparison.
- **Rendering.** Only the current page of rows is rendered, and table rows are memoized.

## Customising

- **Colours, glass effect, buttons:** edit the class strings in `src/components/ui.js`.
- **Page sizes:** change `PAGE_SIZES` in `src/lib/csv.js`.
- **Operators:** add a case to `compile()` in `src/lib/csv.js`, then list it in `OPERATORS` and `OPS_BY_TYPE`.

## Privacy

Saved data never leaves your browser, but it stays on the device until you click **New file** or clear site data. On a shared computer, click **New file** when you're done.

## Limitations

- The whole file is held in browser memory. Roughly 200,000 rows is a practical ceiling; beyond that, filter and sort in a worker or add row virtualization (for example `@tanstack/react-virtual`).
- Sorting is by one column at a time. The full-stack version (`csv-hub`) supports multi-column sorting and global search.
- No tests are included.

## License

Add the license of your choice.