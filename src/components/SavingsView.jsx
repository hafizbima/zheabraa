import { useState, useMemo } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { savingsSummary } from '../lib/calc.js'
import { formatRupiah } from '../lib/money.js'
import { useCountUp } from '../hooks/useCountUp.js'
import { haptic } from '../lib/haptics.js'
import SavingsGoalCard from './SavingsGoalCard.jsx'
import SavingsDetailSheet from './SavingsDetailSheet.jsx'
import SaveGoalModal from './SaveGoalModal.jsx'
import AddPocketModal from './AddPocketModal.jsx'

export default function SavingsView() {
  const { months = {}, currentMonthId, addCategory, updateCategory, saveToGoal, useGoal } = useStore()
  const [filter, setFilter] = useState('all') // 'all' | 'active' | 'done'
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [saveModal, setSaveModal] = useState(null) // { cat, mode: 'nabung' | 'pakai', available }
  const [addGoalOpen, setAddGoalOpen] = useState(false)

  const summary = useMemo(() => {
    return savingsSummary(months, currentMonthId)
  }, [months, currentMonthId])

  const animatedTotalSaved = useCountUp(summary.totalSaved)

  // Filtered goals
  const filteredGoals = useMemo(() => {
    if (filter === 'active') return summary.goals.filter((g) => !g.done)
    if (filter === 'done') return summary.goals.filter((g) => g.done)
    return summary.goals
  }, [summary.goals, filter])

  const handleDeposit = (category) => {
    const targetCat = category || summary.goals[0]?.category
    if (!targetCat) {
      setAddGoalOpen(true)
      return
    }
    const goalItem = summary.goals.find((g) => g.id === targetCat.id)
    setSaveModal({
      cat: targetCat,
      mode: 'nabung',
      available: goalItem ? goalItem.saved : 0,
    })
  }

  const handleWithdraw = (category) => {
    const targetCat = category || summary.goals[0]?.category
    if (!targetCat) return
    const goalItem = summary.goals.find((g) => g.id === targetCat.id)
    setSaveModal({
      cat: targetCat,
      mode: 'pakai',
      available: goalItem ? goalItem.saved : 0,
    })
  }

  return (
    <div className="space-y-6">
      {/* Hero Summary Card */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-tactile sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Tabungan Terkumpul
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-sans text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 sm:text-4xl dark:text-white">
                {formatRupiah(animatedTotalSaved)}
              </span>
              {summary.totalTarget > 0 && (
                <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400 sm:text-sm">
                  dari {formatRupiah(summary.totalTarget)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-teal-600 dark:text-teal-400">{summary.reachedCount}</span> dari{' '}
              <span className="font-medium text-slate-800 dark:text-slate-200">{summary.goals.length}</span> target tercapai
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {summary.goals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  handleDeposit(summary.goals[0]?.category)
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-tactile-sm transition-[transform,background-color] duration-120 ease-out-expo active:scale-[0.97] hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
                + Setor Tabungan
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                haptic.tap()
                setAddGoalOpen(true)
              }}
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-transparent bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-tactile-sm transition-[transform,background-color] duration-120 ease-out-expo active:scale-[0.97] hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              + Target Baru
            </button>
          </div>
        </div>

        {/* Aggregate Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>Progres Keseluruhan</span>
            <span className="font-semibold tabular-nums text-teal-600 dark:text-teal-400">{summary.pct}%</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-teal-600 transition-transform duration-260 ease-out-expo dark:bg-teal-500"
              style={{
                transform: `scaleX(${Math.min(summary.pct, 100) / 100})`,
                transformOrigin: 'left',
              }}
            />
          </div>
        </div>
      </section>

      {/* Filter Chips & List Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white p-1 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              haptic.selection()
              setFilter('all')
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,color] duration-120 ease-out-expo active:scale-[0.97] ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-teal-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Semua ({summary.goals.length})
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.selection()
              setFilter('active')
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,color] duration-120 ease-out-expo active:scale-[0.97] ${
              filter === 'active'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-teal-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Sedang Berjalan ({summary.goals.filter((g) => !g.done).length})
          </button>
          <button
            type="button"
            onClick={() => {
              haptic.selection()
              setFilter('done')
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-[transform,background-color,color] duration-120 ease-out-expo active:scale-[0.97] ${
              filter === 'done'
                ? 'bg-slate-900 text-white shadow-sm dark:bg-teal-600'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Tercapai ({summary.reachedCount})
          </button>
        </div>
      </div>

      {/* Goal Cards List / Empty State */}
      {filteredGoals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
          <h3 className="mt-3 font-sans text-base font-semibold text-slate-900 dark:text-white">
            {filter === 'all'
              ? 'Belum ada target tabungan'
              : filter === 'active'
              ? 'Tidak ada target yang sedang berjalan'
              : 'Belum ada target yang tercapai'}
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500 dark:text-slate-400">
            {filter === 'all'
              ? 'Mulai kumpulkan dana untuk impianmu. Buat target tabungan dan sisihkan dana setiap bulan secara terencana.'
              : 'Semua target tabungan telah diselesaikan atau difilter.'}
          </p>
          {filter === 'all' && (
            <button
              type="button"
              onClick={() => {
                haptic.tap()
                setAddGoalOpen(true)
              }}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border border-transparent bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-tactile-sm transition-[transform,background-color] duration-120 ease-out-expo active:scale-[0.97] hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              + Buat Target Tabungan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.key || goal.id}
              goal={goal}
              onOpenDetail={(g) => setSelectedGoal(g)}
              onDeposit={handleDeposit}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}

      {/* Add Pocket Modal (Tabungan Mode) */}
      {addGoalOpen && (
        <AddPocketModal
          initialType="saving"
          onClose={() => setAddGoalOpen(false)}
          onAdd={async (catData) => {
            if (catData.existingPocketId) {
              await updateCategory(currentMonthId, catData.existingPocketId, {
                goalAmount: catData.goalAmount,
                ...(catData.goalDeadline ? { goalDeadline: catData.goalDeadline } : {}),
                ...(catData.walletId ? { walletId: catData.walletId } : {}),
                pocketType: 'saving',
              })
            } else {
              await addCategory(currentMonthId, { ...catData, pocketType: 'saving' })
            }
          }}
        />
      )}

      {/* Detail Sheet */}
      {selectedGoal && (
        <SavingsDetailSheet
          goal={selectedGoal}
          onClose={() => setSelectedGoal(null)}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* Deposit / Withdraw Modal */}
      {saveModal && (
        <SaveGoalModal
          cat={saveModal.cat}
          mode={saveModal.mode}
          available={saveModal.available}
          onClose={() => setSaveModal(null)}
          onSubmit={(amt, desc, walletId, targetCatId) => {
            const finalCatId = targetCatId || saveModal.cat?.id
            if (!finalCatId) return
            if (saveModal.mode === 'pakai') {
              useGoal(currentMonthId, finalCatId, amt, desc || undefined, walletId)
            } else {
              saveToGoal(currentMonthId, finalCatId, amt, walletId)
            }
          }}
        />
      )}
    </div>
  )
}
