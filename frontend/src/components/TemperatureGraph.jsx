import { Area, Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

function TemperatureGraph({ points }) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-inkTertiary">Temperature Trend</p>
      <div className="h-40 w-full rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] px-1 py-1">
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 10, right: 8, bottom: 2, left: 8 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(124, 134, 184, 0.15)" />
                <stop offset="100%" stopColor="rgba(124, 134, 184, 0)" />
              </linearGradient>
              <linearGradient id="tempStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8FAFD9" />
                <stop offset="100%" stopColor="#6D6BFF" />
              </linearGradient>
            </defs>
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
            <Area
              type="monotone"
              dataKey="temperature"
              stroke="none"
              fill="url(#tempFill)"
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="rgba(124, 134, 184, 0.16)"
              strokeWidth={8}
              dot={false}
              activeDot={false}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
            <Line
              className="graph-breathe-line"
              type="monotone"
              dataKey="temperature"
              stroke="url(#tempStroke)"
              strokeWidth={2.3}
              dot={false}
              activeDot={{ r: 3, fill: '#6D6BFF' }}
              isAnimationActive
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TemperatureGraph;
