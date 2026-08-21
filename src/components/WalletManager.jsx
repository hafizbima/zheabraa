import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { WALLET_COLORS } from '../lib/palette.js'
import { formatRupiah, toInt } from '../lib/money.js'
import { walletBalance, allTransactions } from '../lib/calc.js'
import { btn } from '../lib/buttons.js'

export default function WalletManager({ onClose }) {
  const { wallets, months, addWallet, updateWallet, deleteWallet } = useStore()
  const [name, setName] = useState('')
  const [balance, setBalance] = useState('')
  const [color, setColor] = useState(WALLET_COLORS[0])
  const [confirmId, setConfirmId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [orderIds, setOrderIds] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [overId, setOverId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const allTx = allTransactions(months)
  const input =
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  useEffect(() => {
    setDrafts((prev) => {
      const next = {}
      for (const w of wallets) {
        next[w.id] = prev[w.id] || { id: w.id, name: w.name, color: w.color, openingBalance: w.openingBalance }
      }
      return next
    })
  }, [wallets])

  useEffect(() => {
    setOrderIds((prev) => {
      const ids = wallets.map((w) => w.id)
      if (!prev) return ids
      const next = prev.filter((id) => ids.includes(id))
      for (const id of ids) if (!next.includes(id)) next.push(id)
      return next
    })
  }, [wallets])

  const baseOrder = wallets.map((w) => w.id)
  const orderDirty = !!orderIds && orderIds.join() !== baseOrder.join()
  const list = (orderIds || baseOrder)
    .map((id) => wallets.find((w) => w.id === id))
    .filter(Boolean)

  const dirtyCount = useMemo(() => {
    let n = 0
    for (const w of wallets) {
      const d = drafts[w.id]
      if (d && (d.name !== w.name || d.color !== w.color || d.openingBalance !== w.openingBalance)) n += 1
    }
    return n + (orderDirty ? 1 : 0)
  }, [wallets, drafts, orderDirty])

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    setJustSaved(false)
  }

  const move = (targetId) => {
    if (!dragId || dragId === targetId) return
    setOrderIds((prev) => {
      const arr = (prev || baseOrder).filter((id) => id !== dragId)
      arr.splice(arr.indexOf(targetId), 0, dragId)
      return arr
    })
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const w of wallets) {
        const d = drafts[w.id]
        if (d && (d.name !== w.name || d.color !== w.color || d.openingBalance !== w.openingBalance)) {
          await updateWallet(w.id, { name: d.name, color: d.color, openingBalance: d.openingBalance })
        }
      }
      if (orderDirty) {
        for (const w of wallets) {
          const newIdx = orderIds.indexOf(w.id)
          if (newIdx !== baseOrder.indexOf(w.id)) {
            await updateWallet(w.id, { order: newIdx })
          }
        }
      }
      setJustSaved(true)
    } finally {
      setSaving(false)
    }
  }

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
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Saldo = saldo awal + refund − pengeluaran. Perubahan tersimpan saat menekan "Simpan Perubahan". Seret ⋮⋮ untuk mengurutkan.
          </p>
          <button
            onClick={saveAll}
            disabled={saving || dirtyCount === 0}
            className={btn.primary}
          >
            {saving ? 'Menyimpan…' : dirtyCount > 0 ? `Simpan Perubahan (${dirtyCount})` : justSaved ? 'Tersimpan' : 'Simpan Perubahan'}
          </button>
        </div>
      }
    >
      <form onSubmit={submitNew} className="rounded-2xl border-2 border-carbon bg-sky/50 p-4 dark:border-white/20 dark:bg-white/5">
        <h4 className="mb-3 text-sm font-semibold text-carbon dark:text-white">Tambah dompet</h4>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={input} placeholder="Nama (mis. GoPay)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className={input} type="text" inputMode="numeric" placeholder="Saldo awal (Rp)" value={balance} onChange={(e) => setBalance(e.target.value)} />
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
          <button type="submit" className={btn.primary}>
            + Tambah
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {list.map((w) => {
          const d = drafts[w.id] || w
          const bal = walletBalance({ ...w, openingBalance: d.openingBalance }, allTx)
          const dirty = d.name !== w.name || d.color !== w.color || d.openingBalance !== w.openingBalance
          return (
            <div
              key={w.id}
              onDragOver={(e) => { e.preventDefault(); setOverId(w.id) }}
              onDragLeave={() => setOverId(null)}
              onDrop={() => { setOverId(null); move(w.id) }}
              className={`flex items-center gap-3 rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900 ${overId === w.id ? 'ring-2 ring-violet' : ''}`}
            >
              <span
                draggable
                onDragStart={(e) => { setDragId(w.id); e.dataTransfer.effectAllowed = 'move' }}
                onDragEnd={() => setDragId(null)}
                className="shrink-0 cursor-grab select-none text-lg leading-none text-slate-400 hover:text-carbon dark:hover:text-white"
                title="Seret untuk mengurutkan"
                aria-label="Seret untuk mengurutkan"
              >
                ⋮⋮
              </span>
              <input
                type="color"
                value={d.color}
                onChange={(e) => updateDraft(w.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Warna"
              />
              <input
                className={input + ' flex-1'}
                value={d.name}
                onChange={(e) => updateDraft(w.id, { name: e.target.value })}
              />
              <div className="w-32 shrink-0">
                <input
                  className={input + ' text-right'}
                  type="text"
                  inputMode="numeric"
                  value={d.openingBalance}
                  onChange={(e) => updateDraft(w.id, { openingBalance: toInt(e.target.value) })}
                  aria-label="Saldo awal"
                  title="Saldo awal"
                />
              </div>
              <div className="w-28 shrink-0 text-right">
                <p className="text-xs text-slate-400">saldo saat ini</p>
                <p className={`text-sm font-semibold ${bal < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>{formatRupiah(bal)}</p>
              </div>
              <button
                onClick={() => setConfirmId(w.id)}
                className={btn.subtleDanger + ' shrink-0'}
              >
                Hapus
              </button>
              {dirty && (
                <span className="shrink-0 rounded-full border border-carbon bg-sunburst/50 px-2 py-0.5 text-[10px] font-semibold text-carbon dark:border-white/20 dark:text-white">
                  belum disimpan
                </span>
              )}
            </div>
          )
        })}
        {wallets.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-black/30 p-6 text-center text-sm text-slate-400 dark:border-white/20">
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
