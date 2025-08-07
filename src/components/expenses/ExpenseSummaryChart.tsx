import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042'];

interface Props {
  data: Record<string, number>;
}

export default function ExpenseSummaryChart({ data }: Props) {
  const chartData = Object.entries(data).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie dataKey="value" data={chartData} outerRadius={80} label>
          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v:number) => `$${v.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
