import { useState, useMemo, useEffect } from 'react'
import { todayISO, yesterdayISO, formatDateFull } from '../lib/dates.js'
import { haptic } from '../lib/haptics.js'

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const DAYS_HEADER = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

function parseISO(iso) {
  if (!iso || typeof iso !== 'string') return new Date()
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return new Date()
  return new Date(y, m - 1, d)
}

function toISOString(year, monthZeroIndexed, day) {
  const y = String(year).padStart(4, '0')
  const m = String(monthZeroIndexed + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addFutureMonths(isoDate, count) {
  const d = parseISO(isoDate || todayISO())
  d.setMonth(d.getMonth() + count)
  return toISOString(d.getFullYear(), d.getMonth(), d.getDate())
}

export default function DatePicker({
  value,
  onChange,
  label = 'Tanggal',
  placeholder = 'Pilih tanggal...',
  presetType = 'past', // 'past' | 'future' | 'none'
  error,
}) {
  // Explicit popover state machine: 'closed' | 'open'
  const [popoverState, setPopoverState] = useState('closed')
  const isOpen = popoverState === 'open'
  const openPopover = () => setPopoverState('open')
  const closePopover = () => setPopoverState('closed')
  const togglePopover = () => setPopoverState((s) => (s === 'open' ? 'closed' : 'open'))

  // Current parsed date from value
  const parsed = useMemo(() => parseISO(value), [value])

  // Calendar view state (year & month)
  const [viewYear, setViewYear] = useState(() => parsed.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => parsed.getMonth())

  // Keep view in sync when value changes externally
  useEffect(() => {
    setViewYear(parsed.getFullYear())
    setViewMonth(parsed.getMonth())
  }, [parsed])

  const today = todayISO()
  const yesterday = yesterdayISO()

  const isToday = value === today
  const isYesterday = value === yesterday

  // Compute calendar days
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay() // 0 is Sun, 1 is Mon
    const startOffset = (rawFirstDay + 6) % 7 // Mon = 0 ... Sun = 6

    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate()
    const days = []

    // Previous month filler days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = prevMonthDays - i
      const prevDate = new Date(viewYear, viewMonth - 1, d)
      const iso = toISOString(prevDate.getFullYear(), prevDate.getMonth(), d)
      days.push({
        day: d,
        iso,
        isCurrentMonth: false,
        isSelected: iso === value,
        isToday: iso === today,
      })
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = toISOString(viewYear, viewMonth, d)
      days.push({
        day: d,
        iso,
        isCurrentMonth: true,
        isSelected: iso === value,
        isToday: iso === today,
      })
    }

    // Next month filler days (to make 35 or 42 cells)
    const totalCells = Math.ceil(days.length / 7) * 7
    const remaining = totalCells - days.length
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(viewYear, viewMonth + 1, d)
      const iso = toISOString(nextDate.getFullYear(), nextDate.getMonth(), d)
      days.push({
        day: d,
        iso,
        isCurrentMonth: false,
        isSelected: iso === value,
        isToday: iso === today,
      })
    }

    return days
  }, [viewYear, viewMonth, value, today])

  const prevMonth = () => {
    haptic.tap()
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    haptic.tap()
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const selectDate = (iso) => {
    haptic.selection()
    onChange(iso)
    closePopover()
  }

  const jumpToToday = () => {
    haptic.tap()
    onChange(today)
    setViewYear(parseISO(today).getFullYear())
    setViewMonth(parseISO(today).getMonth())
    closePopover()
  }

  const jumpToYesterday = () => {
    haptic.tap()
    onChange(yesterday)
    setViewYear(parseISO(yesterday).getFullYear())
    setViewMonth(parseISO(yesterday).getMonth())
    closePopover()
  }

  const jumpFuture = (monthsToAdd) => {
    haptic.tap()
    const target = addFutureMonths(today, monthsToAdd)
    onChange(target)
    setViewYear(parseISO(target).getFullYear())
    setViewMonth(parseISO(target).getMonth())
    closePopover()
  }

  return (
    <div className="space-y-1.5">
      {/* Label & Quick Preset Chips */}
      <div className="flex items-center justify-between gap-2">
        <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </label>
        {presetType === 'future' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => jumpFuture(3)}
              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              +3 Bln
            </button>
            <button
              type="button"
              onClick={() => jumpFuture(6)}
              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              +6 Bln
            </button>
            <button
              type="button"
              onClick={() => jumpFuture(12)}
              className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              +1 Thn
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  haptic.tap()
                  onChange('')
                  closePopover()
                }}
                className="rounded-lg px-1.5 py-0.5 text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition"
                title="Hapus tanggal"
              >
                Hapus
              </button>
            )}
          </div>
        ) : presetType === 'past' ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={jumpToToday}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                isToday
                  ? 'bg-teal-600 text-white shadow-tactile-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={jumpToYesterday}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition active:scale-95 ${
                isYesterday
                  ? 'bg-teal-600 text-white shadow-tactile-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Kemarin
            </button>
          </div>
        ) : null}
      </div>

      {/* Main Date Display Trigger */}
      <button
        type="button"
        onClick={() => {
          haptic.tap()
          togglePopover()
        }}
        aria-expanded={isOpen}
        aria-label={`${label}: ${value ? formatDateFull(value) : placeholder}`}
        className={`group flex min-h-[44px] w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left font-sans text-sm shadow-tactile-sm transition active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-teal-500/20 dark:bg-slate-800 ${
          isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/20 dark:border-teal-400'
            : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <span className={`tabular-nums ${value ? 'font-semibold text-slate-900 dark:text-white' : 'font-normal text-slate-400 dark:text-slate-500'}`}>
            {value ? formatDateFull(value) : placeholder}
          </span>
          {isToday && (
            <span className="rounded-full bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
              Hari ini
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200">
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Hidden native input for test/DOM fallback */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Embedded Native Mobile Calendar */}
      {isOpen && (
        <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-tactile-sm animate-in fade-in zoom-in-95 duration-150 dark:border-slate-800 dark:bg-slate-900">
          {/* Calendar Header: Month/Year navigation */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Bulan sebelumnya"
              aria-label="Bulan sebelumnya"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span className="font-sans text-sm font-bold tracking-tight text-slate-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Bulan berikutnya"
              aria-label="Bulan berikutnya"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Weekday Names Header */}
          <div className="mt-2.5 grid grid-cols-7 text-center">
            {DAYS_HEADER.map((day) => (
              <span
                key={day}
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 py-1"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid with smooth crossfade */}
          <div key={`${viewYear}-${viewMonth}`} className="mt-1 grid grid-cols-7 gap-1 transition-opacity duration-160 ease-out-expo">
            {calendarDays.map((item, idx) => {
              const { day, iso, isCurrentMonth, isSelected, isToday: cellIsToday } = item
              return (
                <button
                  key={`${iso}-${idx}`}
                  type="button"
                  onClick={() => selectDate(iso)}
                  className={`flex h-9 sm:h-10 w-full items-center justify-center rounded-xl text-xs sm:text-sm font-medium tabular-nums transition-[transform,background-color,color] duration-120 ease-out-expo select-none ${
                    isSelected
                      ? 'bg-teal-600 font-bold text-white shadow-tactile-sm'
                      : cellIsToday
                        ? 'border border-teal-500/70 bg-teal-50 font-bold text-teal-700 dark:border-teal-500/70 dark:bg-teal-950/40 dark:text-teal-300'
                        : isCurrentMonth
                          ? 'text-slate-800 hover:bg-slate-100 active:scale-[0.97] dark:text-slate-200 dark:hover:bg-slate-800'
                          : 'text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400'
                  }`}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}`}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Calendar Actions Footer */}
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={jumpToToday}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 transition"
              >
                Hari Ini
              </button>
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    haptic.tap()
                    onChange('')
                    closePopover()
                  }}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 dark:text-rose-400 transition"
                >
                  Kosongkan
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={closePopover}
              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  )
}

