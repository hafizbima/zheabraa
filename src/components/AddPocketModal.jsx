import { useState } from 'react'
import Modal from './Modal.jsx'
import { CATEGORY_COLORS } from '../lib/palette.js'
import { toInt, formatNumberInput, formatRupiah } from '../lib/money.js'
import { btn } from '../lib/buttons.js'
import { haptic } from '../lib/haptics.js'

function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CATEGORY_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`h-8 w-8 rounded-full transition-transform active:scale-95 ${
            value === c
              ? 'ring-2 ring-slate-700 ring-offset-2 dark:ring-white dark:ring-offset-slate-900 scale-105'
              : 'hover:scale-105 opacity-90 hover:opacity-100'
          }`}
          style={{ backgroundColor: c }}
          aria-label={`Pilih warna ${c}`}
        />
      ))}
    </div>
  )
}

export default function AddPocketModal({ onClose, onAdd }) {
  const [pocketType, setPocketType] = useState('expense') // 'expense' | 'saving'
  const [name, setName] = useState('')
  const [budget, setBudget] = useState('')
  const [goal, setGoal] = useState('')
  const [deadline, setDeadline] = useState('')
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [submitting, setSubmitting] = useState(false)

  const inputClass =
    'w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || submitting) return
    setSubmitting(true)
    try {
      await onAdd({
        name: name.trim(),
        budgetAmount: pocketType === 'expense' ? toInt(budget) : 0,
        color,
        goalAmount: pocketType === 'saving' ? toInt(goal) : 0,
        ...(pocketType === 'saving' && deadline ? { goalDeadline: deadline } : {}),
      })
      haptic.success()
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Tambah Pocket Baru"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button
            type="submit"
            form="add-pocket-form"
            disabled={!name.trim() || submitting}
            className={btn.primary}
          >
            {submitting ? 'Menyimpan…' : '+ Simpan Pocket'}
          </button>
        </div>
      }
    >
      <form id="add-pocket-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tipe Pocket
          </label>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setPocketType('expense')}
              className={`min-h-[40px] rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98] ${
                pocketType === 'expense'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Pengeluaran Bulanan
            </button>
            <button
              type="button"
              onClick={() => setPocketType('saving')}
              className={`min-h-[40px] rounded-lg py-2 text-xs font-semibold transition active:scale-[0.98] ${
                pocketType === 'saving'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Target Tabungan
            </button>
          </div>
        </div>

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

        {pocketType === 'expense' ? (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Alokasi Budget / Bulan (Rp)
            </label>
            <input
              className={`${inputClass} tabular-nums`}
              type="text"
              inputMode="numeric"
              placeholder="Nominal alokasi bulanan (opsional)"
              value={budget}
              onChange={(e) => setBudget(formatNumberInput(e.target.value))}
            />
            {budget && toInt(budget) > 0 && (
              <p className="mt-1 text-xs font-semibold tabular-nums text-teal-600 dark:text-teal-400">{formatRupiah(toInt(budget))}</p>
            )}
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Uang akan dialokasikan tiap bulan dari Uang Bebas untuk belanja pos ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Tabungan (Rp)
              </label>
              <input
                className={`${inputClass} tabular-nums`}
                type="text"
                inputMode="numeric"
                placeholder="Target tabungan (opsional)"
                value={goal}
                onChange={(e) => setGoal(formatNumberInput(e.target.value))}
              />
              {goal && toInt(goal) > 0 && (
                <p className="mt-1 text-xs font-semibold tabular-nums text-teal-600 dark:text-teal-400">{formatRupiah(toInt(goal))}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Tercapai Pada
              </label>
              <input
                className={`${inputClass} tabular-nums`}
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Warna Pocket
          </label>
          <ColorPicker value={color} onChange={setColor} />
        </div>
      </form>
    </Modal>
  )
}
