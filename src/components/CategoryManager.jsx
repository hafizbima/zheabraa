import { useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { CATEGORY_COLORS } from '../lib/palette.js'
import { formatRupiah, toInt } from '../lib/money.js'
import { categoryStatus } from '../lib/calc.js'

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
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [confirmId, setConfirmId] = useState(null)

  const txs = month?.transactions || []
  const input =
    'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200'

  const submitNew = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    addCategory(currentMonthId, {
      name: name.trim(),
      budgetAmount: toInt(budget),
      color,
    })
    setName('')
    setBudget('')
  }

  return (
    <Modal
      title="Kelola Kategori / Pocket"
      onClose={onClose}
      wide
      footer={
        <p className="text-xs text-slate-400">
          Kategori berlaku per bulan. Saat mulai bulan baru, kategori disalin dengan budget 0.
        </p>
      }
    >
      <form onSubmit={submitNew} className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
        <h4 className="mb-3 text-sm font-semibold text-slate-700">Tambah kategori</h4>
        <div className="grid gap-2 sm:grid-cols-3">
          <input className={input} placeholder="Nama (mis. Makan)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className={input} type="number" min="0" placeholder="Budget (Rp)" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <div className="mt-3 flex justify-end">
          <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Tambah
          </button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {(month?.categories || []).map((cat) => {
          const { used, budget: b } = categoryStatus(cat, txs)
          return (
            <div key={cat.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <input
                type="color"
                value={cat.color}
                onChange={(e) => updateCategory(currentMonthId, cat.id, { color: e.target.value })}
                className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
                aria-label="Warna"
              />
              <input
                className={input + ' flex-1'}
                value={cat.name}
                onChange={(e) => updateCategory(currentMonthId, cat.id, { name: e.target.value })}
              />
              <div className="w-32 shrink-0">
                <input
                  className={input + ' text-right'}
                  type="number"
                  min="0"
                  value={cat.budgetAmount}
                  onChange={(e) => updateCategory(currentMonthId, cat.id, { budgetAmount: toInt(e.target.value) })}
                  aria-label="Budget"
                />
              </div>
              <div className="w-20 shrink-0 text-right">
                <p className="text-xs text-slate-400">terpakai</p>
                <p className="text-sm font-medium text-slate-700">{formatRupiah(used)}</p>
              </div>
              <button
                onClick={() => setConfirmId(cat.id)}
                className="shrink-0 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          )
        })}
        {(month?.categories || []).length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
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
