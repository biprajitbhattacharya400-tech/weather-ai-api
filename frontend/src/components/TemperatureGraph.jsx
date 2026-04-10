import { Area, Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

function TemperatureGraph({ points }) {
  return (
    <section className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-inkTertiary">Temperature Trend</p>
      <div className="h-40 w-full rounded-2xl border border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] px-1 py-1">
        <ResponsiveContainer>
          <LineChart data={points} margin={{ top: 10, right: 8, bottom: 2, left: 8 }}>
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(95, 125, 178, 0.35)" />
                <stop offset="100%" stopColor="rgba(95, 125, 178, 0.02)" />
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
              stroke="rgba(116, 143, 194, 0.35)"
              strokeWidth={6}
              dot={false}
              activeDot={false}
              isAnimationActive
              animationDuration={900}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#5b6f96"
              strokeWidth={2.4}
              dot={false}
              activeDot={{ r: 3, fill: '#111827' }}
              isAnimationActive
              animationDuration={1050}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default TemperatureGraph;
