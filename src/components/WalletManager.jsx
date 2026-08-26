import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { WALLET_COLORS } from '../lib/palette.js'
import { formatRupiah, toInt } from '../lib/money.js'
import { walletBalance, singleWalletBalance, allTransactions } from '../lib/calc.js'
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
  const [adjustId, setAdjustId] = useState(null)
  const [adjustInput, setAdjustInput] = useState('')

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

  // fallback drag untuk layar sentuh
  const moveBy = (id, dir) => {
    setOrderIds((prev) => {
      const arr = [...(prev || baseOrder)]
      const i = arr.indexOf(id)
      const j = i + dir
      if (i < 0 || j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
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

  const isSingle = wallets.length === 1

  return (
    <Modal
      title={isSingle ? 'Rekening Utama' : 'Kelola Dompet'}
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {isSingle
              ? 'Pocket adalah sekat virtual dari 1 rekening — saldo pocket dihitung dari transaksi, bukan rekening terpisah.'
              : 'Saldo = saldo awal + refund − pengeluaran. Perubahan tersimpan saat menekan "Simpan Perubahan". Seret ⋮⋮ untuk mengurutkan.'}
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
      {isSingle ? (
        <div className="rounded-2xl border-2 border-carbon bg-sky/50 p-4 dark:border-white/20 dark:bg-white/5">
          <p className="text-sm text-carbon dark:text-white">
            Kamu pakai <strong>1 Rekening Utama</strong> — pocket di bawah adalah sekat virtual. Tambah dompet hanya jika butuh rekening fisik terpisah (mis. Cash/E-Wallet).
          </p>
        </div>
      ) : (
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
      )}

      <div className="mt-4 space-y-2">
        {list.map((w) => {
          const d = drafts[w.id] || w
          const bal =
            wallets.length === 1
              ? singleWalletBalance({ ...w, openingBalance: d.openingBalance }, months)
              : walletBalance({ ...w, openingBalance: d.openingBalance }, allTx)
          const dirty = d.name !== w.name || d.color !== w.color || d.openingBalance !== w.openingBalance
          return (
            <div
              key={w.id}
              onDragOver={(e) => { e.preventDefault(); setOverId(w.id) }}
              onDragLeave={() => setOverId(null)}
              onDrop={() => { setOverId(null); move(w.id) }}
              className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-carbon bg-paper p-3 transition-shadow hover:shadow-carbon-sm dark:border-white/20 dark:bg-slate-900 ${overId === w.id ? 'ring-2 ring-violet' : ''}`}
            >
              <div className="flex shrink-0 flex-col items-center justify-center">
                <span
                  draggable
                  onDragStart={(e) => { setDragId(w.id); e.dataTransfer.effectAllowed = 'move' }}
                  onDragEnd={() => setDragId(null)}
                  className="cursor-grab select-none text-lg leading-none text-slate-400 hover:text-carbon dark:hover:text-white"
                  title="Seret untuk mengurutkan (atau pakai tombol ↑↓)"
                  aria-label="Seret untuk mengurutkan"
                >
                  ⋮⋮
                </span>
                <span className="mt-0.5 flex gap-0.5">
                  <button type="button" onClick={() => moveBy(w.id, -1)} aria-label="Naikkan urutan" className="px-0.5 text-xs text-slate-400 hover:text-carbon dark:hover:text-white">▲</button>
                  <button type="button" onClick={() => moveBy(w.id, 1)} aria-label="Turunkan urutan" className="px-0.5 text-xs text-slate-400 hover:text-carbon dark:hover:text-white">▼</button>
                </span>
              </div>
              <input
                type="color"
                value={d.color}
                onChange={(e) => updateDraft(w.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Warna"
              />
              <input
                className={input + ' min-w-36 flex-1 basis-40'}
                value={d.name}
                onChange={(e) => updateDraft(w.id, { name: e.target.value })}
              />
              <div className="w-28 shrink-0 sm:w-32">
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
              <div className="ml-auto w-32 shrink-0 text-right sm:ml-0 sm:w-28">
                <p className="text-xs text-slate-400">saldo saat ini</p>
                <p className={`text-sm font-semibold ${bal < 0 ? 'text-ember' : 'text-carbon dark:text-white'}`}>{formatRupiah(bal)}</p>
                <button
                  onClick={() => {
                    setAdjustId(w.id)
                    setAdjustInput(String(bal))
                  }}
                  className="mt-1 text-[11px] font-medium text-violet underline underline-offset-2 hover:text-violet/80 dark:text-lavender"
                >
                  Sesuaikan
                </button>
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

      {adjustId &&
        (() => {
          const w = wallets.find((x) => x.id === adjustId)
          if (!w) return null
          const d = drafts[w.id] || w
          const bal =
            wallets.length === 1
              ? singleWalletBalance({ ...w, openingBalance: d.openingBalance }, months)
              : walletBalance({ ...w, openingBalance: d.openingBalance }, allTx)
          const target = toInt(adjustInput)
          const delta = target - bal
          const hasDelta = adjustInput.trim() !== '' && delta !== 0
          return (
            <Modal
              title={`Sesuaikan Saldo — ${w.name}`}
              onClose={() => setAdjustId(null)}
              footer={
                <div className="flex justify-end gap-2">
                  <button onClick={() => setAdjustId(null)} className={btn.neutral}>
                    Batal
                  </button>
                  <button
                    disabled={!hasDelta}
                    onClick={() => {
                      const newOpening = (d.openingBalance || 0) + delta
                      updateDraft(w.id, { openingBalance: newOpening })
                      setAdjustId(null)
                    }}
                    className={btn.primary}
                  >
                    Sesuaikan
                  </button>
                </div>
              }
            >
              <div className="space-y-3">
                <div className="rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Tercatat</p>
                  <p className="text-base font-semibold text-carbon dark:text-white">{formatRupiah(bal)}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Bank sebenarnya (Rp)</label>
                  <input
                    className={input}
                    type="text"
                    inputMode="numeric"
                    value={adjustInput}
                    onChange={(e) => setAdjustInput(e.target.value)}
                    placeholder="mis. 1250000"
                    autoFocus
                  />
                  {adjustInput.trim() !== '' && (
                    <p className="mt-1 text-xs text-slate-400">{formatRupiah(target)}</p>
                  )}
                </div>
                {hasDelta && (
                  <div className={`rounded-xl border px-3 py-2 text-sm ${delta > 0 ? 'border-mint bg-mint/20 text-carbon dark:border-white/20 dark:bg-white/5 dark:text-white' : 'border-ember/30 bg-ember/10 text-ember'}`}>
                    Selisih: <strong>{delta > 0 ? '+' : ''}{formatRupiah(delta)}</strong> {delta > 0 ? 'akan ditambahkan ke openingBalance' : 'akan dikurangi dari openingBalance'}
                  </div>
                )}
                {!hasDelta && adjustInput.trim() !== '' && (
                  <p className="text-xs text-slate-400">Tidak ada perubahan.</p>
                )}
                <p className="text-xs text-slate-400">Hanya openingBalance yang diubah, tidak ada transaksi baru. Pocket & carry-over tidak berubah. Tekan Simpan Perubahan di belakang untuk menyimpan permanen.</p>
              </div>
            </Modal>
          )
        })()}
    </Modal>
  )
}
