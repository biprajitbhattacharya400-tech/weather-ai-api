import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';

function TemperatureGraph({ points }) {
  return (
    <section>
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-inkTertiary">Trend</p>
      <div className="h-36 w-full">
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
              stroke="#5B6474"
              strokeWidth={2.4}
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
