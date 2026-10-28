import { useState, useMemo } from 'react'

function pad2(n) {
  return String(n).padStart(2, '0')
}

export function toISODate(d) {
  if (!d) return ''
  if (typeof d === 'string') return d.slice(0, 10)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

export function parseDate(val) {
  if (!val) return null
  if (val instanceof Date) return val
  const [y, m, d] = val.slice(0, 10).split('-').map(Number)
  return new Date(y, m - 1, d || 1)
}

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

/**
 * Calendar component inspired by shadcn (mode="range" | "single")
 */
export function Calendar({
  mode = 'range',
  selected, // { from, to } for range, or Date/string for single
  onSelect,
  defaultMonth,
  className = '',
}) {
  const initDate = useMemo(() => {
    if (defaultMonth) return parseDate(defaultMonth)
    if (mode === 'range' && selected?.from) return parseDate(selected.from)
    if (mode === 'single' && selected) return parseDate(selected)
    return new Date()
  }, [defaultMonth, selected, mode])

  const [viewYear, setViewYear] = useState(() => initDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(() => initDate.getMonth())
  const [hoverDate, setHoverDate] = useState(null)

  const fromISO = mode === 'range' ? toISODate(selected?.from) : toISODate(selected)
  const toISO = mode === 'range' ? toISODate(selected?.to) : toISODate(selected)

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sunday

  const todayStr = toISODate(new Date())

  const handleDayClick = (dayStr) => {
    if (!onSelect) return

    if (mode === 'single') {
      onSelect(dayStr)
      return
    }

    // Range mode
    if (!fromISO || (fromISO && toISO)) {
      // Start new range
      onSelect({ from: dayStr, to: '' })
    } else {
      // Second click completes range
      if (dayStr < fromISO) {
        onSelect({ from: dayStr, to: fromISO })
      } else {
        onSelect({ from: fromISO, to: dayStr })
      }
    }
  }

  return (
    <div className={`select-none p-3 ${className}`}>
      {/* Month Navigation */}
      <div className="flex items-center justify-between pb-3">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 text-slate-600 transition hover:bg-black/5 hover:text-black dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Bulan sebelumnya"
        >
          ‹
        </button>
        <div className="text-sm font-semibold text-carbon dark:text-white">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </div>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-black/10 text-slate-600 transition hover:bg-black/5 hover:text-black dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Bulan berikutnya"
        >
          ›
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {/* Leading empty slots */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}

        {/* Month days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const dayStr = `${viewYear}-${pad2(viewMonth + 1)}-${pad2(day)}`
          const isToday = dayStr === todayStr

          const isFrom = dayStr === fromISO
          const isTo = dayStr === toISO

          // Active range between from and to (or hover preview)
          const effectiveTo = toISO || (fromISO && hoverDate && hoverDate >= fromISO ? hoverDate : '')
          const effectiveFrom = fromISO && hoverDate && hoverDate < fromISO ? hoverDate : fromISO

          const inRange =
            effectiveFrom &&
            effectiveTo &&
            dayStr > effectiveFrom &&
            dayStr < effectiveTo

          // Range styling
          const isSelected = isFrom || isTo

          let bgClass = 'hover:bg-black/5 dark:hover:bg-white/10 text-carbon dark:text-white'
          let roundedClass = 'rounded-lg'

          if (isFrom && isTo) {
            bgClass = 'bg-carbon text-white dark:bg-white dark:text-carbon font-semibold'
            roundedClass = 'rounded-full'
          } else if (isFrom) {
            bgClass = 'bg-carbon text-white dark:bg-white dark:text-carbon font-semibold'
            roundedClass = effectiveTo ? 'rounded-l-full rounded-r-none' : 'rounded-full'
          } else if (isTo) {
            bgClass = 'bg-carbon text-white dark:bg-white dark:text-carbon font-semibold'
            roundedClass = 'rounded-r-full rounded-l-none'
          } else if (inRange) {
            bgClass = 'bg-sunburst/60 text-carbon dark:bg-white/20 dark:text-white'
            roundedClass = 'rounded-none'
          }

          return (
            <div
              key={dayStr}
              className={`relative flex items-center justify-center p-0 ${
                inRange ? 'bg-sunburst/40 dark:bg-white/10' : ''
              } ${isFrom && effectiveTo ? 'rounded-l-full' : ''} ${
                isTo ? 'rounded-r-full' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => handleDayClick(dayStr)}
                onMouseEnter={() => fromISO && !toISO && setHoverDate(dayStr)}
                onMouseLeave={() => setHoverDate(null)}
                className={`flex h-8 w-8 items-center justify-center text-xs transition ${bgClass} ${roundedClass} ${
                  isToday && !isSelected ? 'font-bold underline decoration-carbon/40 dark:decoration-white/40' : ''
                }`}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
