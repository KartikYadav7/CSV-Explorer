import { glass } from './ui';

const Bar = ({ className = '' }) => <div className={`animate-pulse rounded-md bg-white/10 ${className}`} />;

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Parsing your file">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3"><Bar className="h-11 w-11 rounded-xl" /><div className="space-y-2"><Bar className="h-4 w-40" /><Bar className="h-3 w-20" /></div></div>
        <div className="hidden gap-3 sm:flex">{[0, 1, 2].map((i) => <Bar key={i} className="h-14 w-24 rounded-xl" />)}</div>
      </div>
      <div className={`${glass} p-5`}><Bar className="h-10 w-full" /></div>
      <div className={`${glass} space-y-3 p-5`}>
        <Bar className="h-8 w-full" />
        {Array.from({ length: 8 }, (_, i) => <Bar key={i} className="h-6 w-full opacity-60" />)}
      </div>
      <span className="sr-only">Parsing…</span>
    </div>
  );
}
