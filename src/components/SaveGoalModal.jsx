import { useState } from 'react'
import Modal from './Modal.jsx'
import { formatRupiah, toInt, formatNumberInput } from '../lib/money.js'
import { btn } from '../lib/buttons.js'
import { haptic } from '../lib/haptics.js'
import { useStore } from '../store/StoreContext.jsx'
import { singleWalletBalance, freeLeft, goalSaved } from '../lib/calc.js'

// mode: 'nabung' (uang bebas / dompet → tabungan) | 'pakai' (tabungan → belanja / dompet)
export default function SaveGoalModal({ cat, mode = 'nabung', available = 0, onSubmit, onClose }) {
  const { wallets = [], months = {}, currentMonthId } = useStore()
  const currentMonth = months[currentMonthId] || {}
  const txs = currentMonth.transactions || []
  const categories = currentMonth.categories || []

  // Pocket aktif
  const [pocketId, setPocketId] = useState(() => cat?.id || categories[0]?.id || '')
  const activeCat = categories.find((c) => c.id === pocketId) || cat || categories[0] || {}

  // Dompet aktif (pre-fill dengan dompet tertaut pocket atau dompet pertama)
  const [walletId, setWalletId] = useState(() => activeCat.walletId || wallets[0]?.id || '')
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')

  const isUse = mode === 'pakai'
  const amt = toInt(amount)

  // Saldo tabungan saat ini dan target nominal
  const currentProgress = goalSaved(activeCat, txs)
  const currentSaved =
    activeCat.id === cat?.id && typeof available === 'number' && available >= 0
      ? available
      : currentProgress.saved
  const goalAmount = activeCat.goalAmount || 0
  const needed = Math.max(0, goalAmount - currentSaved)

  // Perhitungan setelah transaksi
  const newSaved = isUse ? Math.max(0, currentSaved - amt) : currentSaved + amt
  const currentPct = goalAmount > 0 ? Math.min(100, Math.round((currentSaved / goalAmount) * 100)) : 0
  const newPct = goalAmount > 0 ? Math.min(100, Math.round((newSaved / goalAmount) * 100)) : 0

  // Validasi
  const over = isUse && amt > currentSaved
  const freeMoney = freeLeft(currentMonth)
  const exceedsFree = !isUse && amt > freeMoney

  const handlePocketChange = (newPocketId) => {
    setPocketId(newPocketId)
    const target = categories.find((c) => c.id === newPocketId)
    if (target?.walletId) {
      setWalletId(target.walletId)
    }
  }

  const handlePreset = (presetValue) => {
    haptic.tap()
    setAmount(formatNumberInput(String(presetValue)))
  }

  const handleAddPreset = (delta) => {
    haptic.tap()
    const nextVal = (amt || 0) + delta
    setAmount(formatNumberInput(String(nextVal)))
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    if (amt <= 0 || over || !pocketId || (wallets.length > 0 && !walletId)) return
    haptic.success()
    onSubmit(amt, desc.trim(), walletId || undefined, activeCat.id)
    onClose()
  }

  return (
    <Modal
      title={isUse ? `Tarik Tabungan ${activeCat.name || ''}` : `Setor ke ${activeCat.name || ''}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btn.neutral}>
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!amount || amt <= 0 || over || !pocketId || (wallets.length > 0 && !walletId)}
            className={btn.primary}
          >
            {isUse ? 'Tarik' : 'Setor'}
          </button>
        </div>
      }
    >
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {isUse
          ? `Uang ditarik dari tabungan (tersedia ${formatRupiah(currentSaved)}) untuk keperluan belanja.`
          : 'Uang disisihkan dari rekening pilihan dan dialokasikan ke pocket tabungan ini.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Pilihan Pocket Tabungan */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUse ? 'Pocket Asal Tabungan *' : 'Pocket Tujuan Tabungan *'}
          </label>
          <select
            aria-label="Pocket Tabungan"
            value={pocketId}
            onChange={(e) => handlePocketChange(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.goalAmount ? `(Target: ${formatRupiah(c.goalAmount)})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Pilihan Dompet */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {isUse ? 'Rekening / Dompet Tujuan *' : 'Sumber Rekening / Dompet *'}
          </label>
          <select
            aria-label="Dompet Tabungan"
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {wallets.length === 0 ? (
              <option value="">Belum ada dompet</option>
            ) : (
              wallets.map((w) => {
                const bal = singleWalletBalance(w.id, wallets, months)
                return (
                  <option key={w.id} value={w.id}>
                    {w.name} ({formatRupiah(bal)})
                  </option>
                )
              })
            )}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Nominal (Rp)
          </label>
          <input
            className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 font-sans text-sm tabular-nums text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            type="text"
            inputMode="numeric"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(formatNumberInput(e.target.value))}
            autoFocus
          />
          {amount && amt > 0 && (
            <p className="mt-1 font-sans text-xs font-semibold tabular-nums text-teal-600 dark:text-teal-400">
              {formatRupiah(amt)}
            </p>
          )}
        </div>

        {/* Quick chips / presets */}
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">Pilihan Cepat</p>
          <div className="flex flex-wrap gap-1.5">
            {!isUse ? (
              <>
                <button
                  type="button"
                  onClick={() => handleAddPreset(50000)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  +50rb
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset(100000)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  +100rb
                </button>
                <button
                  type="button"
                  onClick={() => handleAddPreset(250000)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  +250rb
                </button>
                {needed > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePreset(needed)}
                    className="rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-xs font-medium text-teal-700 transition active:scale-[0.97] hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                  >
                    Sisa Target ({formatRupiah(needed)})
                  </button>
                )}
              </>
            ) : (
              <>
                {currentSaved >= 50000 && (
                  <button
                    type="button"
                    onClick={() => handlePreset(50000)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    50rb
                  </button>
                )}
                {currentSaved >= 100000 && (
                  <button
                    type="button"
                    onClick={() => handlePreset(100000)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    100rb
                  </button>
                )}
                {currentSaved >= 250000 && (
                  <button
                    type="button"
                    onClick={() => handlePreset(250000)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition active:scale-[0.97] hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    250rb
                  </button>
                )}
                {currentSaved > 0 && (
                  <button
                    type="button"
                    onClick={() => handlePreset(currentSaved)}
                    className="rounded-lg border border-teal-200 bg-teal-50/70 px-2.5 py-1 text-xs font-medium text-teal-700 transition active:scale-[0.97] hover:bg-teal-100 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300"
                  >
                    Semua ({formatRupiah(currentSaved)})
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Live Preview Progres Sebelum -> Sesudah */}
        {goalAmount > 0 && amt > 0 && (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-500 dark:text-slate-400">Pratinjau Progres</span>
              <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                {currentPct}% <span className="text-slate-400 dark:text-slate-600">→</span>{' '}
                <span className="text-teal-600 dark:text-teal-400">{newPct}%</span>
              </span>
            </div>
            <div className="relative mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
              <div
                className="h-full bg-slate-400/40 dark:bg-slate-600/40"
                style={{ transform: `scaleX(${currentPct / 100})`, transformOrigin: 'left' }}
              />
              <div
                className="absolute inset-0 h-full bg-teal-600 transition-transform duration-200 dark:bg-teal-400"
                style={{ transform: `scaleX(${newPct / 100})`, transformOrigin: 'left' }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-slate-500 dark:text-slate-400">
              <span>{formatRupiah(currentSaved)}</span>
              <span className="font-semibold text-teal-600 dark:text-teal-400">{formatRupiah(newSaved)}</span>
              <span>{formatRupiah(goalAmount)}</span>
            </div>
          </div>
        )}

        {isUse && (
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Keperluan
            </label>
            <input
              className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-tactile-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              type="text"
              placeholder="Untuk apa? (mis. Beli perangkat kerja)"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        )}

        {/* Validation messages */}
        {over && (
          <p className="text-xs font-medium tabular-nums text-rose-500">
            Melebihi tabungan tersedia ({formatRupiah(currentSaved)}).
          </p>
        )}
        {exceedsFree && !over && (
          <p className="text-xs font-medium tabular-nums text-amber-600 dark:text-amber-400">
            Nominal melebihi sisa Uang Bebas saat ini ({formatRupiah(freeMoney)}). Setoran tetap dapat diproses.
          </p>
        )}
      </form>
    </Modal>
  )
}
