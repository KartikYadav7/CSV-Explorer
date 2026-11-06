import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { PAGE_SIZES } from '../lib/csv';
import { btnGhost, field } from './ui';

export default function Pagination({ page, pageCount, pageSize, onPage, onPageSize }) {
  const first = page === 0, last = page >= pageCount - 1;
  const nav = [
    [ChevronsLeft, 'First page', 0, first],
    [ChevronLeft, 'Previous page', page - 1, first],
    [ChevronRight, 'Next page', page + 1, last],
    [ChevronsRight, 'Last page', pageCount - 1, last],
  ];
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
      <label className="flex items-center gap-2 text-sm text-slate-400">
        Rows per page
        <select className={`${field} h-9`} value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
          {PAGE_SIZES.map((n) => <option key={n}>{n}</option>)}
        </select>
      </label>
      <div className="flex items-center gap-1.5">
        <span className="mr-2 text-sm tabular-nums text-slate-400">Page {page + 1} of {pageCount.toLocaleString()}</span>
        {nav.map(([Icon, label, to, off]) => (
          <button key={label} aria-label={label} disabled={off} onClick={() => onPage(to)} className={`${btnGhost} h-9 w-9 px-0`}>
            <Icon className="h-4 w-4" />
          </button>
        ))}
      </div>
    </div>
  );
}
Pagination.propTypes = {
  page: PropTypes.number.isRequired, pageCount: PropTypes.number.isRequired, pageSize: PropTypes.number.isRequired,
  onPage: PropTypes.func.isRequired, onPageSize: PropTypes.func.isRequired,
};
