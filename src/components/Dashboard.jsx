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
  allTransactions,
} from '../lib/calc.js'
import DonutChart from './DonutChart.jsx'

function Card({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-bold ${accent || 'text-slate-800'}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>}
    </div>
  )
}

function statusStyles(status) {
  if (status === 'over') return 'bg-red-500'
  if (status === 'warn') return 'bg-amber-400'
  return 'bg-brand-500'
}

export default function Dashboard({ onNewTx, onEditTx, onManageCategories }) {
  const {
    currentMonth: month,
    currentMonthId,
    wallets,
    months,
    addIncome,
    updateIncome,
    removeIncome,
    setCarryOver,
  } = useStore()

  const [editingIncome, setEditingIncome] = useState(null)
  const [incomeLabel, setIncomeLabel] = useState('')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [carryDraft, setCarryDraft] = useState('')

  useEffect(() => {
    setCarryDraft(month ? String(month.carryOver ?? 0) : '')
  }, [month?.carryOver])

  if (!month) return null

  const txs = month.transactions || []
  const inflow = totalInflow(month)
  const allocated = totalAllocated(month)
  const pool = freePool(month)
  const freeSpent = freeMoneySpent(txs)
  const left = freeLeft(month)

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

  const input =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

  return (
    <div className="space-y-5">
      {/* Summary */}
      <section className="grid grid-cols-2 gap-3">
        <Card label="Total Pemasukan" value={formatRupiah(inflow)} />
        <Card label="Teralokasi ke Pocket" value={formatRupiah(allocated)} sub={`uang bebas ${formatRupiah(pool)}`} accent="text-brand-700" />
        <Card label="Uang Bebas (sisa)" value={formatRupiah(pool)} sub="sebelum dipakai" />
        <Card label="Sisa Uang Bebas" value={formatRupiah(left)} sub={`terpakai ${formatRupiah(freeSpent)}`} accent={left < 0 ? 'text-red-600' : 'text-emerald-600'} />
      </section>

      {/* Pemasukan & carry-over */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Pemasukan & Carry-over</h3>
          <button
            onClick={() => {
              setEditingIncome(null)
              setIncomeLabel('')
              setIncomeAmount('')
            }}
            className="rounded-lg border border-brand-200 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
          >
            + Tambah
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {(month.incomes || []).map((inc) => (
            <div key={inc.id} className="flex items-center justify-between rounded-lg bg-brand-50/60 px-3 py-2">
              <div>
                <p className="text-sm font-medium text-slate-700">{inc.label}</p>
                <p className="text-xs text-slate-400">{formatRupiah(inc.amount)}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => editIncome(inc)} className="rounded-md px-2 py-1 text-xs text-brand-600 hover:bg-brand-100">
                  Ubah
                </button>
                <button onClick={() => removeIncome(currentMonthId, inc.id)} className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-50">
                  Hapus
                </button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between rounded-lg bg-amber-50/70 px-3 py-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Carry-over (sisa bulan lalu)</p>
              <p className="text-xs text-slate-400">otomatis dari bulan sebelumnya, bisa diubah</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
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
            <div className="rounded-lg border border-brand-100 bg-white p-3">
              <div className="flex gap-2">
                <input className={input + ' flex-1'} value={incomeLabel} onChange={(e) => setIncomeLabel(e.target.value)} placeholder="Label (mis. Gaji, Bonus)" />
                <input className={input + ' w-36'} type="number" min="0" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} placeholder="Nominal" />
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <button onClick={() => setEditingIncome(null)} className="rounded-lg px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Batal</button>
                <button onClick={saveIncome} className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                  Simpan
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alokasi chart */}
      {donutData.length > 0 && (
        <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800">Alokasi Pocket</h3>
          <DonutChart data={donutData} totalLabel="Teralokasi" />
        </section>
      )}

      {/* Kategori progress */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Pocket</h3>
          <button onClick={onManageCategories} className="text-sm font-medium text-brand-600 hover:underline">
            Kelola Kategori
          </button>
        </div>
        {(month.categories || []).map((cat) => {
          const { used, budget, status, pct } = categoryStatus(cat, txs)
          const left = categoryLeft(cat, txs)
          return (
            <button
              key={cat.id}
              onClick={() => onNewTx({ categoryId: cat.id })}
              className="block w-full rounded-xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-brand-200 hover:shadow"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="truncate font-medium text-slate-800">{cat.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">
                    {formatRupiah(used)}
                    {budget > 0 && <span className="font-normal text-slate-400"> / {formatRupiah(budget)}</span>}
                  </p>
                  <p className={`text-[11px] font-medium ${status === 'over' ? 'text-red-500' : status === 'warn' ? 'text-amber-500' : 'text-slate-400'}`}>
                    sisa {formatRupiah(left)}
                  </p>
                </div>
              </div>
              {budget > 0 && (
                <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${statusStyles(status)} transition-all`} style={{ width: `${pct}%` }} />
                </div>
              )}
            </button>
          )
        })}
        {(month.categories || []).length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Belum ada kategori. Kelola Kategori untuk menambahkan pocket.
          </p>
        )}
      </section>

      {/* Wallet ringkasan */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <h3 className="font-semibold text-slate-800">Dompet</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {wallets.map((w) => (
            <div key={w.id} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: w.color }} />
                <span className="truncate text-sm font-medium text-slate-700">{w.name}</span>
              </div>
              <p className="mt-1.5 text-sm font-semibold text-slate-800">
                {formatRupiah(walletBalance(w, allTransactions(months)))}
              </p>
              <p className="text-[11px] text-slate-400">saldo saat ini</p>
            </div>
          ))}
          {wallets.length === 0 && (
            <p className="col-span-full text-sm text-slate-400">Belum ada dompet.</p>
          )}
        </div>
      </section>

      <div className="h-4" />
    </div>
  )
}
