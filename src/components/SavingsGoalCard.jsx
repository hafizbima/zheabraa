import { formatRupiah } from '../lib/money.js'
import { haptic } from '../lib/haptics.js'
import { useStore } from '../store/StoreContext.jsx'

export default function SavingsGoalCard({ goal, onOpenDetail, onDeposit, onWithdraw }) {
  const { wallets = [] } = useStore()
  const { name, color, saved, goal: targetAmount, pct, done, deadline, plan, walletId } = goal
  const wallet = wallets.find((w) => w.id === walletId)

  const handleCardClick = () => {
    haptic.selection()
    onOpenDetail(goal)
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
      className="group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm transition-[transform,box-shadow,background-color] duration-120 ease-out-expo active:scale-[0.98] hover:border-slate-300 sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
    >
      {/* Header baris: Dot warna + Nama + Dompet, dan Badge status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="h-3 w-3 shrink-0 rounded-full ring-2 ring-white dark:ring-slate-900"
            style={{ backgroundColor: color || '#0D9488' }}
          />
          <div className="min-w-0">
            <h3 className="truncate font-sans text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
              {name}
            </h3>
            {wallet && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                {wallet.name}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0">
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-950/50 dark:text-teal-300">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Tercapai
            </span>
          ) : plan?.overdue ? (
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              Lewat target
            </span>
          ) : deadline ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {plan?.monthsRemaining ? `${plan.monthsRemaining} bln lagi` : deadline}
            </span>
          ) : (
            <span className="text-xs font-medium tabular-nums text-slate-400 dark:text-slate-500">
              {pct}%
            </span>
          )}
        </div>
      </div>

      {/* Saldo vs Target */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div>
          <span className="font-sans text-lg font-bold tabular-nums text-slate-900 sm:text-xl dark:text-white">
            {formatRupiah(saved)}
          </span>
          {targetAmount > 0 ? (
            <span className="ml-1.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
              / {formatRupiah(targetAmount)}
            </span>
          ) : (
            <span className="ml-1.5 text-xs text-slate-400">tanpa target nominal</span>
          )}
        </div>
        <span className="font-sans text-xs font-semibold tabular-nums text-teal-600 dark:text-teal-400">
          {pct}%
        </span>
      </div>

      {/* Progress Bar (scaleX) */}
      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full transition-transform duration-260 ease-out-expo"
          style={{
            transform: `scaleX(${Math.min(pct, 100) / 100})`,
            transformOrigin: 'left',
            backgroundColor: color || '#0D9488',
          }}
        />
      </div>

      {/* Kebutuhan / bulan dari plan */}
      {plan && !done && plan.monthlyAmount > 0 && (
        <p className="mt-2 text-xs tabular-nums text-slate-500 dark:text-slate-400">
          Perlu <span className="font-medium text-slate-700 dark:text-slate-300">{formatRupiah(plan.monthlyAmount)}</span> / bulan untuk capai target
        </p>
      )}

      {/* Action buttons */}
      <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        {saved > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              haptic.tap()
              onWithdraw(goal.category)
            }}
            className="inline-flex min-h-[36px] items-center justify-center rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-tactile-sm transition-[transform,background-color] duration-120 ease-out-expo active:scale-[0.97] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Tarik
          </button>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            haptic.tap()
            onDeposit(goal.category)
          }}
          className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-xl border border-transparent bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-tactile-sm transition-[transform,background-color] duration-120 ease-out-expo active:scale-[0.97] hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Setor
        </button>
      </div>
    </div>
  )
}
