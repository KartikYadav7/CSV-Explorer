import PropTypes from 'prop-types';
import { Filter, Plus, X, Trash2 } from 'lucide-react';
import { OPERATORS, OPS_BY_TYPE } from '../lib/csv';
import { btnGhost, btnPrimary, field, glass } from './UI';

const opsFor = (types, col) => OPS_BY_TYPE[types[col] || 'text'];

export default function FilterBuilder({ columns, types, rules, mode, onRulesChange, onModeChange }) {
  const add = () => {
    const column = columns[0];
    onRulesChange([...rules, { id: Math.max(0, ...rules.map((r) => r.id)) + 1, column, op: opsFor(types, column)[0], value: '' }]);
  };
  const change = (id, patch) =>
    onRulesChange(
      rules.map((r) => {
        if (r.id !== id) return r;
        const n = { ...r, ...patch };
        const allowed = opsFor(types, n.column);
        if (!allowed.includes(n.op)) n.op = allowed[0]; // keep operator valid for the new column
        return n;
      }),
    );
  const active = rules.filter((r) => r.value.trim()).length;

  return (
    <section className={`${glass} p-4 sm:p-5`} aria-label="Filters">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-medium text-white">
          <Filter className="h-4 w-4 text-teal-300" />Filters
          {active > 0 && <span className="rounded-full bg-teal-400/15 px-2 py-0.5 text-xs text-teal-200">{active} active</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {rules.length > 1 && (
            <div role="group" aria-label="Match mode" className="flex rounded-lg border border-white/10 bg-black/30 p-0.5 text-sm">
              {[['all', 'Match all'], ['any', 'Match any']].map(([v, l]) => (
                <button key={v} aria-pressed={mode === v} onClick={() => onModeChange(v)}
                  className={`rounded-md px-3 py-1.5 transition ${mode === v ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{l}</button>
              ))}
            </div>
          )}
          {rules.length > 0 && <button onClick={() => onRulesChange([])} className={btnGhost}><Trash2 className="h-4 w-4" />Reset</button>}
          <button onClick={add} className={btnPrimary}><Plus className="h-4 w-4" />Add filter</button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {rules.length === 0 && (
          <p className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-sm text-slate-500">
            No filters yet. Add one to narrow the table by any column.
          </p>
        )}
        {rules.map((r) => (
          <div key={r.id} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_9rem_1.2fr_auto]">
            <select aria-label="Column" className={field} value={r.column} onChange={(e) => change(r.id, { column: e.target.value })}>
              {columns.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select aria-label="Operator" className={field} value={r.op} onChange={(e) => change(r.id, { op: e.target.value })}>
              {opsFor(types, r.column).map((o) => <option key={o} value={o}>{OPERATORS[o]}</option>)}
            </select>
            <input aria-label="Value" className={field} placeholder={types[r.column] === 'number' ? 'Number' : 'Text'}
              inputMode={types[r.column] === 'number' ? 'decimal' : 'text'} value={r.value}
              onChange={(e) => change(r.id, { value: e.target.value })} />
            <button aria-label="Remove filter" onClick={() => onRulesChange(rules.filter((x) => x.id !== r.id))}
              className={`${btnGhost} px-3 hover:border-rose-400/40 hover:text-rose-300`}><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </section>
  );
}
FilterBuilder.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.string).isRequired,
  types: PropTypes.objectOf(PropTypes.oneOf(['text', 'number'])).isRequired,
  rules: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired, column: PropTypes.string, op: PropTypes.string, value: PropTypes.string,
  })).isRequired,
  mode: PropTypes.oneOf(['all', 'any']).isRequired,
  onRulesChange: PropTypes.func.isRequired,
  onModeChange: PropTypes.func.isRequired,
};