import { useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { WALLET_COLORS } from '../lib/palette.js'
import { formatRupiah, toInt } from '../lib/money.js'
import { walletBalance, allTransactions } from '../lib/calc.js'

export default function WalletManager({ onClose }) {
  const { wallets, months, addWallet, updateWallet, deleteWallet } = useStore()
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(WALLET_COLORS[0])
  const [confirmId, setConfirmId] = useState(null)

  const allTx = allTransactions(months)
  const input =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

  const submitNew = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addWallet({ name: name.trim(), color, openingBalance: toInt(balance) })
    setName('')
    setBalance('')
  }

  return (
    <Modal
      title="Kelola Dompet"
      onClose={onClose}
      wide
      footer={
        <p className="text-xs text-slate-400">
          Saldo = saldo awal + refund − pengeluaran pada transaksi yang memakai dompet ini.
        </p>
      }
    >
      <form onSubmit={submitNew} className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Tambah dompet</h4>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={input} placeholder="Nama (mis. GoPay)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className={input} type="number" min="0" placeholder="Saldo awal (Rp)" value={balance} onChange={(e) => setBalance(e.target.value)} />
          <div className="flex flex-wrap items-center gap-1.5">
            {WALLET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full ${color === c ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
                style={{ backgroundColor: c }}
                aria-label={`Warna ${c}`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Tambah
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {wallets.map((w) => {
          const bal = walletBalance(w, allTx)
          return (
            <div key={w.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <input
                type="color"
                value={w.color}
                onChange={(e) => updateWallet(w.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Warna"
              />
              <input
                className={input + ' flex-1'}
                value={w.name}
                onChange={(e) => updateWallet(w.id, { name: e.target.value })}
              />
              <div className="w-32 shrink-0">
                <input
                  className={input + ' text-right'}
                  type="number"
                  min="0"
                  value={w.openingBalance}
                  onChange={(e) => updateWallet(w.id, { openingBalance: toInt(e.target.value) })}
                  aria-label="Saldo awal"
                  title="Saldo awal"
                />
              </div>
              <div className="w-28 shrink-0 text-right">
                <p className="text-xs text-slate-400">saldo saat ini</p>
                <p className={`text-sm font-semibold ${bal < 0 ? 'text-red-500' : 'text-slate-800'}`}>{formatRupiah(bal)}</p>
              </div>
              <button
                onClick={() => setConfirmId(w.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          )
        })}
        {wallets.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
            Belum ada dompet.
          </p>
        )}
      </div>

      {confirmId && (
        <Confirm
          title="Hapus dompet"
          message="Transaksi yang memakai dompet ini akan dipindah ke 'tidak dilacak'. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            deleteWallet(confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </Modal>
  )
}
