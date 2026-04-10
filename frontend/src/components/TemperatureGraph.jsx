import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

function TemperatureGraph({ points }) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-inkTertiary">Temperature Trend</p>
      <div className="h-40 w-full rounded-2xl border border-white/18 bg-[linear-gradient(180deg,rgba(255,255,255,0.15),rgba(255,255,255,0.05))] px-1 py-1">
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 10, right: 8, bottom: 2, left: 8 }}>
            <Tooltip
              cursor={false}
              contentStyle={{
                background: 'rgba(255,255,255,0.8)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(17, 24, 39, 0.12)',
                color: '#111827',
                fontSize: '12px',
              }}
              formatter={(value) => [`${Math.round(value)}°`, 'Temp']}
              labelFormatter={(label) => `Hour ${label}`}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#4f5f7d"
              strokeWidth={2.6}
              dot={false}
              activeDot={{ r: 3, fill: '#111827' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TemperatureGraph;
