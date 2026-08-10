import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

export default function DonutChart({ data, totalLabel }) {
  const total = data.reduce((a, d) => a + d.value, 0)

  return (
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
          <Tooltip formatter={(value, name) => ['Rp ' + Number(value).toLocaleString('id-ID'), name]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs text-slate-400">{totalLabel}</span>
        <span className="text-lg font-bold text-slate-800">
          {total > 0 ? 'Rp ' + total.toLocaleString('id-ID') : '—'}
        </span>
      </div>
    </div>
  )
}
