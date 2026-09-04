import { categoryStatus, categoryLeft, goalSaved } from '../lib/calc.js'
import { formatRupiah } from '../lib/money.js'

function statusStyles(status) {
  if (status === 'over') return 'bg-ember'
  if (status === 'warn') return 'bg-sunburst'
  return 'bg-violet'
}

export default function PocketCard({ cat, txs, onClick, onSave }) {
  const { used, budget, status, pct } = categoryStatus(cat, txs)
  const left = categoryLeft(cat, txs)
  const goal = cat.goalAmount > 0 ? cat.goalAmount : 0
  const gs = goalSaved(cat, txs)
  const savedAmt = gs.saved
  const goalPct = goal ? Math.min(100, Math.round((savedAmt / goal) * 100)) : 0
  const goalDone = goal > 0 && savedAmt >= goal

  return (
    <div
      onClick={onClick}
      className="block w-full cursor-pointer rounded-2xl border-2 border-carbon bg-paper p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-carbon-sm active:scale-[0.99] dark:border-white/30 dark:bg-slate-900 dark:hover:bg-slate-800"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="truncate font-medium text-carbon dark:text-white">{cat.name}</span>
          {goal > 0 && (
            <span className={`shrink-0 rounded-full border border-carbon px-2 py-0.5 text-[10px] font-semibold ${goalDone ? 'bg-mint/70 text-carbon' : 'bg-sky/70 text-carbon'}`}>
              {goalDone ? 'Target Tercapai' : `Target ${formatRupiah(goal)}`}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-carbon dark:text-white">
            {formatRupiah(used)}
            {budget > 0 && <span className="font-normal text-slate-400"> / {formatRupiah(budget)}</span>}
          </p>
          <p className={`text-[11px] font-medium ${status === 'over' ? 'text-ember' : status === 'warn' ? 'text-brand-600' : 'text-slate-400'}`}>
            sisa {formatRupiah(left)}
          </p>
        </div>
      </div>
      {budget > 0 && (
        <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full border border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10">
          <div className={`h-full rounded-full ${statusStyles(status)} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {goal > 0 && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>Terkumpul {formatRupiah(savedAmt)} / {formatRupiah(goal)}</span>
            <span className="flex items-center gap-2">
              <span>{goalPct}%</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSave(cat) }}
                className="rounded-full border border-carbon bg-sunburst/50 px-2 py-0.5 text-[10px] font-semibold text-carbon transition hover:bg-sunburst dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
              >
                + Simpan
              </button>
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full border border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10">
            <div className={`h-full rounded-full ${goalDone ? 'bg-mint' : 'bg-violet'} transition-all`} style={{ width: `${goalPct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
