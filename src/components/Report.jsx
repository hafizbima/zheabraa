import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { labelOf } from '../lib/dates.js'
import {
  totalInflow,
  totalAllocated,
  freeLeft,
  freePool,
  categoryStatus,
  categoryLeft,
  goalSaved,
  walletBalance,
  singleWalletBalance,
  allTransactions,
} from '../lib/calc.js'

export default function Report() {
  const { currentMonth: month, months, wallets } = useStore()
  if (!month) return null
  const txs = (month.transactions || [])
    .filter((t) => t.type !== 'transfer')
    .sort((a, b) => (a.date < b.date ? 1 : -1))
  const inflow = totalInflow(month)
  const allocated = totalAllocated(month)
  const pool = freePool(month)
  const left = freeLeft(month)
  const spent = txs.filter((t) => t.type === 'expense').reduce((a, t) => a + (t.amount || 0), 0)
  const refunded = txs.filter((t) => t.type === 'refund').reduce((a, t) => a + (t.amount || 0), 0)
  const saved = (month.categories || [])
    .filter((c) => c.goalAmount > 0)
    .reduce((a, c) => a + goalSaved(c, txs).saved, 0)
  const totalWallet = wallets.reduce(
    (a, w) => a + (wallets.length === 1 ? singleWalletBalance(w, months) : walletBalance(w, allTransactions(months))),
    0,
  )

  return (
    <div className="space-y-5 print-full">
      <header>
        <h2 className="font-display text-lg font-bold text-carbon dark:text-white">Laporan {labelOf(month.id)}</h2>
        <p className="text-xs text-slate-400">Dibuat {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Pemasukan</p>
          <p className="text-base font-bold text-carbon dark:text-white">{formatRupiah(inflow)}</p>
        </div>
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Teralokasi</p>
          <p className="text-base font-bold text-carbon dark:text-white">{formatRupiah(allocated)}</p>
        </div>
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Uang Bebas</p>
          <p className="text-base font-bold text-carbon dark:text-white">{formatRupiah(pool)}</p>
        </div>
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Belanja</p>
          <p className="text-base font-bold text-ember">{formatRupiah(spent)}</p>
        </div>
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Refund</p>
          <p className="text-base font-bold text-mint">{formatRupiah(refunded)}</p>
        </div>
        <div className="rounded-xl border border-black/15 p-3 dark:border-white/20">
          <p className="text-[11px] uppercase text-slate-500 dark:text-slate-400">Tabungan</p>
          <p className="text-base font-bold text-violet dark:text-lavender">{formatRupiah(saved)}</p>
        </div>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-carbon dark:text-white">Ringkasan Pocket</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/20 text-left text-xs uppercase text-slate-400 dark:border-white/20">
              <th className="py-2">Pocket</th>
              <th className="py-2 text-right">Budget</th>
              <th className="py-2 text-right">Terpakai</th>
              <th className="py-2 text-right">Sisa</th>
              <th className="py-2 text-right">Tabungan</th>
            </tr>
          </thead>
          <tbody>
            {(month.categories || []).map((c) => {
              const { used, budget } = categoryStatus(c, txs)
              const gs = goalSaved(c, txs)
              return (
                <tr key={c.id} className="border-b border-black/10 dark:border-white/10">
                  <td className="py-2">{c.name}</td>
                  <td className="py-2 text-right">{formatRupiah(budget)}</td>
                  <td className="py-2 text-right">{formatRupiah(used)}</td>
                  <td className="py-2 text-right">{formatRupiah(categoryLeft(c, txs))}</td>
                  <td className="py-2 text-right">{c.goalAmount > 0 ? `${formatRupiah(gs.saved)} / ${formatRupiah(c.goalAmount)}` : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="mb-2 font-semibold text-carbon dark:text-white">Transaksi ({txs.length})</h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black/20 text-left text-slate-400 dark:border-white/20">
              <th className="py-1.5">Tanggal</th>
              <th className="py-1.5">Keterangan</th>
              <th className="py-1.5 text-right">Nominal</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((t) => (
              <tr key={t.id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1.5">{t.date}</td>
                <td className="py-1.5">{t.description || '—'}</td>
                <td className={`py-1.5 text-right ${t.type === 'refund' || t.type === 'income' ? 'text-mint' : 'text-ember'}`}>
                  {t.type === 'refund' || t.type === 'income' ? '+' : '−'}{formatRupiah(t.amount)}
                </td>
              </tr>
            ))}
            {txs.length === 0 && (
              <tr><td colSpan="3" className="py-3 text-center text-slate-400">Belum ada transaksi.</td></tr>
            )}
          </tbody>
        </table>
      </section>

      <p className="text-[10px] text-slate-400">
        Sisa uang bebas: {formatRupiah(left)}. Total saldo dompet: {formatRupiah(totalWallet)}.
      </p>
    </div>
  )
}
