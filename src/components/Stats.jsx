import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { labelOf } from '../lib/dates.js'
import {
  totalInflow,
  totalAllocated,
  categoryUsed,
  monthLeftTotal,
} from '../lib/calc.js'
import DonutChart from './DonutChart.jsx'

export default function Stats() {
  const { months } = useStore()
  const [rangeKey, setRangeKey] = useState('3')

  const ids = useMemo(() => Object.keys(months).sort(), [months])

  const ranged = useMemo(() => {
    if (rangeKey === 'all') return ids
    const n = Number(rangeKey)
    return ids.slice(-n)
  }, [ids, rangeKey])

  const data = useMemo(() => {
    let income = 0
    let allocated = 0
    let spent = 0
    let left = 0
    const catMap = {}
    const rows = ranged.map((mId) => {
      const m = months[mId]
      const txs = m.transactions || []
      let net = 0
      for (const t of txs) {
        if (t.type === 'transfer') continue
        if (t.type === 'refund') net -= t.amount || 0
        else net += t.amount || 0
      }
      const inc = totalInflow(m)
      const aloc = totalAllocated(m)
      income += inc
      allocated += aloc
      spent += net
      left += monthLeftTotal(m)
      for (const cat of m.categories || []) {
        const used = categoryUsed(cat.id, txs)
        if (used <= 0) continue
        if (!catMap[cat.id]) catMap[cat.id] = { name: cat.name, color: cat.color, value: 0 }
        catMap[cat.id].value += used
      }
      return {
        mId,
        label: labelOf(mId),
        income: inc,
        allocated: aloc,
        spent: net,
        left: monthLeftTotal(m),
      }
    })
    const cats = Object.values(catMap).sort((a, b) => b.value - a.value)
    return { income, allocated, spent, left, rows, cats }
  }, [ranged, months])

  const input =
    'rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-brand-500/30'

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Statistik</h2>
        <select className={input} value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} aria-label="Rentang bulan">
          <option value="3">3 bulan terakhir</option>
          <option value="6">6 bulan terakhir</option>
          <option value="12">12 bulan terakhir</option>
          <option value="all">Semua bulan</option>
        </select>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Pemasukan</p>
          <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100">{formatRupiah(data.income)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Dialokasikan</p>
          <p className="mt-1 text-base font-bold text-brand-700">{formatRupiah(data.allocated)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Total Belanja (net)</p>
          <p className="mt-1 text-base font-bold text-slate-800 dark:text-slate-100">{formatRupiah(data.spent)}</p>
        </div>
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-sm">
          <p className="text-xs font-medium text-slate-400">Sisa Akhir Bulan</p>
          <p className={`mt-1 text-base font-bold ${data.left < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatRupiah(data.left)}
          </p>
        </div>
      </section>

      {data.cats.length > 0 && (
        <section className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">Belanja per Kategori</h3>
          <DonutChart data={data.cats} totalLabel="Total Belanja" />
        </section>
      )}

      <section className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Per Bulan</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 pr-3 font-medium">Bulan</th>
                <th className="pb-2 pr-3 text-right font-medium">Pemasukan</th>
                <th className="pb-2 pr-3 text-right font-medium">Alokasi</th>
                <th className="pb-2 pr-3 text-right font-medium">Belanja</th>
                <th className="pb-2 text-right font-medium">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.mId} className="border-t border-slate-100 dark:border-slate-800">
                  <td className="py-2.5 pr-3 font-medium text-slate-700 dark:text-slate-200">{r.label}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-700 dark:text-slate-200">{formatRupiah(r.income)}</td>
                  <td className="py-2.5 pr-3 text-right text-brand-700">{formatRupiah(r.allocated)}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-700 dark:text-slate-200">{formatRupiah(r.spent)}</td>
                  <td className={`py-2.5 text-right ${r.left < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {formatRupiah(r.left)}
                  </td>
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-400">
                    Belum ada data bulan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Sisa = sisa kategori + uang bebas (dihitung seperti carry-over bulan berikutnya).
        </p>
      </section>

      <div className="h-4" />
    </div>
  )
}