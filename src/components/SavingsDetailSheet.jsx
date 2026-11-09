import Modal from './Modal.jsx'
import { formatRupiah } from '../lib/money.js'
import { goalHistory, goalProjection } from '../lib/calc.js'
import { useStore } from '../store/StoreContext.jsx'
import { btn } from '../lib/buttons.js'
import { haptic } from '../lib/haptics.js'

function formatMonthYear(monthId) {
  if (!monthId) return ''
  const [yyyy, mm] = monthId.split('-')
  const date = new Date(Number(yyyy), Number(mm) - 1, 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export default function SavingsDetailSheet({ goal, onClose, onDeposit, onWithdraw }) {
  const { months = {}, currentMonthId, wallets = [] } = useStore()

  if (!goal) return null

  const { name, color, saved, goal: targetAmount, pct, done, deadline, plan } = goal
  const history = goalHistory(goal.key, months)
  const projection = goalProjection(goal.key, months, currentMonthId)

  const milestones = [25, 50, 75, 100]
  const linkedWallet = wallets.find((w) => w.id === goal.walletId)

  const getWalletName = (wId) => {
    if (!wId) return null
    const w = wallets.find((item) => item.id === wId)
    return w ? w.name : null
  }

  return (
    <Modal
      title={name}
      onClose={onClose}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          {saved > 0 ? (
            <button
              type="button"
              onClick={() => {
                haptic.tap()
                onClose()
                onWithdraw(goal.category)
              }}
              className={btn.neutral}
            >
              Tarik Tabungan
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={() => {
              haptic.tap()
              onClose()
              onDeposit(goal.category)
            }}
            className={btn.primary}
          >
            + Setor Tabungan
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Progress Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Terkumpul
              </p>
              <p className="mt-1 font-sans text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
                {formatRupiah(saved)}
              </p>
            </div>
            <div className="text-right">
              <span className="font-sans text-xl font-bold tabular-nums text-teal-600 dark:text-teal-400">
                {pct}%
              </span>
              {targetAmount > 0 && (
                <p className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  Target: {formatRupiah(targetAmount)}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-transform duration-260 ease-out-expo"
              style={{
                transform: `scaleX(${Math.min(pct, 100) / 100})`,
                transformOrigin: 'left',
                backgroundColor: color || '#0D9488',
              }}
            />
          </div>

          {/* Milestones */}
          <div className="mt-4 border-t border-slate-200/70 pt-3 dark:border-slate-800">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pencapaian Milestone
            </p>
            <div className="mt-2.5 grid grid-cols-4 gap-2">
              {milestones.map((m) => {
                const reached = pct >= m
                return (
                  <div
                    key={m}
                    className={`flex flex-col items-center justify-center rounded-xl border p-2 text-center transition-colors ${
                      reached
                        ? 'border-teal-200 bg-teal-50/60 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-300'
                        : 'border-slate-200/80 bg-white text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-600'
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${
                        reached
                          ? 'bg-teal-600 text-white dark:bg-teal-500'
                          : 'border border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {reached ? (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-draw-check"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span className="text-[10px] font-semibold">{m}</span>
                      )}
                    </div>
                    <span className="mt-1 font-sans text-[11px] font-medium tabular-nums">
                      {m}%
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Proyeksi & Rencana */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Proyeksi & Jadwal
          </h4>
          <div className="mt-2.5 space-y-2 text-xs">
            {linkedWallet && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Dompet / Rekening:</span>
                <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                  {linkedWallet.name}
                </span>
              </div>
            )}
            {deadline && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Batas Waktu:</span>
                <span className="font-medium text-slate-900 dark:text-white">{deadline}</span>
              </div>
            )}
            {plan && !done && (
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Kebutuhan Bulanan:</span>
                <span className="font-semibold tabular-nums text-teal-600 dark:text-teal-400">
                  {formatRupiah(plan.monthlyAmount)} / bln
                </span>
              </div>
            )}
            {projection?.estimatedMonthId && !done && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Estimasi Selesai:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {formatMonthYear(projection.estimatedMonthId)}
                </span>
              </div>
            )}
            {projection && projection.avgMonthlyDeposit > 0 && !done && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dihitung dari rata-rata setoran 3 bulan terakhir ({formatRupiah(projection.avgMonthlyDeposit)}/bulan).
              </p>
            )}
            {done && (
              <p className="font-medium text-teal-600 dark:text-teal-400">
                Selamat! Target tabungan ini sudah tercapai penuh.
              </p>
            )}
          </div>
        </div>

        {/* Riwayat Setor & Tarik */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h4 className="font-sans text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Riwayat Transaksi Tabungan
            </h4>
            <span className="text-xs tabular-nums text-slate-400">{history.length} catatan</span>
          </div>

          {history.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Belum ada catatan setoran atau penarikan pada target tabungan ini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
              {history.map((item) => {
                const isDeposit = item.type === 'deposit'
                const wName = getWalletName(item.walletId)
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 transition-colors active:bg-slate-50 dark:active:bg-slate-800/60"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          isDeposit
                            ? 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                        }`}
                      >
                        {isDeposit ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="19" x2="12" y2="5" />
                            <polyline points="5 12 12 5 19 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <polyline points="19 12 12 19 5 12" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-sans text-xs font-semibold text-slate-900 dark:text-white">
                          {item.description}
                        </p>
                        <p className="text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
                          {item.date} {wName ? `• ${wName}` : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-sans text-xs font-bold tabular-nums ${
                        isDeposit ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isDeposit ? '+' : '-'}{formatRupiah(item.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
