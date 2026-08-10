import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { formatDate } from '../lib/dates.js'
import Confirm from './Confirm.jsx'

export default function TransactionList({ onEditTx }) {
  const { currentMonth: month, currentMonthId, removeTransaction } = useStore()

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterWallet, setFilterWallet] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const txs = month?.transactions || []
  const categories = month?.categories || []
  const { wallets } = useStore()

  const catName = (id) => (id == null ? 'Uang Bebas' : categories.find((c) => c.id === id)?.name || '—')
  const catColor = (id) => (id == null ? '#64748b' : categories.find((c) => c.id === id)?.color || '#64748b')
  const walletName = (id) => (id ? wallets.find((w) => w.id === id)?.name || '—' : null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return txs
      .filter((t) => {
        if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false
        if (filterWallet !== 'all' && t.walletId !== filterWallet) return false
        if (fromDate && t.date < fromDate) return false
        if (toDate && t.date > toDate) return false
        if (q && !(t.description || '').toLowerCase().includes(q)) return false
        return true
      })
      .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : a.date < b.date ? 1 : -1))
  }, [txs, filterCategory, filterWallet, fromDate, toDate, search])

  const spent = filtered
    .filter((t) => t.type === 'expense')
    .reduce((a, t) => a + t.amount, 0)
  const refunded = filtered
    .filter((t) => t.type === 'refund')
    .reduce((a, t) => a + t.amount, 0)

  const input =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

  const group = {}
  for (const t of filtered) {
    ;(group[t.date] = group[t.date] || []).push(t)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Cari keterangan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Semua kategori</option>
            <option value="free">Uang Bebas</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className={input} value={filterWallet} onChange={(e) => setFilterWallet(e.target.value)}>
            <option value="all">Semua dompet</option>
            <option value="">Tanpa dompet</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" className={input} value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="Dari tanggal" />
            <input type="date" className={input} value={toDate} onChange={(e) => setToDate(e.target.value)} title="Sampai tanggal" />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="text-slate-500">
            <span className="font-semibold text-red-500">{formatRupiah(spent)}</span> keluar
          </span>
          <span className="text-slate-500">
            <span className="font-semibold text-emerald-600">{formatRupiah(refunded)}</span> refund
          </span>
          <span className="text-slate-500">
            <span className="font-semibold text-slate-800">{filtered.length}</span> transaksi
          </span>
        </div>
      </section>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Tidak ada transaksi.
        </p>
      ) : (
        Object.entries(group).map(([date, items]) => (
          <section key={date}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {items.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: catColor(t.categoryId) }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{catName(t.categoryId)}</p>
                    <p className="truncate text-xs text-slate-400">
                      {t.description || '—'}
                      {walletName(t.walletId) && ` • ${walletName(t.walletId)}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${t.type === 'refund' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {t.type === 'refund' ? '+' : '−'}{formatRupiah(t.amount)}
                    </p>
                    <div className="mt-0.5 flex justify-end gap-1">
                      <button onClick={() => onEditTx(currentMonthId, t)} className="text-xs text-brand-600 hover:underline">
                        Ubah
                      </button>
                      <button onClick={() => setConfirmId(t.id)} className="text-xs text-red-500 hover:underline">
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}

      {confirmId && (
        <Confirm
          title="Hapus transaksi"
          message="Transaksi ini akan dihapus permanen. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeTransaction(currentMonthId, confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </div>
  )
}
