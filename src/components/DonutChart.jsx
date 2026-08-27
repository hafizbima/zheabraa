import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { formatRupiah } from '../lib/money.js'

export default function DonutChart({ data, totalLabel }) {
  const total = data.reduce((a, d) => a + d.value, 0)

  return (
    <div>
      <div className="relative h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [formatRupiah(Number(value)), name]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500 dark:text-slate-400">{totalLabel}</span>
          <span className="text-lg font-bold text-carbon dark:text-white">
            {total > 0 ? formatRupiah(total) : '—'}
          </span>
        </div>
      </div>
      {data.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
              <span className="flex min-w-0 items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="truncate text-slate-600 dark:text-slate-300">{d.name}</span>
              </span>
              <span className="shrink-0 font-semibold text-carbon dark:text-white">{formatRupiah(d.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
