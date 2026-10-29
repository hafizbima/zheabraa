import { useState, useEffect, useRef } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt, formatNumberInput } from '../lib/money.js'
import { monthIdOf, labelOf } from '../lib/dates.js'
import {
  totalInflow,
  totalAllocated,
  freeLeft,
  freeMoneySpent,
  freePool,
  categoryStatus,
  goalSaved,
  walletBalance,
  singleWalletBalance,
  allTransactions,
  safeDailySpend,
  isRecurringBillPaid,
} from '../lib/calc.js'
import { haptic } from '../lib/haptics.js'
import DonutChart from './DonutChart.jsx'
import ReallocateForm from './ReallocateForm.jsx'
import EmptyState from './EmptyState.jsx'
import QuickAdd from './QuickAdd.jsx'
import PocketCard from './PocketCard.jsx'
import SaveGoalModal from './SaveGoalModal.jsx'
import Confirm from './Confirm.jsx'
import AddPocketModal from './AddPocketModal.jsx'
import { btn } from '../lib/buttons.js'
import { notificationCandidates, notificationsEnabled, sendNotificationOnce } from '../lib/notifications.js'

function Card({ label, value, sub, accent, tint }) {
  return (
    <div
      className={`group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 ${
        tint || ''
      }`}
    >
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">{label}</p>
      <p className={`mt-1 font-sans text-xl font-bold tracking-tight ${accent || 'text-slate-900 dark:text-white'}`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  )
}

function statusStyles(status) {
  if (status === 'over') return 'bg-rose-500'
  if (status === 'warn') return 'bg-amber-500'
  return 'bg-teal-500'
}

export default function Dashboard({ onNewTx, onEditTx, onManageCategories, onManageBudgetTemplates, onManageRecurring, onTransfer }) {
  const {
    user,
    currentMonth: month,
    currentMonthId,
    wallets,
    months,
    templates,
    addIncome,
    updateIncome,
    removeIncome,
    setCarryOver,
    setMonthNote,
    saveToGoal,
    useGoal,
    notify,
    addCategory,
    removeCategory,
  } = useStore()

  const [editingIncome, setEditingIncome] = useState(null)
  const [reallocOpen, setReallocOpen] = useState(false)
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [carryDraft, setCarryDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')
  const [saveModal, setSaveModal] = useState(null) // { cat, mode: 'nabung' | 'pakai' }
  const [deleteConfirmCat, setDeleteConfirmCat] = useState(null)
  const [addPocketOpen, setAddPocketOpen] = useState(false)
  const notifiedOver = useRef(new Set())
  const [notificationVersion, setNotificationVersion] = useState(0)

  useEffect(() => {
    const onChange = () => setNotificationVersion((version) => version + 1)
    window.addEventListener('gmm-notifications-changed', onChange)
    return () => window.removeEventListener('gmm-notifications-changed', onChange)
  }, [])

  useEffect(() => {
    setCarryDraft(month && month.carryOver ? formatNumberInput(month.carryOver) : '')
  }, [month?.carryOver])

  useEffect(() => {
    setNoteDraft(month ? String(month.note ?? '') : '')
  }, [month?.note])

  const txs = month?.transactions || []
  const inflow = month ? totalInflow(month) : 0
  const allocated = month ? totalAllocated(month) : 0
  const pool = month ? freePool(month) : 0
  const freeSpent = freeMoneySpent(txs)
  const left = month ? freeLeft(month) : 0
  const dailySpend = month ? safeDailySpend(month, templates) : { amount: 0, daysRemaining: 0, plannedBills: 0, discretionaryLeft: 0 }
  const primary = wallets[0] || null
  const primaryBalance = primary
    ? wallets.length === 1
      ? singleWalletBalance(primary, months)
      : walletBalance(primary, allTransactions(months))
    : 0

  // threshold 70% + top 3
  const alerts = (month?.categories || [])
    .map((cat) => ({ cat, ...categoryStatus(cat, txs) }))
    .filter((a) => a.budget > 0 && a.pct >= 70)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  const donutData = (month?.categories || [])
    .filter((c) => c.budgetAmount > 0)
    .map((c) => ({ name: c.name, value: c.budgetAmount, color: c.color }))

  // notifikasi sekali per pocket saat status over
  useEffect(() => {
    if (!month) return
    for (const a of alerts) {
      if (a.status === 'over' && !notifiedOver.current.has(a.cat.id)) {
        notifiedOver.current.add(a.cat.id)
        notify(`Pocket "${a.cat.name}" melebihi budget ${formatRupiah(a.budget)}`)
      }
    }
  }, [alerts, notify, month])

  useEffect(() => {
    if (!user || !month || !notificationsEnabled(user.uid)) return
    const candidates = notificationCandidates({ month, templates })
    candidates.forEach((candidate) => sendNotificationOnce(user.uid, candidate))
  }, [user, month, templates, notificationVersion])

  if (!month) return null

  const upcomingBills = templates.filter((t) => t.type === 'bill' && t.active !== false)

  const saveIncome = () => {
    const amount = toInt(incomeAmount)
    if (editingIncome) {
      updateIncome(currentMonthId, editingIncome.id, { label: incomeLabel || 'Pemasukan', amount })
    } else {
      addIncome(currentMonthId, { label: incomeLabel || 'Pemasukan', amount })
    }
    haptic.success()
    setEditingIncome(null)
    setIncomeLabel('')
    setIncomeAmount('')
  }

  const editIncome = (inc) => {
    setEditingIncome(inc)
    setIncomeLabel(inc.description)
    setIncomeAmount(formatNumberInput(inc.amount || ''))
  }

  const commitCarry = () => {
    setCarryOver(currentMonthId, toInt(carryDraft))
  }

  const commitNote = () => {
    setMonthNote(currentMonthId, noteDraft.trim())
  }

  const input =
    'rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  return (
    <>
      <div className="space-y-5">
      {/* Panduan Onboarding 3 Langkah */}
      {inflow === 0 && allocated === 0 && (
        <section className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-teal-50/60 p-5 shadow-tactile-sm dark:border-teal-500/30 dark:bg-teal-950/30">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
              i
            </span>
            <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
              Mulai Budgeting dalam 3 Langkah
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Agar keuangan bulan ini tertata rapi, ikuti alur metode Pocket berikut:
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-teal-200/80 bg-white p-4 shadow-sm dark:border-teal-800/60 dark:bg-slate-900">
              <div>
                <span className="inline-block rounded-lg bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
                  Langkah 1
                </span>
                <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Isi Pemasukan</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Catat gaji atau modal masuk sebagai dasar budget bulan ini.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  onNewTx({ type: 'income' })
                }}
                className="mt-3.5 inline-flex items-center justify-center rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-95"
              >
                + Isi Pemasukan
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Langkah 2
                </span>
                <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Bagi ke Pocket</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Alokasikan budget untuk kebutuhan bulanan seperti makan, transport, dll.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  onManageCategories()
                }}
                className="mt-3.5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Atur Budget Pocket
              </button>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Langkah 3
                </span>
                <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">Catat Pengeluaran</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Catat transaksi harian agar sisa uang selalu terkontrol secara real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  onNewTx(null)
                }}
                className="mt-3.5 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Catat Transaksi
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Hero Card: Sisa Uang Bebas */}
      <section className="relative overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-50/70 via-white to-white p-6 shadow-tactile-sm transition-colors duration-200 dark:border-teal-500/25 dark:bg-gradient-to-br dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Sisa Uang Bebas
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {labelOf(month.id)}
          </span>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <p className={`font-sans text-3xl sm:text-4xl font-bold tracking-tight ${left < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
              {formatRupiah(left)}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              Tersedia untuk dibelanjakan bulan ini • Dari total pool {formatRupiah(pool)} (terpakai {formatRupiah(freeSpent)})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {inflow === 0 && (
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  onNewTx({ type: 'income' })
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-600 bg-teal-50 px-3.5 py-2.5 text-xs font-semibold text-teal-700 shadow-tactile-sm transition hover:bg-teal-100 active:scale-95 dark:border-teal-400 dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-900/60"
              >
                + Isi Pemasukan Dulu
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                haptic.tap()
                onNewTx(null)
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-tactile-sm transition hover:bg-slate-800 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Tambah Pengeluaran
            </button>
          </div>
        </div>

        {/* Progress Bar Terpakai / Total Pool */}
        <div className="mt-5 border-t border-slate-100 pt-3.5 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Terpakai: <strong className="font-semibold text-slate-900 dark:text-white">{formatRupiah(freeSpent)}</strong>
              {pool > 0 && (
                <span className="ml-1 text-[11px] text-slate-400 dark:text-slate-500">
                  ({Math.min(100, Math.round((freeSpent / pool) * 100))}%)
                </span>
              )}
            </span>
            <span>
              Total Pool: <strong className="font-semibold text-slate-900 dark:text-white">{formatRupiah(pool)}</strong>
            </span>
          </div>

          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                left < 0
                  ? 'bg-rose-500'
                  : pool > 0 && left / pool < 0.25
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
              }`}
              style={{
                width: `${Math.min(100, Math.max(0, pool > 0 ? (freeSpent / pool) * 100 : 0))}%`,
              }}
            />
          </div>
        </div>
      </section>

      {/* Supporting Metric Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card label="Total Pemasukan" value={formatRupiah(inflow)} accent="text-teal-600 dark:text-teal-400" />
        <Card label="Teralokasi ke Pocket" value={formatRupiah(allocated)} sub={`uang bebas ${formatRupiah(pool)}`} accent="text-slate-800 dark:text-slate-200" />
        <Card label="Saldo Rekening" value={formatRupiah(primaryBalance)} sub={primary ? primary.name : 'Rekening'} accent={primaryBalance < 0 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'} />
      </section>

      {/* Batas rata-rata pengeluaran dari uang bebas sampai akhir bulan */}
      <section className={`rounded-2xl border p-5 shadow-tactile-sm ${left < 0 ? 'border-rose-500/25 bg-rose-50/70 dark:border-rose-500/30 dark:bg-rose-950/20' : 'border-teal-500/20 bg-teal-50/70 dark:border-teal-500/25 dark:bg-teal-950/20'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${left < 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-300' : 'bg-teal-500/10 text-teal-700 dark:text-teal-300'}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${left < 0 ? 'bg-rose-500' : 'bg-teal-500'}`} />
              Aman Dibelanjakan / Hari
            </div>
            <p className={`mt-2 font-sans text-2xl font-bold tracking-tight ${left < 0 ? 'text-rose-600 dark:text-rose-300' : 'text-slate-900 dark:text-white'}`}>
              {dailySpend.daysRemaining > 0 ? formatRupiah(dailySpend.amount) : '-'}
            </p>
          </div>
          <p className="max-w-sm text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
            {left < 0
              ? `Uang bebas sudah melewati batas sebesar ${formatRupiah(Math.abs(left))}.`
              : dailySpend.daysRemaining > 0
                ? dailySpend.plannedBills > 0
                  ? `Setelah menyisihkan ${formatRupiah(dailySpend.plannedBills)} untuk tagihan Uang Bebas, tersisa ${formatRupiah(dailySpend.discretionaryLeft)} untuk ${dailySpend.daysRemaining} hari.`
                  : `Rata-rata dari sisa ${formatRupiah(left)} untuk ${dailySpend.daysRemaining} hari tersisa, termasuk hari ini.`
                : 'Bulan ini sudah selesai. Buat bulan baru untuk melihat batas harian.'}
          </p>
        </div>
      </section>

      <QuickAdd categories={month.categories || []} onPick={(prefill) => { haptic.tap(); onNewTx(prefill) }} />

      {/* Pocket */}
      <section className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h3 className="font-sans text-lg font-bold text-slate-900 dark:text-white">Pocket</h3>
            {primary && <p className="text-[11px] text-slate-400">sekat virtual dari {primary.name}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                haptic.tap()
                setAddPocketOpen(true)
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white shadow-tactile-sm transition hover:bg-teal-500 active:scale-95 dark:bg-teal-600 dark:hover:bg-teal-500"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Tambah Pocket</span>
            </button>
            <button onClick={onManageCategories} className={btn.subtle}>
              Kelola Pocket
            </button>
            {(month.categories || []).length > 0 && (
              <button onClick={() => setReallocOpen(true)} className={btn.subtle}>
                Re-alokasi
              </button>
            )}
            <button onClick={onManageBudgetTemplates} className={btn.subtle}>
              Template Budget
            </button>
          </div>
        </div>
        {allocated > inflow && (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3.5 py-2.5 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
            Alokasi pocket ({formatRupiah(allocated)}) melebihi pemasukan ({formatRupiah(inflow)}). Kurangi budget atau tambah pemasukan.
          </p>
        )}
        {(month.categories || []).length > 0 && (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {(month.categories || []).map((cat) => (
                <PocketCard
                 key={cat.id}
                 cat={cat}
                 txs={txs}
                 currentMonthId={currentMonthId}
                onClick={() => onNewTx({ categoryId: cat.id })}
                onSave={(c) => setSaveModal({ cat: c, mode: 'nabung' })}
                onUse={(c) => setSaveModal({ cat: c, mode: 'pakai' })}
                onDelete={(c) => setDeleteConfirmCat(c)}
              />
            ))}
          </div>
        )}
        {(month.categories || []).length === 0 && (
          <EmptyState
            title="Belum ada pocket"
            sub="Tambahkan pocket baru untuk membagi alokasi belanja dan tabungan."
            action={
              <button
                onClick={() => {
                  haptic.tap()
                  setAddPocketOpen(true)
                }}
                className={btn.primary}
              >
                + Tambah Pocket
              </button>
            }
          />
        )}
      </section>

      {/* Tagihan bulan ini (template tipe bill) */}
      {upcomingBills.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Tagihan</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {upcomingBills.length} Tagihan
            </span>
          </div>
          <div className="mt-3 space-y-2">
            {upcomingBills.map((b) => {
              const due = Math.min(28, Math.max(1, b.dayOfMonth || 1))
              const billPaid = isRecurringBillPaid(month, b)
              const overdue = !billPaid && month.id === monthIdOf(new Date()) && due < new Date().getDate()
              const cat = (month.categories || []).find((c) => c.id === b.categoryId)
              return (
                <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{b.description || 'Tagihan'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {cat ? cat.name : '-'}
                      {billPaid ? ' • lunas' : overdue ? ' • jatuh tempo' : ` • tgl ${due}`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="font-sans text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(b.amount)}</p>
                    <button
                      onClick={() => onNewTx({ date: `${month.id}-${String(due).padStart(2, '0')}`, categoryId: b.categoryId, description: b.description, amount: b.amount, recurringTemplateId: b.id })}
                      disabled={billPaid}
                      className={(billPaid ? btn.neutral : btn.primary) + ' !px-3 !py-1 !text-xs'}
                    >
                      {billPaid ? 'Lunas' : 'Bayar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Budget perlu dicek */}
      {alerts.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Budget yang perlu dicek</h3>
          <div className="mt-3 space-y-2.5">
            {alerts.map(({ cat, used, budget, pct, status }) => (
              <div key={cat.id} className="rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${status === 'over' ? 'text-rose-500' : 'text-amber-500'}`}>
                    {pct}% kepakai
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatRupiah(used)} / {formatRupiah(budget)}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700">
                  <div className={`h-full rounded-full ${statusStyles(status)} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pemasukan & carry-over */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Pemasukan & Carry-over</h3>
          <button
            onClick={() => {
              setEditingIncome(editingIncome ? null : { id: null })
              setIncomeLabel('')
              setIncomeAmount('')
            }}
            className={btn.ghost}
          >
            {editingIncome && !editingIncome.id ? '✕ Batal' : '+ Tambah'}
          </button>
        </div>

        <div className="mt-3.5 space-y-2.5">
          {(month.transactions || []).filter((t) => t.type === 'income').map((inc) => (
            <div key={inc.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800/80 dark:bg-slate-800/40">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{inc.description}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatRupiah(inc.amount)}</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => editIncome(inc)} className={btn.subtle}>
                  Ubah
                </button>
                <button onClick={() => removeIncome(currentMonthId, inc.id)} className={btn.subtleDanger}>
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-2.5 dark:border-slate-800/80 dark:bg-slate-800/40">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Carry-over (sisa bulan lalu)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">otomatis dari bulan sebelumnya, bisa diubah</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                min="0"
                inputMode="numeric"
                className={input + ' w-32 text-right'}
                value={carryDraft}
                onChange={(e) => setCarryDraft(formatNumberInput(e.target.value))}
                onBlur={commitCarry}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                aria-label="Carry-over"
              />
            </div>
          </div>

          {editingIncome && (
            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-tactile-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex gap-2">
                <input className={input + ' flex-1'} value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)} placeholder="Label (mis. Gaji, Bonus)" />
                <input className={input + ' w-36 text-right'} type="text" inputMode="numeric" value={incomeAmount} onChange={(e) => setIncomeAmount(formatNumberInput(e.target.value))} placeholder="Nominal" />
              </div>
              <div className="mt-2.5 flex justify-end gap-2">
                <button onClick={() => setEditingIncome(null)} className={btn.neutral}>Batal</button>
                <button onClick={saveIncome} className={btn.primary}>
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rekening / Dompet */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">{wallets.length === 1 ? 'Rekening Utama' : 'Dompet'}</h3>
          {wallets.length > 1 && (
            <button onClick={onTransfer} className={btn.subtle}>
              Transfer
            </button>
          )}
        </div>
        {wallets.length === 1 && primary ? (
          <div className="mt-3.5 rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-slate-50 to-white p-5 dark:border-teal-500/20 dark:from-teal-950/30 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-wrap items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: primary.color }} />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{primary.name}</span>
              <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">sekat virtual</span>
            </div>
            <p className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{formatRupiah(primaryBalance)}</p>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Total uang di rekening (gabungan Uang Bebas & seluruh Pocket)</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 shadow-tactile-sm dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Teralokasi</p>
                <p className="mt-0.5 font-sans text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(allocated)}</p>
              </div>
              <div className="rounded-xl border border-slate-200/60 bg-white/80 p-3 shadow-tactile-sm dark:border-slate-700/60 dark:bg-slate-800/60">
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Uang Bebas</p>
                <p className="mt-0.5 font-sans text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(pool)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {wallets.map((w) => (
              <div key={w.id} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800/80 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">{w.name}</span>
                </div>
                <p className="mt-2 font-sans text-base font-bold text-slate-900 dark:text-white">
                  {formatRupiah(walletBalance(w, allTransactions(months)))}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">saldo saat ini</p>
              </div>
            ))}
            {wallets.length === 0 && <p className="col-span-full text-sm text-slate-500 dark:text-slate-400">Belum ada dompet.</p>}
          </div>
        )}
      </section>

      {/* Transaksi berulang */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Transaksi Berulang</h3>
          <button onClick={onManageRecurring} className={btn.subtle}>
            Kelola
          </button>
        </div>
        <div className="mt-3.5 space-y-2.5">
          {templates.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada template. Tambahkan via "Kelola" agar otomatis tercatat tiap bulan.</p>
          )}
          {templates.map((t) => {
            const isIncome = t.type === 'income'
            const isBill = t.type === 'bill'
            const isTransfer = t.type === 'transfer'
            const cat = isIncome ? null : (month.categories || []).find((c) => c.id === t.categoryId)
            const wal = isIncome ? null : wallets.find((w) => w.id === t.walletId)
            const walTo = isTransfer ? wallets.find((w) => w.id === t.toWalletId) : null
            return (
              <div key={t.id} className={`flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3.5 py-2.5 ${t.active !== false ? 'bg-slate-50/70 dark:bg-slate-800/40' : 'bg-slate-50/30 opacity-60 dark:bg-slate-800/20'}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    Hari {Math.min(28, Math.max(1, t.dayOfMonth || 1))}: {t.description || 'Transaksi berulang'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isIncome ? 'Pemasukan' : isBill ? 'Tagihan' : isTransfer ? 'Transfer' : cat ? cat.name : 'Uang Bebas'}
                    {isTransfer ? ` · ${wal?.name || '-'} → ${walTo?.name || '-'}` : wal ? ` · ${wal.name}` : ''}
                  </p>
                </div>
                <p className="shrink-0 font-sans text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(t.amount)}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Alokasi chart */}
      {donutData.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3">
            <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Alokasi Pocket</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Berapa porsi budget yang kamu siapkan untuk tiap kebutuhan?</p>
          </div>
          <DonutChart data={donutData} totalLabel="Teralokasi" />
        </section>
      )}

      {/* Catatan bulanan */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Catatan Bulan Ini</h3>
        <textarea
          className={input + ' mt-2.5 min-h-20 w-full resize-y'}
          placeholder="Tulis catatan keuangan bulan ini…"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={commitNote}
        />
        <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">Tersimpan otomatis saat keluar dari kolom.</p>
      </section>
      <div className="h-4" />
    </div>

    {reallocOpen && <ReallocateForm onClose={() => setReallocOpen(false)} />}

    {saveModal && (
      <SaveGoalModal
        cat={saveModal.cat}
        mode={saveModal.mode}
        available={goalSaved(saveModal.cat, txs).saved}
        onClose={() => setSaveModal(null)}
        onSubmit={(amt, desc) => {
          if (saveModal.mode === 'pakai') useGoal(currentMonthId, saveModal.cat.id, amt, desc || undefined)
          else saveToGoal(currentMonthId, saveModal.cat.id, amt)
        }}
      />
    )}

    {deleteConfirmCat && (
      <Confirm
        title={`Hapus Pocket "${deleteConfirmCat.name}"?`}
        message="Transaksi pada pocket ini akan dialihkan ke Uang Bebas agar catatan keuangan kamu tetap aman."
        confirmText="Hapus Pocket"
        onCancel={() => setDeleteConfirmCat(null)}
        onConfirm={() => {
          removeCategory(currentMonthId, deleteConfirmCat.id)
          haptic.tap()
          setDeleteConfirmCat(null)
        }}
      />
    )}

    {addPocketOpen && (
      <AddPocketModal
        onClose={() => setAddPocketOpen(false)}
        onAdd={(data) => addCategory(currentMonthId, data)}
      />
    )}
  </>
  )
}
