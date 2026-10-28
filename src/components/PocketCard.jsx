import { categoryStatus, categoryLeft, goalSaved, goalPlan } from '../lib/calc.js'
import { formatRupiah } from '../lib/money.js'

function statusStyles(status) {
  if (status === 'over') return 'bg-rose-500'
  if (status === 'warn') return 'bg-amber-500'
  return 'bg-teal-500'
}

export default function PocketCard({ cat, txs, currentMonthId, onClick, onSave, onUse }) {
  const { used, budget, status, pct } = categoryStatus(cat, txs)
  const left = categoryLeft(cat, txs)
  const goal = cat.goalAmount > 0 ? cat.goalAmount : 0
  const gs = goalSaved(cat, txs)
  const savedAmt = gs.saved
  const goalPct = goal ? Math.min(100, Math.round((savedAmt / goal) * 100)) : 0
  const goalDone = goal > 0 && savedAmt >= goal
  const plan = goalPlan(cat, txs, currentMonthId)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.(e)
        }
      }}
      className="block w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="truncate font-sans text-sm font-semibold text-slate-900 dark:text-white">{cat.name}</span>
          {goal > 0 && (
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${goalDone ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300'}`}>
              {goalDone ? 'Target Tercapai' : `Target ${formatRupiah(goal)}`}
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="font-sans text-sm font-bold text-slate-900 dark:text-white">
            {formatRupiah(used)}
            {budget > 0 && <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / {formatRupiah(budget)}</span>}
          </p>
          <p className={`text-[11px] font-semibold ${status === 'over' ? 'text-rose-500' : status === 'warn' ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
            sisa {formatRupiah(left)}
          </p>
        </div>
      </div>
      {budget > 0 && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div className={`h-full rounded-full ${statusStyles(status)} transition-all`} style={{ width: `${pct}%` }} />
        </div>
      )}
      {goal > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="truncate">Terkumpul {formatRupiah(savedAmt)} / {formatRupiah(goal)}</span>
            <span className="flex shrink-0 items-center gap-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{goalPct}%</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onSave(cat) }}
                className="shrink-0 whitespace-nowrap rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Nabung
              </button>
              {savedAmt > 0 && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onUse(cat) }}
                  className="shrink-0 whitespace-nowrap rounded-xl border border-teal-200 bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700 shadow-sm transition hover:bg-teal-100 active:scale-95 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50"
                >
                  Pakai
                </button>
              )}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full ${goalDone ? 'bg-emerald-500' : 'bg-teal-500'} transition-all`} style={{ width: `${goalPct}%` }} />
          </div>
          {plan && !goalDone && (
            <p className={`mt-1.5 text-[11px] font-medium ${plan.overdue ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'}`}>
              {plan.overdue
                ? `Deadline lewat · perlu ${formatRupiah(plan.needed)} untuk mencapai target`
                : `Butuh ${formatRupiah(plan.monthlyAmount)} / bulan sampai ${new Date(`${cat.goalDeadline}T00:00:00`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
