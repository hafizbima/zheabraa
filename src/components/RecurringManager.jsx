import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt } from '../lib/money.js'
import { btn } from '../lib/buttons.js'

export default function RecurringManager({ onClose }) {
  const { templates, currentMonth: month, wallets, addTemplate, updateTemplate, removeTemplate } = useStore()
  const [day, setDay] = useState('1')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('free')
  const [walletId, setWalletId] = useState('')
  const [description, setDescription] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const cats = month?.categories || []
  const input =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-brand-500/30'

  const catName = (id) => (id ? cats.find((c) => c.id === id)?.name : null)
  const walletName = (id) => (id ? wallets.find((w) => w.id === id)?.name : '—')

  useEffect(() => {
    setDrafts((prev) => {
      const next = {}
      for (const t of templates) {
        next[t.id] = prev[t.id] || { ...t }
      }
      return next
    })
  }, [templates])

  const dirtyCount = useMemo(() => {
    let n = 0
    for (const t of templates) {
      const d = drafts[t.id]
      if (
        d &&
        (d.dayOfMonth !== t.dayOfMonth ||
          d.amount !== t.amount ||
          d.categoryId !== t.categoryId ||
          d.walletId !== t.walletId ||
          d.description !== t.description ||
          d.active !== t.active)
      )
        n += 1
    }
    return n
  }, [templates, drafts])

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    setJustSaved(false)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const t of templates) {
        const d = drafts[t.id]
        if (
          d &&
          (d.dayOfMonth !== t.dayOfMonth ||
            d.amount !== t.amount ||
            d.categoryId !== t.categoryId ||
            d.walletId !== t.walletId ||
            d.description !== t.description ||
            d.active !== t.active)
        ) {
          await updateTemplate(t.id, {
            dayOfMonth: d.dayOfMonth,
            amount: d.amount,
            categoryId: d.categoryId,
            walletId: d.walletId,
            description: d.description,
            active: d.active,
          })
        }
      }
      setJustSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const submitNew = (e) => {
    e.preventDefault()
    const amt = toInt(amount)
    if (amt <= 0) return
    addTemplate({
      dayOfMonth: toInt(day) || 1,
      amount: amt,
      categoryId: categoryId === 'free' ? null : categoryId,
      walletId: walletId || null,
      description: description.trim(),
      active: true,
    })
    setDay('1')
    setAmount('')
    setCategoryId('free')
    setWalletId('')
    setDescription('')
  }

  return (
    <Modal
      title="Transaksi Berulang"
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Transaksi dipakai otomatis tiap bulan pada tanggal yang ditentukan.</p>
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
      <form onSubmit={submitNew} className="rounded-xl border border-brand-100 bg-brand-50/40 p-4 dark:border-brand-500/30 dark:bg-brand-500/10">
        <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">Tambah template</h4>
        <div className="grid gap-2 sm:grid-cols-4">
          <input className={input} type="number" min="1" max="28" placeholder="Tanggal" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Tanggal" />
          <input className={input} type="number" min="0" placeholder="Nominal (Rp)" value={amount} onChange={(e) => setAmount(e.target.value)} aria-label="Nominal" />
          <input className={input + ' sm:col-span-2'} placeholder="Keterangan (mis. Bayar Kos)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="free">Uang Bebas</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
            <option value="">Dompet — tidak dilacak</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" disabled={toInt(amount) <= 0} className={btn.primary}>
            + Tambah Template
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {templates.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-sm text-slate-400">
            Belum ada template transaksi berulang.
          </p>
        )}
        {templates.map((t) => {
          const d = drafts[t.id] || t
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 dark:border-slate-800 p-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={d.active !== false}
                  onChange={(e) => updateDraft(t.id, { active: e.target.checked })}
                  className="h-4 w-4 accent-brand-600"
                  aria-label="Aktif"
                />
                Aktif
              </label>
              <input
                className={input + ' w-16'}
                type="number"
                min="1"
                max="28"
                value={d.dayOfMonth}
                onChange={(e) => updateDraft(t.id, { dayOfMonth: toInt(e.target.value) || 1 })}
                aria-label="Tanggal"
              />
              <input
                className={input + ' w-32'}
                type="number"
                min="0"
                value={d.amount}
                onChange={(e) => updateDraft(t.id, { amount: toInt(e.target.value) })}
                aria-label="Nominal"
              />
              <input
                className={input + ' flex-1 min-w-32'}
                value={d.description}
                onChange={(e) => updateDraft(t.id, { description: e.target.value })}
                placeholder="Keterangan"
              />
              <select
                className={input + ' w-36'}
                value={d.categoryId || 'free'}
                onChange={(e) => updateDraft(t.id, { categoryId: e.target.value === 'free' ? null : e.target.value })}
              >
                <option value="free">Uang Bebas</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select className={input + ' w-36'} value={d.walletId || ''} onChange={(e) => updateDraft(t.id, { walletId: e.target.value || null })}>
                <option value="">Dompet —</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setConfirmId(t.id)}
                className={btn.subtleDanger + ' shrink-0'}
              >
                Hapus
              </button>
            </div>
          )
        })}
      </div>

      {confirmId && (
        <Confirm
          title="Hapus template"
          message="Template ini akan dihapus. Transaksi berulang yang sudah dibuat tidak ikut terhapus. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeTemplate(confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </Modal>
  )
}