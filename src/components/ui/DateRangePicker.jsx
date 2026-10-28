import { useState, useRef, useEffect } from 'react'
import { Calendar, toISODate } from './Calendar.jsx'
import { formatDate } from '../../lib/dates.js'

function formatRangeLabel(from, to) {
  if (!from && !to) return 'Semua tanggal'
  if (from && !to) return `Mulai ${formatDate(from)}…`
  if (from === to) return formatDate(from)
  return `${formatDate(from)} – ${formatDate(to)}`
}

export function DateRangePicker({
  from = '',
  to = '',
  onChange,
  defaultMonth,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const range = { from, to }

  const handleRangeSelect = (newRange) => {
    if (!newRange) {
      onChange({ from: '', to: '' })
      return
    }
    const nextFrom = toISODate(newRange.from)
    const nextTo = toISODate(newRange.to)
    onChange({ from: nextFrom, to: nextTo })

    // Auto close when range is fully selected (both from & to)
    if (nextFrom && nextTo && nextFrom !== nextTo) {
      setTimeout(() => setOpen(false), 200)
    }
  }

  const applyPreset = (presetKey) => {
    const today = new Date()
    const todayStr = toISODate(today)

    if (presetKey === 'all') {
      onChange({ from: '', to: '' })
    } else if (presetKey === 'today') {
      onChange({ from: todayStr, to: todayStr })
    } else if (presetKey === 'yesterday') {
      const y = new Date()
      y.setDate(y.getDate() - 1)
      const yStr = toISODate(y)
      onChange({ from: yStr, to: yStr })
    } else if (presetKey === 'last7') {
      const d7 = new Date()
      d7.setDate(d7.getDate() - 6)
      onChange({ from: toISODate(d7), to: todayStr })
    } else if (presetKey === 'month') {
      const dFrom = new Date(today.getFullYear(), today.getMonth(), 1)
      const dTo = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      onChange({ from: toISODate(dFrom), to: toISODate(dTo) })
    }
    setOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left font-sans text-sm text-slate-900 shadow-tactile-sm transition hover:border-teal-500/50 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        aria-expanded={open}
        aria-label="Pilih rentang tanggal"
      >
        <span className="flex items-center gap-2 truncate">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-slate-400">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="truncate">{formatRangeLabel(from, to)}</span>
        </span>
        <span className="ml-1 text-xs text-slate-400">▾</span>
      </button>

      {/* Popover */}
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1.5 w-[310px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-tactile-md dark:border-slate-800 dark:bg-slate-900 sm:left-0 sm:right-auto">
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 p-2 dark:border-slate-800">
              <button
                type="button"
                onClick={() => applyPreset('all')}
                className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => applyPreset('today')}
                className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => applyPreset('yesterday')}
                className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => applyPreset('last7')}
                className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                7 Hari
              </button>
              <button
                type="button"
                onClick={() => applyPreset('month')}
                className="rounded-xl px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:bg-black/5 hover:text-black dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                Bulan Ini
              </button>
            </div>

            {/* Calendar */}
            <Calendar
              mode="range"
              selected={range}
              onSelect={handleRangeSelect}
              defaultMonth={defaultMonth || from}
            />

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-black/10 px-3 py-2 dark:border-white/10">
              <button
                type="button"
                onClick={() => {
                  onChange({ from: '', to: '' })
                  setOpen(false)
                }}
                className="text-xs font-semibold text-ember hover:underline"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-carbon px-3 py-1 text-xs font-semibold text-white transition hover:bg-black/80 dark:bg-white dark:text-carbon dark:hover:bg-white/90"
              >
                Selesai
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
