import { memo } from 'react';
import PropTypes from 'prop-types';
import { ArrowUp, ArrowDown, ArrowUpDown, Hash, Type, SearchX } from 'lucide-react';
import { btnGhost } from './UI';

const Row = memo(function Row({ row, index, columns }) {
  return (
    <tr className="transition-colors hover:bg-white/[0.05]">
      <td className="sticky left-0 border-b border-white/5 bg-slate-950/90 px-4 py-2.5 tabular-nums text-slate-600">{index}</td>
      {columns.map((c) => (
        <td key={c} title={row[c]} className="max-w-xs truncate border-b border-white/5 px-4 py-2.5 text-slate-300">
          {row[c] === '' || row[c] == null ? <span className="text-slate-700">—</span> : row[c]}
        </td>
      ))}
    </tr>
  );
});
Row.propTypes = { row: PropTypes.object.isRequired, index: PropTypes.number.isRequired, columns: PropTypes.array.isRequired };

function DataTable({ columns, types, rows, startIndex, sort, onSort, onClearFilters }) {
  const th = 'sticky top-0 z-10 border-b border-white/10 bg-slate-900/95 backdrop-blur';
  return (
    <div className="max-h-[62vh] overflow-auto">
      <table className="w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            <th className={`${th} left-0 z-20 px-4 py-3 text-xs font-medium text-slate-500`}>#</th>
            {columns.map((c) => {
              const dir = sort.column === c ? sort.dir : null;
              const TypeIcon = types[c] === 'number' ? Hash : Type;
              const Arrow = dir === 'asc' ? ArrowUp : dir === 'desc' ? ArrowDown : ArrowUpDown;
              return (
                <th key={c} scope="col" aria-sort={dir ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'} className={`${th} whitespace-nowrap p-0`}>
                  <button onClick={() => onSort(c)} className="group flex w-full items-center gap-2 px-4 py-3 text-left font-medium text-slate-200 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-400/60">
                    <TypeIcon className="h-3.5 w-3.5 text-slate-500" />{c}
                    <Arrow className={`h-3.5 w-3.5 transition ${dir ? 'text-teal-300' : 'opacity-0 group-hover:opacity-50'}`} />
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => <Row key={startIndex + i} row={row} index={startIndex + i + 1} columns={columns} />)}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <div className="rounded-2xl bg-white/5 p-4 text-slate-400"><SearchX className="h-7 w-7" /></div>
          <p className="font-medium text-white">No records match these filters</p>
          <p className="max-w-sm text-sm text-slate-500">Loosen a rule, switch to “Match any”, or reset the filters to see every row.</p>
          <button onClick={onClearFilters} className={btnGhost}>Reset filters</button>
        </div>
      )}
    </div>
  );
}
DataTable.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  types: PropTypes.object.isRequired,
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  startIndex: PropTypes.number.isRequired,
  sort: PropTypes.shape({ column: PropTypes.string, dir: PropTypes.oneOf(['asc', 'desc']) }).isRequired,
  onSort: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};
export default memo(DataTable);
