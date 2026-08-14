import { useEffect, useMemo, useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { CATEGORY_COLORS } from '../lib/palette.js'
import { formatRupiah, toInt } from '../lib/money.js'
import { categoryStatus } from '../lib/calc.js'
import { btn } from '../lib/buttons.js'

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-6 w-6 rounded-full transition ${value === c ? 'ring-2 ring-slate-400 ring-offset-2' : ''}`}
          style={{ backgroundColor: c }}
          aria-label={`Warna ${c}`}
        />
      ))}
    </div>
  )
}

export default function CategoryManager({ onClose }) {
  const { currentMonth: month, currentMonthId, addCategory, updateCategory, removeCategory } = useStore()
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [confirmId, setConfirmId] = useState(null)
  const [drafts, setDrafts] = useState({})
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const cats = month?.categories || []
  const txs = month?.transactions || []
  const input =
    'w-full rounded-xl border-2 border-black/20 bg-paper px-3 py-2 text-sm text-carbon outline-none focus:border-carbon focus:ring-2 focus:ring-black/15 dark:border-white/20 dark:bg-slate-800 dark:text-white'

  useEffect(() => {
    setDrafts((prev) => {
      const next = {}
      for (const cat of cats) {
        next[cat.id] =
          prev[cat.id] ||
          { id: cat.id, name: cat.name, budgetAmount: cat.budgetAmount, color: cat.color, goalAmount: cat.goalAmount || 0 }
      }
      return next
    })
  }, [cats])

  const dirtyCount = useMemo(() => {
    let n = 0
    for (const cat of cats) {
      const d = drafts[cat.id]
      if (
        d &&
        (d.name !== cat.name ||
          d.budgetAmount !== cat.budgetAmount ||
          d.color !== cat.color ||
          (d.goalAmount || 0) !== (cat.goalAmount || 0))
      )
        n += 1
    }
    return n
  }, [cats, drafts])

  const updateDraft = (id, patch) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))
    setJustSaved(false)
  }

  const saveAll = async () => {
    setSaving(true)
    try {
      for (const cat of cats) {
        const d = drafts[cat.id]
        if (d && (d.name !== cat.name || d.budgetAmount !== cat.budgetAmount || d.color !== cat.color || (d.goalAmount || 0) !== (cat.goalAmount || 0))) {
          await updateCategory(currentMonthId, cat.id, {
            name: d.name,
            budgetAmount: d.budgetAmount,
            color: d.color,
            goalAmount: toInt(d.goalAmount),
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
    if (!name.trim()) return
    addCategory(currentMonthId, {
      name: name.trim(),
      budgetAmount: toInt(budget),
      color,
      goalAmount: toInt(goal),
    })
    setName('')
    setBudget('')
    setGoal('')
  }

  return (
    <Modal
      title="Kelola Kategori / Pocket"
      onClose={onClose}
      wide
      footer={
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Perubahan hanya tersimpan saat menekan "Simpan Perubahan".
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
      <form onSubmit={submitNew} className="rounded-2xl border-2 border-carbon bg-lavender/40 p-4 dark:border-white/20 dark:bg-white/5">
        <h4 className="mb-3 text-sm font-semibold text-carbon dark:text-white">Tambah kategori</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Nama</p>
            <input className={input} placeholder="mis. Tabungan Liburan" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Budget / bulan (Rp)</p>
            <input className={input} type="text" min="0" placeholder="Berapa yang dialokasikan tiap bulan" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">Target tabungan (Rp)</p>
            <input className={input} type="text" min="0" placeholder="Jumlah yang ingin dikumpulkan" value={goal} onChange={(e) => setGoal(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <ColorPicker value={color} onChange={setColor} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" className={btn.primary}>
            + Tambah
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {cats.map((cat) => {
          const d = drafts[cat.id] || cat
          const { used } = categoryStatus(cat, txs)
          return (
            <div key={cat.id} className="flex items-end gap-3 rounded-xl border border-carbon bg-paper p-3 dark:border-white/20 dark:bg-slate-900">
              <div className="w-8 shrink-0">
                <p className="mb-1 text-xs text-slate-400">Warna</p>
                <input
                  type="color"
                  value={d.color}
                  onChange={(e) => updateDraft(cat.id, { color: e.target.value })}
                  className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
                  aria-label="Warna"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="mb-1 text-xs text-slate-400">Nama</p>
                <input
                  className={input + ' w-full'}
                  value={d.name}
                  onChange={(e) => updateDraft(cat.id, { name: e.target.value })}
                />
              </div>
              <div className="w-32 shrink-0">
                <p className="mb-1 text-xs text-slate-400">Budget/bulan</p>
                <input
                  className={input + ' text-right'}
                  type="text"
                  inputMode="numeric"
                  value={d.budgetAmount}
                  onChange={(e) => updateDraft(cat.id, { budgetAmount: toInt(e.target.value) })}
                  aria-label="Budget"
                />
              </div>
              <div className="w-32 shrink-0">
                <p className="mb-1 text-xs text-slate-400">Target</p>
                <input
                  className={input + ' text-right'}
                  type="text"
                  inputMode="numeric"
                  value={d.goalAmount || 0}
                  onChange={(e) => updateDraft(cat.id, { goalAmount: toInt(e.target.value) })}
                  aria-label="Target tabungan"
                  placeholder="Target"
                />
              </div>
              <div className="w-24 shrink-0 text-right">
                <p className="mb-1 text-xs text-slate-400">terpakai</p>
                <p className="text-sm font-medium text-carbon dark:text-white">{formatRupiah(used)}</p>
              </div>
              <div className="shrink-0">
                <p className="mb-1 text-xs text-slate-400">&nbsp;</p>
                <button
                  onClick={() => setConfirmId(cat.id)}
                  className={btn.subtleDanger}
                >
                  Hapus
                </button>
              </div>
            </div>
          )
        })}
        {cats.length === 0 && (
          <p className="rounded-2xl border-2 border-dashed border-black/30 p-6 text-center text-sm text-slate-400 dark:border-white/20">
            Belum ada kategori.
          </p>
        )}
      </div>

      {confirmId && (
        <Confirm
          title="Hapus kategori"
          message="Transaksi pada kategori ini akan dipindah ke Uang Bebas. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeCategory(currentMonthId, confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </Modal>
  )
}
