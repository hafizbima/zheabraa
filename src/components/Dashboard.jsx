import { useState, useEffect } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { formatDate, todayISO } from '../lib/dates.js'
import {
  totalInflow,
  totalAllocated,
  freeLeft,
  freeMoneySpent,
  freePool,
  categoryStatus,
  categoryLeft,
  walletBalance,
  walletBalanceSingle,
  allTransactions,
} from '../lib/calc.js'
import DonutChart from './DonutChart.jsx'
import ReallocateForm from './ReallocateForm.jsx'
import { btn } from '../lib/buttons.js'

function Card({ label, value, sub, accent, tint }) {
  return (
    <div
      className={`rounded-2xl border-2 border-carbon p-3.5 dark:border-white/30 ${
        tint || 'bg-paper dark:bg-slate-900'
      }`}
    >
      <p className="text-xs font-medium text-slate-500 dark:text-slate-300">{label}</p>
      <p className={`mt-1 text-base font-bold ${accent || 'text-carbon dark:text-white'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-300">{sub}</p>}
    </div>
  )
}

function statusStyles(status) {
  if (status === 'over') return 'bg-ember'
  if (status === 'warn') return 'bg-sunburst'
  return 'bg-violet'
}

export default function Dashboard({ onNewTx, onEditTx, onManageCategories, onManageRecurring, onTransfer }) {
  const {
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
  } = useStore()

  const [editingIncome, setEditingIncome] = useState(null)
  const [reallocOpen, setReallocOpen] = useState(false)
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [carryDraft, setCarryDraft] = useState('')
  const [noteDraft, setNoteDraft] = useState('')

  useEffect(() => {
    setCarryDraft(month ? String(month.carryOver ?? 0) : '')
  }, [month?.carryOver])

  useEffect(() => {
    setNoteDraft(month ? String(month.note ?? '') : '')
  }, [month?.note])

  if (!month) return null

  const txs = month.transactions || []
  const inflow = totalInflow(month)
  const allocated = totalAllocated(month)
  const pool = freePool(month)
  const freeSpent = freeMoneySpent(txs)
  const left = freeLeft(month)
  const primary = wallets[0] || null
  const primaryBalance = primary
    ? wallets.length === 1
      ? walletBalanceSingle(primary, allTransactions(months))
      : walletBalance(primary, allTransactions(months))
    : 0

  // ponytail: threshold 70% + top 3 hardcoded, bikin configurable kalau user minta
  const alerts = (month.categories || [])
    .map((cat) => ({ cat, ...categoryStatus(cat, txs) }))
    .filter((a) => a.budget > 0 && a.pct >= 70)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  const donutData = (month.categories || [])
    .filter((c) => c.budgetAmount > 0)
    .map((c) => ({ name: c.name, value: c.budgetAmount, color: c.color }))

  const saveIncome = () => {
    const amount = Math.round(Number(incomeAmount) || 0)
    if (editingIncome) {
      updateIncome(currentMonthId, editingIncome.id, { label: incomeLabel || 'Pemasukan', amount })
    } else {
      addIncome(currentMonthId, { label: incomeLabel || 'Pemasukan', amount })
    }
    setEditingIncome(null)
    setIncomeLabel('')
    setIncomeAmount('')
  }

  const editIncome = (inc) => {
    setEditingIncome(inc)
    setIncomeLabel(inc.label)
    setIncomeAmount(String(inc.amount || ''))
  }

  const commitCarry = () => {
    setCarryOver(currentMonthId, Math.round(Number(carryDraft) || 0))
  }

  const commitNote = () => {
    setMonthNote(currentMonthId, noteDraft.trim())
  }

  const goalSavedFor = (catId) => {
    if (!catId) return 0
    let total = 0
    for (const mId of Object.keys(months)) {
      const c = (months[mId]?.categories || []).find((x) => x.id === catId)
      if (c) total += c.budgetAmount || 0
    }
    return total
  }

const input =
    'rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  return (
    <>
      <div className="space-y-5">
      {/* Summary */}
      <section className="grid grid-cols-2 gap-3">
        <Card label="Total Pemasukan" value={formatRupiah(inflow)} tint="bg-mint/40 dark:bg-mint/10" />
        <Card label="Teralokasi ke Pocket" value={formatRupiah(allocated)} sub={`uang bebas ${formatRupiah(pool)}`} accent="text-violet dark:text-lavender" tint="bg-lavender/60 dark:bg-lavender/10" />
        <Card label="Uang Bebas (sisa)" value={formatRupiah(pool)} sub="sebelum dipakai" tint="bg-sky/60 dark:bg-sky/10" />
        <Card label="Sisa Uang Bebas" value={formatRupiah(left)} sub={`terpakai ${formatRupiah(freeSpent)}`} accent={left < 0 ? 'text-ember' : 'text-carbon dark:text-white'} tint="bg-[#B8B8FF] dark:bg-white/5" />
      </section>

      {/* Budget perlu dicek — mirip Buatin.mba overview */}
      {alerts.length > 0 && (
        <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
          <h3 className="font-semibold text-carbon dark:text-white">Budget yang perlu dicek</h3>
          <div className="mt-3 space-y-2">
            {alerts.map(({ cat, used, budget, pct, status }) => (
              <div key={cat.id} className="rounded-xl border border-carbon bg-paper px-3 py-2.5 dark:border-white/20 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm font-medium text-carbon dark:text-white">{cat.name}</span>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold ${status === 'over' ? 'text-ember' : 'text-brand-600'}`}>
                    {pct}% kepakai
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {formatRupiah(used)} / {formatRupiah(budget)}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10">
                  <div className={`h-full rounded-full ${statusStyles(status)} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pemasukan & carry-over */}
      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-carbon dark:text-white">Pemasukan & Carry-over</h3>
          <button
            onClick={() => {
              setEditingIncome(null)
              setIncomeLabel('')
              setIncomeAmount('')
            }}
            className={btn.ghost}
          >
            + Tambah
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {(month.incomes || []).map((inc) => (
            <div key={inc.id} className="flex items-center justify-between rounded-xl border border-carbon bg-lavender/50 px-3 py-2 dark:border-white/20 dark:bg-white/5">
              <div>
                <p className="text-sm font-medium text-carbon dark:text-white">{inc.label}</p>
                <p className="text-xs text-slate-400">{formatRupiah(inc.amount)}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editIncome(inc)} className={btn.subtle}>
                  Ubah
                </button>
                <button onClick={() => removeIncome(currentMonthId, inc.id)} className={btn.subtleDanger}>
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-xl border border-carbon bg-sunburst/30 px-3 py-2 dark:border-white/20 dark:bg-white/5">
            <div>
              <p className="text-sm font-medium text-carbon dark:text-white">Carry-over (sisa bulan lalu)</p>
              <p className="text-xs text-slate-400">otomatis dari bulan sebelumnya, bisa diubah</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                // type="number"
                min="0"
                inputMode="numeric"
                className={input + ' w-32 text-right'}
                value={carryDraft}
                onChange={(e) => setCarryDraft(e.target.value)}
                onBlur={commitCarry}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                aria-label="Carry-over"
              />
            </div>
          </div>

          {editingIncome && (
            <div className="rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900">
              <div className="flex gap-2">
                <input className={input + ' flex-1'} value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)} placeholder="Label (mis. Gaji, Bonus)" />
                <input className={input + ' w-36'} type="text" inputMode="numeric" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="Nominal" />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setEditingIncome(null)} className={btn.neutral}>Batal</button>
                <button onClick={saveIncome} className={btn.primary}>
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catatan bulanan */}
      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <h3 className="font-semibold text-carbon dark:text-white">Catatan Bulan Ini</h3>
        <textarea
          className={input + ' mt-2 min-h-20 w-full resize-y'}
          placeholder="Tulis catatan keuangan bulan ini…"
          value={noteDraft}
          onChange={(e) => setNoteDraft(e.target.value)}
          onBlur={commitNote}
        />
        <p className="mt-1 text-[11px] text-slate-400">Tersimpan otomatis saat keluar dari kolom.</p>
      </section>

      {/* Alokasi chart */}
      {donutData.length > 0 && (
        <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
          <h3 className="font-semibold text-carbon dark:text-white">Alokasi Pocket</h3>
          <DonutChart data={donutData} totalLabel="Teralokasi" />
        </section>
      )}

      {/* Kategori progress — sekat virtual dari 1 rekening */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-carbon dark:text-white">Pocket</h3>
            {primary && <p className="text-[11px] text-slate-400">sekat virtual dari {primary.name}</p>}
          </div>
          <div className="flex gap-3">
            {(month.categories || []).length > 0 && (
            <button onClick={() => setReallocOpen(true)} className={btn.subtle}>
              Re-alokasi
            </button>
          )}
            <button onClick={onManageRecurring} className={btn.subtle}>
              Transaksi Berulang
            </button>
            <button onClick={onManageCategories} className={btn.subtle}>
              Kelola Kategori
            </button>
          </div>
        </div>
        {allocated > inflow && (
          <p className="rounded-xl border border-sunburst bg-sunburst/30 px-3 py-2 text-xs text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white">
            Alokasi pocket ({formatRupiah(allocated)}) melebihi pemasukan ({formatRupiah(inflow)}). Kurangi budget atau tambah pemasukan. — ponytail: warning saja, enforce kalau diminta
          </p>
        )}
        {(month.categories || []).map((cat) => {
          const { used, budget, status, pct } = categoryStatus(cat, txs)
          const left = categoryLeft(cat, txs)
          const goal = cat.goalAmount > 0 ? cat.goalAmount : 0
          const goalSaved = goalSavedFor(cat.id)
          const goalPct = goal ? Math.max(0, Math.min(100, Math.round((goalSaved / goal) * 100))) : 0
          const goalDone = goal > 0 && goalSaved >= goal
          return (
            <button
              key={cat.id}
              onClick={() => onNewTx({ categoryId: cat.id })}
              className="block w-full rounded-2xl border-2 border-carbon bg-paper p-4 text-left transition-colors hover:bg-mist dark:border-white/30 dark:bg-slate-900 dark:hover:bg-slate-800"
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
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Terkumpul {formatRupiah(goalSaved)}</span>
                    <span>{goalPct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full border border-black/20 bg-black/5 dark:border-white/20 dark:bg-white/10">
                    <div className={`h-full rounded-full ${goalDone ? 'bg-mint' : 'bg-violet'} transition-all`} style={{ width: `${goalPct}%` }} />
                  </div>
                </div>
              )}
            </button>
          )
        })}
        {(month.categories || []).length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-black/30 bg-paper p-6 text-center text-sm text-slate-400 dark:border-white/20 dark:bg-slate-900">
            Belum ada kategori. Kelola Kategori untuk menambahkan pocket.
          </p>
        )}
      </section>

      {/* Transaksi berulang */}
      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-carbon dark:text-white">Transaksi Berulang</h3>
            <button onClick={onManageRecurring} className={btn.subtle}>
              Kelola
            </button>
        </div>
        <div className="mt-3 space-y-2">
          {templates.length === 0 && (
            <p className="text-sm text-slate-400">Belum ada template. Tambahkan via "Kelola" agar otomatis tercatat tiap bulan.</p>
          )}
          {templates.map((t) => {
            const isIncome = t.type === 'income'
            const cat = isIncome ? null : (month.categories || []).find((c) => c.id === t.categoryId)
            const wal = isIncome ? null : wallets.find((w) => w.id === t.walletId)
            return (
              <div key={t.id} className={`flex items-center justify-between gap-3 rounded-xl border border-carbon px-3 py-2 ${t.active !== false ? 'bg-mint/40 dark:bg-white/5' : 'bg-mist opacity-60 dark:bg-slate-800'}`}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-carbon dark:text-white">
                    Hari {Math.min(28, Math.max(1, t.dayOfMonth || 1))} — {t.description || 'Transaksi berulang'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {isIncome ? 'Pemasukan' : cat ? cat.name : 'Uang Bebas'}
                    {wal ? ` · ${wal.name}` : ''}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-carbon dark:text-white">{formatRupiah(t.amount)}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Rekening / Dompet — 1 rekening = single card, >1 fallback ke grid lama */}
      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-carbon dark:text-white">{wallets.length === 1 ? 'Rekening Utama' : 'Dompet'}</h3>
          {wallets.length > 1 && (
            <button onClick={onTransfer} className={btn.subtle}>
              Transfer
            </button>
          )}
        </div>
        {wallets.length === 1 && primary ? (
          <div className="mt-3 rounded-xl border border-carbon bg-sky/30 p-4 dark:border-white/20 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: primary.color }} />
              <span className="text-sm font-medium text-carbon dark:text-white">{primary.name}</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-carbon">sekat virtual</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-carbon dark:text-white">{formatRupiah(primaryBalance)}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">saldo saat ini — pocket adalah sekat virtual dari rekening ini</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-white/70 px-2 py-1.5 dark:bg-white/10">
                <p className="text-slate-500 dark:text-slate-400">Teralokasi</p>
                <p className="font-semibold text-carbon dark:text-white">{formatRupiah(allocated)}</p>
              </div>
              <div className="rounded-lg bg-white/70 px-2 py-1.5 dark:bg-white/10">
                <p className="text-slate-500 dark:text-slate-400">Uang Bebas</p>
                <p className="font-semibold text-carbon dark:text-white">{formatRupiah(pool)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {wallets.map((w) => (
              <div key={w.id} className="rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="truncate text-sm font-medium text-carbon dark:text-white">{w.name}</span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-carbon dark:text-white">
                  {formatRupiah(walletBalance(w, allTransactions(months)))}
                </p>
                <p className="text-[11px] text-slate-400">saldo saat ini</p>
              </div>
            ))}
            {wallets.length === 0 && <p className="col-span-full text-sm text-slate-400">Belum ada dompet.</p>}
          </div>
        )}
      </section>

      <div className="h-4" />
    </div>

    {reallocOpen && <ReallocateForm onClose={() => setReallocOpen(false)} />}
  </>
  )
}
