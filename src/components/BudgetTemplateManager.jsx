import { useState } from 'react'
import Modal from './Modal.jsx'
import Confirm from './Confirm.jsx'
import EmptyState from './EmptyState.jsx'
import { useStore } from '../store/StoreContext.jsx'
import { formatRupiah } from '../lib/money.js'
import { btn } from '../lib/buttons.js'

export default function BudgetTemplateManager({ onClose }) {
  const { currentMonth, budgetTemplates, saveBudgetTemplate, removeBudgetTemplate, startNewMonth } = useStore()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const categories = currentMonth?.categories || []
  const input =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white'

  const save = async (e) => {
    e.preventDefault()
    if (!name.trim() || categories.length === 0) return
    setSaving(true)
    try {
      await saveBudgetTemplate(name)
      setName('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title="Template Budget Bulanan" onClose={onClose} wide>
      <form onSubmit={save} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4.5 shadow-tactile-sm dark:border-slate-800 dark:bg-slate-900">
        <h4 className="mb-1 font-sans text-sm font-bold text-slate-900 dark:text-white">Simpan budget bulan ini</h4>
        <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Simpan nama, nominal, target, dan warna pocket untuk dipakai lagi.</p>
        <div className="flex gap-2">
          <input className={input} placeholder="mis. Budget Normal" value={name} onChange={(e) => setName(e.target.value)} disabled={saving || categories.length === 0} />
          <button type="submit" disabled={saving || !name.trim() || categories.length === 0} className={btn.primary + ' shrink-0'}>
            {saving ? 'Menyimpan…' : 'Simpan'}
          </button>
        </div>
        {categories.length === 0 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-300">Buat minimal satu pocket sebelum menyimpan template.</p>}
      </form>

      <div className="mt-4 space-y-2.5">
        {budgetTemplates.length === 0 && <EmptyState title="Belum ada template" sub="Simpan susunan pocket bulan ini untuk membuat budget bulan depan lebih cepat." />}
        {budgetTemplates.map((template) => {
          const total = (template.categories || []).reduce((sum, c) => sum + (c.budgetAmount || 0), 0)
          return (
            <div key={template.id} className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-tactile-sm dark:border-slate-800/80 dark:bg-slate-800/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{template.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{template.categories?.length || 0} pocket · total {formatRupiah(total)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { startNewMonth(template); onClose() }} className={btn.primary}>Pakai bulan depan</button>
                  <button onClick={() => setConfirmId(template.id)} className={btn.subtleDanger}>Hapus</button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(template.categories || []).map((c) => (
                  <span key={`${template.id}-${c.key || c.name}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {c.name}: {formatRupiah(c.budgetAmount || 0)}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {confirmId && (
        <Confirm
          title="Hapus template budget"
          message="Template ini akan dihapus. Budget bulan yang sudah dibuat tidak berubah. Lanjutkan?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => {
            removeBudgetTemplate(confirmId)
            setConfirmId(null)
          }}
        />
      )}
    </Modal>
  )
}
