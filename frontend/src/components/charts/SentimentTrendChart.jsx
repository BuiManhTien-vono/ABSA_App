import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

export default function SentimentTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu xu hướng</p>;
  }

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis dataKey="date" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
          <Line type="monotone" dataKey="positive" stroke="#34d399" strokeWidth={2} name="Tích cực" />
          <Line type="monotone" dataKey="neutral" stroke="#94a3b8" strokeWidth={2} name="Trung tính" />
          <Line type="monotone" dataKey="negative" stroke="#f87171" strokeWidth={2} name="Tiêu cực" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
