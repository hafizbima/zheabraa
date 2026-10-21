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
  singleWalletBalance,
  allTransactions,
} from '../lib/calc.js'
import DonutChart from './DonutChart.jsx'
import { btn } from '../lib/buttons.js'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

function compactNum(v) {
  if (v >= 1e6) return (v / 1e6).toFixed(1).replace(/\.0$/, '') + ' jt'
  if (v >= 1e3) return 'Rp ' + (v / 1e3).toFixed(0) + ' rb'
  return String(v)
}

function weekStartISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const dow = dt.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  dt.setDate(dt.getDate() + diff)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
}
function fmtDayMonth(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function Stats() {
  const { months, wallets } = useStore()
  const [rangeKey, setRangeKey] = useState('3')
  const [gran, setGran] = useState('bulanan')

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
    const isSingle = wallets.length === 1
    const primaryId = wallets[0]?.id
    const rows = ranged.map((mId) => {
      const m = months[mId]
      const txs = m.transactions || []
      let net = 0
      for (const t of txs) {
        if (t.type === 'transfer') {
          const from = t.walletId ?? (isSingle ? primaryId : null)
          const to = t.toWalletId ?? (isSingle ? primaryId : null)
          if (from) {
            walMap[from] ||= { in: 0, out: 0 }
            walMap[from].out += t.amount || 0
          }
          if (to) {
            walMap[to] ||= { in: 0, out: 0 }
            walMap[to].in += t.amount || 0
          }
          continue
        }
        if (t.type === 'income') continue // income bukan belanja
        if (t.type === 'refund') net -= t.amount || 0
        else net += t.amount || 0
        const wid = t.walletId ?? (isSingle ? primaryId : null)
        if (wid) {
          walMap[wid] ||= { in: 0, out: 0 }
          if (t.type === 'refund' || t.type === 'income') walMap[wid].in += t.amount || 0
          else walMap[wid].out += t.amount || 0
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
      const bal = wallets.length === 1 ? singleWalletBalance(w, months) : walletBalance(w, all)
      return {
        id: w.id,
        name: w.name,
        color: w.color,
        in: f.in,
        out: f.out,
        net: f.in - f.out,
        balance: bal,
      }
    })
    return { income, allocated, spent, left, rows, cats, wals }
  }, [ranged, months, wallets])

  // ponytail: hanya hari/minggu yang ada transaksi yang muncul (sparse), isi 0 untuk hari kosong kalau butuh garis kontinu
  const trend = useMemo(() => {
    if (gran === 'bulanan') return { key: 'bulanan', rows: data.rows }
    const bucket = {}
    for (const mId of ranged) {
      for (const t of months[mId]?.transactions || []) {
        if (t.type === 'transfer') continue
        if (!t.date) continue
        const k = gran === 'harian' ? t.date : weekStartISO(t.date)
        bucket[k] ||= 0
        bucket[k] += t.type === 'refund' ? -(t.amount || 0) : t.amount || 0
      }
    }
    const keys = Object.keys(bucket).sort()
    const rows = keys.map((k) => {
      if (gran === 'harian') return { label: fmtDayMonth(k), date: k, spent: bucket[k] }
      const [y, mo, d] = k.split('-').map(Number)
      const end = new Date(y, mo - 1, d + 6)
      const endISO = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(end.getDate()).padStart(2, '0')}`
      return { label: `${fmtDayMonth(k)}–${fmtDayMonth(endISO)}`, date: k, spent: bucket[k] }
    })
    return { key: gran, rows }
  }, [gran, ranged, months, data.rows])

  const input =
    'rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  // perbandingan bulan terakhir vs bulan sebelumnya (butuh minimal 2 bulan)
  const compare = (() => {
    const rows = data.rows
    if (rows.length < 2) return null
    const cur = rows[rows.length - 1]
    const prev = rows[rows.length - 2]
    return {
      label: cur.label,
      prevLabel: prev.label,
      items: [
        { label: 'Pemasukan', cur: cur.income, prev: prev.income },
        { label: 'Belanja', cur: cur.spent, prev: prev.spent },
        { label: 'Sisa', cur: cur.left, prev: prev.left },
      ],
    }
  })()

  const granBtn = (key, label) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${gran === key ? 'bg-slate-900 text-white shadow-tactile-sm dark:bg-teal-500 dark:text-slate-950' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'}`

  return (
    <div className="space-y-5">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-sans text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Statistik</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className={btn.ghost} aria-label="Cetak laporan">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V3h12v6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" rx="1" />
              </svg>
              Cetak
            </button>
            <select className={input} value={rangeKey} onChange={(e) => setRangeKey(e.target.value)} aria-label="Rentang bulan">
            <option value="3">3 bulan terakhir</option>
            <option value="6">6 bulan terakhir</option>
            <option value="12">12 bulan terakhir</option>
            <option value="all">Semua bulan</option>
          </select>
        </div>
        </div>
        <div className="flex gap-2">
          <button className={granBtn('harian', 'Harian')} onClick={() => setGran('harian')}>Harian</button>
          <button className={granBtn('mingguan', 'Mingguan')} onClick={() => setGran('mingguan')}>Mingguan</button>
          <button className={granBtn('bulanan', 'Bulanan')} onClick={() => setGran('bulanan')}>Bulanan</button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3.5">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Pemasukan</p>
          <p className="mt-1 font-sans text-lg font-bold text-teal-600 dark:text-teal-400">{formatRupiah(data.income)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Dialokasikan</p>
          <p className="mt-1 font-sans text-lg font-bold text-slate-900 dark:text-white">{formatRupiah(data.allocated)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Belanja (net)</p>
          <p className="mt-1 font-sans text-lg font-bold text-rose-600 dark:text-rose-400">{formatRupiah(data.spent)}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800 dark:bg-slate-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sisa Akhir Bulan</p>
          <p className={`mt-1 font-sans text-lg font-bold ${data.left < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {formatRupiah(data.left)}
          </p>
        </div>
      </section>

      {/* Perbandingan bulan terakhir vs sebelumnya */}
      {compare && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Perbandingan Bulan</h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{compare.label} vs {compare.prevLabel}</p>
          <div className="mt-3.5 grid grid-cols-2 gap-3">
            {compare.items.map((it) => {
              const diff = it.cur - it.prev
              const up = diff > 0
              return (
                <div key={it.label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{it.label}</span>
                    {diff !== 0 && (
                      <span className={`text-[10px] font-semibold ${up ? 'text-rose-500' : 'text-teal-600'}`}>
                        {up ? '▲' : '▼'} {formatRupiah(Math.abs(diff))}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-sans text-sm font-bold text-slate-900 dark:text-white">{formatRupiah(it.cur)}</p>
                  <p className="text-[10px] text-slate-400">bulan lalu: {formatRupiah(it.prev)}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {data.wals.length > 0 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Per Dompet</h3>
          <div className="mt-3.5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5 pr-3 font-semibold">Dompet</th>
                  <th className="pb-2.5 pr-3 text-right font-semibold">Masuk</th>
                  <th className="pb-2.5 pr-3 text-right font-semibold">Keluar</th>
                  <th className="pb-2.5 pr-3 text-right font-semibold">Net</th>
                  <th className="pb-2.5 text-right font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {data.wals.map((w) => (
                  <tr key={w.id} className="border-t border-slate-100 dark:border-slate-800/80">
                    <td className="py-3 pr-3">
                      <span className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: w.color }} />
                        {w.name}
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right font-sans font-medium text-teal-600 dark:text-teal-400">{formatRupiah(w.in)}</td>
                    <td className="py-3 pr-3 text-right font-sans font-medium text-rose-500">{formatRupiah(w.out)}</td>
                    <td className={`py-3 pr-3 text-right font-sans font-medium ${w.net < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                      {formatRupiah(w.net)}
                    </td>
                    <td className={`py-3 text-right font-sans font-bold ${w.balance < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
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
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3">
            <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Belanja per Kategori</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Ke mana saja pengeluaranmu dialokasikan selama periode ini?</p>
          </div>
          <DonutChart data={data.cats} totalLabel="Total Belanja" />
        </section>
      )}

      {trend.rows.length > 1 && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3">
            <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">
              {gran === 'harian' ? 'Tren Harian' : gran === 'mingguan' ? 'Tren Mingguan' : 'Tren Bulanan'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Bagaimana pola arus kas pemasukan versus pengeluaran seiring waktu?</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trend.rows} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.08} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} width={56} tickFormatter={compactNum} />
              <Tooltip formatter={(v) => formatRupiah(Number(v))} labelStyle={{ color: '#0f172a' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }} />
              {gran === 'bulanan' && <Line type="monotone" dataKey="income" name="Pemasukan" stroke="#0d9488" strokeWidth={2.5} dot={false} />}
              <Line type="monotone" dataKey="spent" name="Belanja" stroke="#f43f5e" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            {gran === 'bulanan' && (
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
                Pemasukan
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              Belanja
            </span>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Per Bulan</h3>
        <div className="mt-3.5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-2.5 pr-3 font-semibold">Bulan</th>
                <th className="pb-2.5 pr-3 text-right font-semibold">Pemasukan</th>
                <th className="pb-2.5 pr-3 text-right font-semibold">Alokasi</th>
                <th className="pb-2.5 pr-3 text-right font-semibold">Belanja</th>
                <th className="pb-2.5 text-right font-semibold">Sisa</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.mId} className="border-t border-slate-100 dark:border-slate-800/80">
                  <td className="py-3 pr-3 font-medium text-slate-900 dark:text-white">{r.label}</td>
                  <td className="py-3 pr-3 text-right font-sans text-slate-900 dark:text-white">{formatRupiah(r.income)}</td>
                  <td className="py-3 pr-3 text-right font-sans text-teal-600 dark:text-teal-400">{formatRupiah(r.allocated)}</td>
                  <td className="py-3 pr-3 text-right font-sans text-slate-900 dark:text-white">{formatRupiah(r.spent)}</td>
                  <td className={`py-3 text-right font-sans font-bold ${r.left < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
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