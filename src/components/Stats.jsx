import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { labelOf } from '../lib/dates.js'
import {
  totalInflow,
  totalAllocated,
  categoryUsed,
  monthLeftTotal,
  walletBalance,
  allTransactions,
} from '../lib/calc.js'
import DonutChart from './DonutChart.jsx'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

function compactNum(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + ' jt'
  if (v >= 1e3) return 'Rp ' + (v / 1e3).toFixed(0) + ' rb'
  return String(v)
}

export default function Stats() {
  const { months, wallets } = useStore()
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
    const walMap = {}
    const rows = ranged.map((mId) => {
      const m = months[mId]
      const txs = m.transactions || []
      let net = 0
      for (const t of txs) {
        if (t.type === 'transfer') {
          if (t.walletId) {
            walMap[t.walletId] ||= { in: 0, out: 0 }
            walMap[t.walletId].out += t.amount || 0
          }
          if (t.toWalletId) {
            walMap[t.toWalletId] ||= { in: 0, out: 0 }
            walMap[t.toWalletId].in += t.amount || 0
          }
          continue
        }
        if (t.type === 'refund') net -= t.amount || 0
        else net += t.amount || 0
        if (t.walletId) {
          walMap[t.walletId] ||= { in: 0, out: 0 }
          if (t.type === 'refund') walMap[t.walletId].in += t.amount || 0
          else walMap[t.walletId].out += t.amount || 0
        }
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
    const all = allTransactions(months)
    const wals = wallets.map((w) => {
      const f = walMap[w.id] || { in: 0, out: 0 }
      return {
        id: w.id,
        name: w.name,
        color: w.color,
        in: f.in,
        out: f.out,
        net: f.in - f.out,
        balance: walletBalance(w, all),
      }
    })
    return { income, allocated, spent, left, rows, cats, wals }
  }, [ranged, months, wallets])

  const input =
    'rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  return (
    <div className="space-y-5">
      <section className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-carbon dark:text-white">Statistik</h2>
        <select className={input} value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} aria-label="Rentang bulan">
          <option value="3">3 bulan terakhir</option>
          <option value="6">6 bulan terakhir</option>
          <option value="12">12 bulan terakhir</option>
          <option value="all">Semua bulan</option>
        </select>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-carbon bg-mint/40 p-3.5 dark:border-white/30 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Total Pemasukan</p>
          <p className="mt-1 text-base font-bold text-carbon dark:text-white">{formatRupiah(data.income)}</p>
        </div>
        <div className="rounded-2xl border-2 border-carbon bg-lavender/60 p-3.5 dark:border-white/30 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Total Dialokasikan</p>
          <p className="mt-1 text-base font-bold text-violet dark:text-lavender">{formatRupiah(data.allocated)}</p>
        </div>
        <div className="rounded-2xl border-2 border-carbon bg-sky/60 p-3.5 dark:border-white/30 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Total Belanja (net)</p>
          <p className="mt-1 text-base font-bold text-carbon dark:text-white">{formatRupiah(data.spent)}</p>
        </div>
        <div className="rounded-2xl border-2 border-carbon bg-sunburst/40 p-3.5 dark:border-white/30 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-300">Sisa Akhir Bulan</p>
          <p className={`mt-1 text-base font-bold ${data.left < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>
            {formatRupiah(data.left)}
          </p>
        </div>
      </section>

      {data.wals.length > 0 && (
        <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
          <h3 className="font-semibold text-carbon dark:text-white">Per Dompet</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-2 pr-3 font-medium">Dompet</th>
                  <th className="pb-2 pr-3 text-right font-medium">Masuk</th>
                  <th className="pb-2 pr-3 text-right font-medium">Keluar</th>
                  <th className="pb-2 pr-3 text-right font-medium">Net</th>
                  <th className="pb-2 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.wals.map((w) => (
                  <tr key={w.id} className="border-t border-black/20 dark:border-white/20">
                    <td className="py-2.5 pr-3">
                      <span className="flex items-center gap-2 font-medium text-carbon dark:text-white">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: w.color }} />
                        {w.name}
                      </span>
                    </td>
                    <td className="py-2.5 pr-3 text-right text-mint">{formatRupiah(w.in)}</td>
                    <td className="py-2.5 pr-3 text-right text-ember">{formatRupiah(w.out)}</td>
                    <td className={`py-2.5 pr-3 text-right ${w.net < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>
                      {formatRupiah(w.net)}
                    </td>
                    <td className={`py-2.5 text-right font-medium ${w.balance < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>
                      {formatRupiah(w.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Masuk/Keluar dalam rentang terpilih; Saldo = saldo saat ini dari seluruh bulan.
          </p>
        </section>
      )}

      {data.cats.length > 0 && (
        <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
          <h3 className="font-semibold text-carbon dark:text-white">Belanja per Kategori</h3>
          <DonutChart data={data.cats} totalLabel="Total Belanja" />
        </section>
      )}

      {data.rows.length > 1 && (
        <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
          <h3 className="mb-3 font-semibold text-carbon dark:text-white">Tren Bulanan</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.rows} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.15} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} tickFormatter={compactNum} />
              <Tooltip formatter={(v) => formatRupiah(Number(v))} labelStyle={{ color: '#0f172a' }} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="spent" name="Belanja" stroke="#ef4444" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      <section className="rounded-2xl border-2 border-carbon bg-paper p-4 dark:border-white/30 dark:bg-slate-900">
        <h3 className="font-semibold text-carbon dark:text-white">Per Bulan</h3>
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
                <tr key={r.mId} className="border-t border-black/20 dark:border-white/20">
                  <td className="py-2.5 pr-3 font-medium text-carbon dark:text-white">{r.label}</td>
                  <td className="py-2.5 pr-3 text-right text-carbon dark:text-white">{formatRupiah(r.income)}</td>
                  <td className="py-2.5 pr-3 text-right text-violet dark:text-lavender">{formatRupiah(r.allocated)}</td>
                  <td className="py-2.5 pr-3 text-right text-carbon dark:text-white">{formatRupiah(r.spent)}</td>
                  <td className={`py-2.5 text-right ${r.left < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>
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