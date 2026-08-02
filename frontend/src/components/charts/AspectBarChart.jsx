import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function AspectBarChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu khía cạnh</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ left: 40, right: 20 }}>
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="aspect" type="category" stroke="#94a3b8" width={100} />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
