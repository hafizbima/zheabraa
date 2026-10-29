import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah, toInt, formatNumberInput } from '../lib/money.js'
import { btn } from '../lib/buttons.js'
import EmptyState from './EmptyState.jsx'

const TYPES = [
  { key: 'expense', label: 'Pengeluaran', activeCls: 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300' },
  { key: 'income', label: 'Pemasukan', activeCls: 'border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300' },
  { key: 'bill', label: 'Tagihan', activeCls: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
  { key: 'transfer', label: 'Transfer', activeCls: 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' },
]
const typeMeta = (k) => TYPES.find((t) => t.key === k) || TYPES[0]

export default function RecurringManager({ onClose }) {
  const { templates, currentMonth: month, currentMonthId, wallets, addTemplate, updateTemplate, removeTemplate } = useStore()
  const [day, setDay] = useState('1')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [categoryId, setCategoryId] = useState('free')
  const [walletId, setWalletId] = useState('')
  const [toWalletId, setToWalletId] = useState('')
  const [description, setDescription] = useState('')
  const [confirmId, setConfirmId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  const handleClose = () => {
    if (dirtyCount > 0) setShowDiscardConfirm(true)
    else onClose()
  }

  const cats = month?.categories || []
  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const catName = (id) => (id ? cats.find((c) => c.id === id)?.name : null)
  const walletName = (id) => (id ? wallets.find((w) => w.id === id)?.name : '-')

  useEffect(() => {
    setDrafts((prev) => {
      const next = {}
      for (const t of templates) {
        next[t.id] = prev[t.id] || { ...t, amount: t.amount ? formatNumberInput(t.amount) : '' }
      }
      return next
    })
  }, [templates])

  const isDirty = (t, d) =>
    d &&
    (d.dayOfMonth !== t.dayOfMonth ||
      d.type !== t.type ||
      toInt(d.amount) !== t.amount ||
      d.categoryId !== t.categoryId ||
      d.walletId !== t.walletId ||
      d.toWalletId !== t.toWalletId ||
      d.description !== t.description ||
      d.active !== t.active ||
      (d.skipMonths || []).join() !== (t.skipMonths || []).join())

  const dirtyCount = useMemo(() => templates.filter((t) => isDirty(t, drafts[t.id])).length, [templates, drafts])

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    setJustSaved(false)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const t of templates) {
        const d = drafts[t.id]
        if (isDirty(t, d)) {
          await updateTemplate(t.id, {
            dayOfMonth: d.dayOfMonth,
            type: d.type,
            amount: toInt(d.amount),
            categoryId: d.categoryId,
            walletId: d.walletId,
            toWalletId: d.toWalletId,
            description: d.description,
            active: d.active,
            skipMonths: d.skipMonths || [],
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
    const isOut = type === 'expense' || type === 'bill'
    addTemplate({
      dayOfMonth: toInt(day) || 1,
      type,
      amount: amt,
      categoryId: isOut ? (categoryId === 'free' ? null : categoryId) : null,
      walletId: type === 'income' ? null : walletId || null,
      toWalletId: type === 'transfer' ? toWalletId || null : null,
      description: description.trim(),
      active: true,
    })
    setDay('1')
    setAmount('')
    setType('expense')
    setCategoryId('free')
    setWalletId('')
    setToWalletId('')
    setDescription('')
  }

  return (
    <Modal
      title="Transaksi Berulang"
      onClose={handleClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">Template dipakai otomatis tiap bulan pada tanggal yang ditentukan.</p>
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
      <form onSubmit={submitNew} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4.5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="mb-3 font-sans text-sm font-bold text-slate-900 dark:text-white">Tambah template</h4>
        <div className="grid gap-2.5 sm:grid-cols-4">
          <input className={input} type="text" inputMode="numeric" placeholder="Tanggal" value={day} onChange={(e) => setDay(e.target.value)} aria-label="Tanggal" />
          <input className={input} type="text" inputMode="numeric" placeholder="Nominal (Rp)" value={amount} onChange={(e) => setAmount(formatNumberInput(e.target.value))} aria-label="Nominal" />
          <input className={input + ' sm:col-span-2'} placeholder="Keterangan (mis. Bayar Kos)" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setType(t.key)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                type === t.key ? t.activeCls : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {type === 'expense' || type === 'bill' ? (
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <select className={input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="free">Uang Bebas</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
              <option value="">Dompet: tidak dilacak</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        ) : type === 'transfer' ? (
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <select className={input} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
              <option value="">Dompet asal</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
            <select className={input} value={toWalletId} onChange={(e) => setToWalletId(e.target.value)}>
              <option value="">Dompet tujuan</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <p className="mt-2.5 rounded-xl border border-teal-200/80 bg-teal-50/60 px-3.5 py-2 text-xs text-teal-800 dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-200">
            Pemasukan otomatis ditambahkan ke daftar Pemasukan di Dashboard tiap bulan.
          </p>
        )}
        <div className="mt-3.5 flex justify-end">
          <button type="submit" disabled={toInt(amount) <= 0} className={btn.primary}>
            + Tambah Template
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2.5">
        {templates.length === 0 && (
          <EmptyState title="Belum ada template" sub="Tambah template untuk pengeluaran, pemasukan, tagihan, atau transfer berulang." />
        )}
        {templates.map((t) => {
          const d = drafts[t.id] || t
          const dt = typeMeta(d.type || 'expense')
          const isOut = (d.type || 'expense') === 'expense' || d.type === 'bill'
          return (
            <div key={t.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 bg-white p-3.5 shadow-tactile-sm transition hover:shadow-tactile dark:border-slate-800/80 dark:bg-slate-800/40">
              <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={d.active !== false}
                  onChange={(e) => updateDraft(t.id, { active: e.target.checked })}
                  className="h-4 w-4 rounded accent-teal-600"
                  aria-label="Aktif"
                />
                Aktif
              </label>
              <button
                type="button"
                onClick={() => {
                  const arr = [...(d.skipMonths || [])]
                  const i = arr.indexOf(currentMonthId)
                  if (i >= 0) arr.splice(i, 1)
                  else arr.push(currentMonthId)
                  updateDraft(t.id, { skipMonths: arr })
                }}
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition ${
                  (d.skipMonths || []).includes(currentMonthId)
                    ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
                title="Lewati template ini pada bulan berjalan"
              >
                Skip bulan ini
              </button>
              <input
                className={input + ' w-16'}
                type="text"
                inputMode="numeric"
                value={d.dayOfMonth}
                onChange={(e) => updateDraft(t.id, { dayOfMonth: toInt(e.target.value) || 1 })}
                aria-label="Tanggal"
              />
              <input
                className={input + ' w-32'}
                type="text"
                inputMode="numeric"
                value={d.amount ?? ''}
                onChange={(e) => updateDraft(t.id, { amount: formatNumberInput(e.target.value) })}
                aria-label="Nominal"
              />
              <input
                className={input + ' min-w-32 flex-1'}
                value={d.description}
                onChange={(e) => updateDraft(t.id, { description: e.target.value })}
                placeholder="Keterangan"
              />
              <div className="flex overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                {TYPES.map((tk) => (
                  <button
                    key={tk.key}
                    type="button"
                    onClick={() => updateDraft(t.id, { type: tk.key })}
                    className={`px-2.5 py-1.5 text-xs font-semibold ${
                      (d.type || 'expense') === tk.key ? tk.activeCls : 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {tk.label}
                  </button>
                ))}
              </div>
              {isOut && (
                <>
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
                    <option value="">Dompet: otomatis</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {d.type === 'transfer' && (
                <>
                  <select className={input + ' w-36'} value={d.walletId || ''} onChange={(e) => updateDraft(t.id, { walletId: e.target.value || null })}>
                    <option value="">Dari: pilih</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                  <select className={input + ' w-36'} value={d.toWalletId || ''} onChange={(e) => updateDraft(t.id, { toWalletId: e.target.value || null })}>
                    <option value="">Ke: pilih</option>
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <button onClick={() => setConfirmId(t.id)} className={btn.subtleDanger + ' shrink-0'}>
                Hapus
              </button>
            </div>
          )
        })}
      </div>

      {showDiscardConfirm && (
        <Confirm
          title="Perubahan Belum Disimpan"
          message={`Ada ${dirtyCount} perubahan template yang belum disimpan. Yakin ingin membuang perubahan dan menutup?`}
          confirmText="Buang Perubahan"
          danger={true}
          onCancel={() => setShowDiscardConfirm(false)}
          onConfirm={() => {
            setShowDiscardConfirm(false)
            onClose()
          }}
        />
      )}

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