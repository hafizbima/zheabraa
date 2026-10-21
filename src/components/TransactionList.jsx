import { useEffect, useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { formatDate, labelOf, todayISO } from '../lib/dates.js'
import Confirm from './Confirm.jsx'
import { DateRangePicker } from './ui/DateRangePicker.jsx'
import { btn } from '../lib/buttons.js'

function downloadCSV(filename, rows) {
  const csv = rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function TransactionList({ onEditTx }) {
  const { months, currentMonthId, removeTransaction } = useStore()
  const { wallets } = useStore()

  const monthIds = Object.keys(months).sort().reverse()
  const [viewMonth, setViewMonth] = useState(currentMonthId)
  const [globalSearch, setGlobalSearch] = useState('')
  const month = months[viewMonth] || { id: viewMonth }

  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterWallet, setFilterWallet] = useState('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  useEffect(() => {
    setViewMonth(currentMonthId)
    setFromDate('')
    setToDate('')
  }, [currentMonthId])

  const txs = month.transactions || []
  const categories = month.categories || []

  const catName = (t) =>
    t.type === 'transfer'
      ? 'Transfer Dompet'
      : t.type === 'income'
        ? 'Pemasukan'
        : t.categoryId == null
          ? 'Uang Bebas'
          : categories.find((c) => c.id === t.categoryId)?.name || '-'
  const catColor = (t) =>
    t.type === 'transfer'
      ? '#0ea5e9'
      : t.type === 'income'
        ? '#55db9c'
        : t.categoryId == null
          ? '#64748b'
          : categories.find((c) => c.id === t.categoryId)?.color || '#64748b'
  const walletName = (id) => (id ? wallets.find((w) => w.id === id)?.name || '-' : null)

  const hasFilter =
    filterCategory !== 'all' ||
    filterWallet !== 'all' ||
    !!fromDate ||
    !!toDate ||
    search.trim() !== ''

  const resetFilters = () => {
    setSearch('')
    setFilterCategory('all')
    setFilterWallet('all')
    setFromDate('')
    setToDate('')
  }

  // pencarian lintas bulan: cari di semua bulan jika globalSearch diisi
  const globalResults = useMemo(() => {
    const q = globalSearch.trim().toLowerCase()
    if (!q) return []
    const out = []
    for (const mId of Object.keys(months)) {
      for (const t of months[mId]?.transactions || []) {
        if ((t.description || '').toLowerCase().includes(q)) out.push({ mId, tx: t })
      }
    }
    return out.sort((a, b) => (a.tx.date === b.tx.date ? b.tx.createdAt - a.tx.createdAt : a.tx.date < b.tx.date ? 1 : -1))
  }, [globalSearch, months])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return txs
      .filter((t) => {
        if (filterCategory === 'free') {
          if (t.categoryId != null || t.type === 'transfer' || t.type === 'income') return false
        } else if (filterCategory === 'income') {
          if (t.type !== 'income') return false
        } else if (filterCategory === 'tabungan') {
          if (t.type !== 'expense' || !(t.description || '').startsWith('Menabung ke ')) return false
        } else if (filterCategory !== 'all' && t.categoryId !== filterCategory) {
          return false
        }
        if (
          filterWallet === ''
            ? t.walletId != null
            : filterWallet !== 'all' && t.walletId !== filterWallet && t.toWalletId !== filterWallet
        )
          return false
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
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const group = {}
  for (const t of filtered) {
    ;(group[t.date] = group[t.date] || []).push(t)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-3 flex items-center justify-between gap-2">
          <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lihat bulan</label>
          <select className={input + ' w-52'} value={viewMonth} onChange={(e) => setViewMonth(e.target.value)} aria-label="Bulan transaksi">
            {monthIds.map((m) => (
              <option key={m} value={m}>
                {labelOf(m)}
              </option>
            ))}
          </select>
        </div>
        <input
          className={input + ' mb-3'}
          placeholder="Cari di semua bulan…"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          aria-label="Cari semua bulan"
        />
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <input
            className={input}
            placeholder="Cari keterangan…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className={input} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="all">Semua kategori</option>
            <option value="free">Uang Bebas</option>
            <option value="income">Pemasukan</option>
            <option value="tabungan">Tabungan</option>
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
          <DateRangePicker
            from={fromDate}
            to={toDate}
            onChange={({ from, to }) => {
              setFromDate(from)
              setToDate(to)
            }}
            defaultMonth={viewMonth}
          />
        </div>

        <div className="mt-3.5 flex flex-wrap items-center gap-3 text-xs">
          <span className="rounded-lg bg-rose-50 px-2.5 py-1 text-slate-600 dark:bg-rose-950/30 dark:text-slate-300">
            <span className="font-sans font-bold text-rose-600 dark:text-rose-400">{formatRupiah(spent)}</span> keluar
          </span>
          <span className="rounded-lg bg-teal-50 px-2.5 py-1 text-slate-600 dark:bg-teal-950/30 dark:text-slate-300">
            <span className="font-sans font-bold text-teal-600 dark:text-teal-400">{formatRupiah(refunded)}</span> refund
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <span className="font-sans font-bold text-slate-900 dark:text-white">{filtered.length}</span> transaksi
          </span>
          <button
            onClick={() => {
              const rows = [['Tanggal', 'Tipe', 'Kategori', 'Dompet', 'Keterangan', 'Nominal']]
              for (const t of filtered) {
                rows.push([
                  t.date,
                  t.type === 'transfer' ? 'Transfer' : t.type === 'refund' ? 'Refund' : t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
                  catName(t),
                  t.type === 'transfer'
                    ? `${walletName(t.walletId) || '-'} → ${walletName(t.toWalletId) || '-'}`
                    : walletName(t.walletId) || '-',
                  t.description || '',
                  String(t.amount || 0),
                ])
              }
              downloadCSV(`transaksi-${month?.label || 'bulan'}.csv`, rows)
            }}
            className={btn.ghost}
          >
            Export CSV
          </button>
        </div>
      </section>

      {/* Cari global — hasil dari semua bulan */}
      {globalSearch.trim() && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="font-sans text-base font-bold text-slate-900 dark:text-white">Hasil pencarian "{globalSearch.trim()}"</h3>
          {globalResults.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">Tidak ditemukan.</p>
          ) : (
            <div className="mt-3.5 space-y-2">
              {globalResults.map(({ mId, tx }) => {
                const isTransfer = tx.type === 'transfer'
                return (
                  <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 shadow-tactile-sm dark:border-slate-800/80 dark:bg-slate-800/40">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: catColor(tx) }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-semibold text-slate-900 dark:text-white">{catName(tx)}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(tx.date)} ({labelOf(mId)})
                        {isTransfer
                          ? ` • ${walletName(tx.walletId) || '-'} → ${walletName(tx.toWalletId) || '-'}`
                          : ` • ${tx.description || '-'}${walletName(tx.walletId) ? ` • ${walletName(tx.walletId)}` : ''}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-sans text-sm font-bold ${isTransfer ? 'text-indigo-600 dark:text-indigo-400' : tx.type === 'refund' || tx.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
                        {isTransfer ? '⇄ ' : tx.type === 'refund' || tx.type === 'income' ? '+' : '−'}{formatRupiah(tx.amount)}
                      </p>
                      <div className="mt-1 flex justify-end gap-1">
                        <button onClick={() => onEditTx(mId, tx)} className={btn.subtle}>Ubah</button>
                        <button onClick={() => setConfirmId({ mId, id: tx.id })} className={btn.subtleDanger}>Hapus</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/50 p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {hasFilter ? 'Tidak ada transaksi yang cocok dengan filter.' : 'Belum ada transaksi di bulan ini.'}
          </p>
          {hasFilter && (
            <button
              onClick={resetFilters}
              className={`${btn.ghost} mt-3`}
            >
              Reset filter
            </button>
          )}
        </div>
      ) : (
        Object.entries(group).map(([date, items]) => (
          <section key={date}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {formatDate(date)}
            </p>
            <div className="space-y-2">
              {items.map((t) => {
                const isTransfer = t.type === 'transfer'
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800/80 dark:bg-slate-800/40"
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: catColor(t) }} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-semibold text-slate-900 dark:text-white">{catName(t)}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {isTransfer
                          ? `${walletName(t.walletId) || '-'} → ${walletName(t.toWalletId) || '-'}${t.description ? ` • ${t.description}` : ''}`
                          : `${t.description || '-'}${walletName(t.walletId) ? ` • ${walletName(t.walletId)}` : ''}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-sans text-sm font-bold ${isTransfer ? 'text-indigo-600 dark:text-indigo-400' : t.type === 'refund' || t.type === 'income' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-900 dark:text-white'}`}>
                        {isTransfer ? '⇄ ' : t.type === 'refund' || t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
                      </p>
                      <div className="mt-1 flex justify-end gap-1">
                        <button onClick={() => onEditTx(viewMonth, t)} className={btn.subtle}>
                          Ubah
                        </button>
                        <button onClick={() => setConfirmId({ mId: viewMonth, id: t.id })} className={btn.subtleDanger}>
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
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
            removeTransaction(confirmId.mId, confirmId.id)
            setConfirmId(null)
          }}
        />
      )}
    </div>
  )
}
