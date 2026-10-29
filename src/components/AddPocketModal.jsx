import { useState } from 'react'
import Modal from './Modal.jsx'
import { CATEGORY_COLORS } from '../lib/palette.js'
import { toInt } from '../lib/money.js'
import { btn } from '../lib/buttons.js'
import { haptic } from '../lib/haptics.js'

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-7 w-7 rounded-full transition-transform active:scale-95 ${value === c ? 'ring-2 ring-slate-700 ring-offset-2 dark:ring-white dark:ring-offset-slate-900' : 'hover:scale-105'}`}
          style={{ backgroundColor: c }}
          aria-label={`Pilih warna ${c}`}
        />
      ))}
    </div>
  )
}

export default function AddPocketModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [submitting, setSubmitting] = useState(false)

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onAdd({
        name: name.trim(),
        budgetAmount: toInt(budget),
        color,
        goalAmount: toInt(goal),
        goalDeadline: deadline || null,
      })
      haptic.success()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal title="Tambah Pocket Baru" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nama Pocket <span className="text-rose-500">*</span>
          </label>
          <input
            autoFocus
            className={inputClass}
            placeholder="mis. Belanja Bulanan, Hiburan, Tabungan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Alokasi Budget / Bulan (Rp)
          </label>
          <input
            className={inputClass}
            type="text"
            inputMode="numeric"
            placeholder="Nominal alokasi bulanan (opsional)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Tabungan (Rp)
            </label>
            <input
              className={inputClass}
              type="text"
              inputMode="numeric"
              placeholder="Target tabungan (opsional)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Tercapai Pada
            </label>
            <input
              className={inputClass}
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Warna Pocket
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>

        <div className="mt-6 flex justify-end gap-2.5 pt-2">
          <button type="button" onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button type="submit" disabled={!name.trim() || submitting} className={btn.primary}>
            {submitting ? 'Menyimpan…' : '+ Simpan Pocket'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

