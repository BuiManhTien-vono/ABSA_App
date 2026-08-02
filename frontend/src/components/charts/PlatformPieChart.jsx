import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#ee4d2d', '#3b82f6', '#f1f5f9'];

export default function PlatformPieChart({ data = [] }) {
  if (!data || data.length === 0) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu thị phần</p>;
  }

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="platform" cx="50%" cy="50%" outerRadius={80} label>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
