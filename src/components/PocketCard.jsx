import { categoryStatus, categoryLeft, goalSaved, goalPlan } from '../lib/calc.js'
import { formatRupiah } from '../lib/money.js'

function statusStyles(status) {
  if (status === 'over') return 'bg-rose-500'
  if (status === 'warn') return 'bg-amber-500'
  return 'bg-teal-500'
}

export default function PocketCard({ cat, txs, currentMonthId, onClick, onSave, onUse, onDelete }) {
  const { used, budget, status, pct } = categoryStatus(cat, txs)
  const left = categoryLeft(cat, txs)
  const goal = cat.goalAmount > 0 ? cat.goalAmount : 0
  const gs = goalSaved(cat, txs)
  const savedAmt = gs.saved
  const goalPct = goal ? Math.min(100, Math.round((savedAmt / goal) * 100)) : 0
  const goalDone = goal > 0 && savedAmt >= goal
  const plan = goalPlan(cat, txs, currentMonthId)

  const isFullCard = goal > 0

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
      className="group block w-full cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 text-left shadow-tactile-sm transition-[transform,box-shadow,border-color,background-color] duration-120 ease-out-expo hover:border-slate-300 hover:shadow-tactile active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 animate-in fade-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 select-none"
    >
      {isFullCard ? (
        /* Card Penuh (Ber-target): Nama pocket di baris tersendiri di paling atas */
        <div className="space-y-2.5">
          {/* Baris 1: Dot Warna + Nama Pocket (lebar penuh) + Tombol Hapus */}
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                style={{ backgroundColor: cat.color }}
              />
              <span className="truncate font-sans text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {cat.name}
              </span>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(cat)
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                title="Hapus pocket"
                aria-label={`Hapus pocket ${cat.name}`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>

          {/* Baris 2: Badge Status Target di kiri, Pengeluaran & Sisa di kanan */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                goalDone
                  ? 'border border-emerald-200/80 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'border border-teal-200/80 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
              }`}
            >
              {goalDone ? 'Target Tercapai' : `Target ${formatRupiah(goal)}`}
            </span>

            <div className="text-right">
              <p className="font-sans text-xs sm:text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                {formatRupiah(used)}
                {budget > 0 && (
                  <span className="text-[11px] font-normal tabular-nums text-slate-500 dark:text-slate-400">
                    {' '}/ {formatRupiah(budget)}
                  </span>
                )}
              </p>
              <p
                className={`text-[11px] font-semibold tabular-nums ${
                  status === 'over'
                    ? 'text-rose-500'
                    : status === 'warn'
                      ? 'text-amber-500'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                sisa {formatRupiah(left)}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Card Biasa: 1 baris ringkas */
        <div className="flex items-center justify-between gap-3">
          {/* Sisi Kiri: Dot Warna Pocket & Nama */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className="h-3 w-3 shrink-0 rounded-full shadow-sm"
              style={{ backgroundColor: cat.color }}
            />
            <span className="truncate font-sans text-sm sm:text-base font-semibold tracking-tight text-slate-900 dark:text-white">
              {cat.name}
            </span>
          </div>

          {/* Sisi Kanan: Nominal Terpakai / Budget & Sisa Saldo */}
          <div className="flex items-center gap-2 shrink-0 text-right">
            <div>
              <p className="font-sans text-sm sm:text-base font-bold tabular-nums text-slate-900 dark:text-white">
                {formatRupiah(used)}
                {budget > 0 && (
                  <span className="text-xs font-normal tabular-nums text-slate-500 dark:text-slate-400">
                    {' '}/ {formatRupiah(budget)}
                  </span>
                )}
              </p>
              <p
                className={`text-xs font-semibold tabular-nums ${
                  status === 'over'
                    ? 'text-rose-500'
                    : status === 'warn'
                      ? 'text-amber-500'
                      : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                sisa {formatRupiah(left)}
              </p>
            </div>
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(cat)
                }}
                className="flex h-9 w-9 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 active:scale-95 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                title="Hapus pocket"
                aria-label={`Hapus pocket ${cat.name}`}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar Pengeluaran */}
      {budget > 0 && (
        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-transform duration-260 ease-out-expo ${statusStyles(status)}`}
            style={{
              transform: `scaleX(${Math.min(100, Math.max(0, pct)) / 100})`,
              transformOrigin: 'left',
            }}
          />
        </div>
      )}

      {/* Bagian Target Tabungan (jika ada target) */}
      {goal > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="min-w-0">
              <span className="font-semibold tabular-nums text-slate-900 dark:text-white">
                Terkumpul {formatRupiah(savedAmt)}
              </span>
              <span className="ml-1 text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                / {formatRupiah(goal)}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                {goalPct}%
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onSave(cat)
                }}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Nabung
              </button>
              {savedAmt > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onUse(cat)
                  }}
                  className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 shadow-sm transition hover:bg-teal-100 active:scale-95 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50"
                >
                  Pakai
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-transform duration-260 ease-out-expo ${goalDone ? 'bg-emerald-500' : 'bg-teal-500'}`}
              style={{
                transform: `scaleX(${Math.min(100, Math.max(0, goalPct)) / 100})`,
                transformOrigin: 'left',
              }}
            />
          </div>
          {plan && !goalDone && (
            <p
              className={`mt-1.5 text-[11px] font-medium tabular-nums ${
                plan.overdue ? 'text-rose-500' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {plan.overdue
                ? `Deadline lewat · perlu ${formatRupiah(plan.needed)} untuk mencapai target`
                : `Butuh ${formatRupiah(plan.monthlyAmount)} / bulan sampai ${new Date(
                    `${cat.goalDeadline}T00:00:00`,
                  ).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
