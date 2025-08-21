import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts';
import { Card } from 'antd';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const CATEGORY_ICONS = {
  SERVICIOS: '📞',
  SUMINISTROS: '📦', 
  ALQUILER: '🏠',
  OTRO: '📝'
};

interface Props {
  data: Record<string, number>;
}

export default function ExpenseSummaryChart({ data }: Props) {
  const chartData = Object.entries(data).map(([name, value]) => ({ 
    name: `${CATEGORY_ICONS[name as keyof typeof CATEGORY_ICONS] || '📊'} ${name}`, 
    value,
    originalName: name
  }));

  const totalAmount = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="🏷️ Distribución por Categoría" size="small">
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie 
              dataKey="value" 
              data={chartData} 
              outerRadius={80}
              label={({ value, percent }) => `$${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                'Monto'
              ]}
              labelFormatter={(label) => `Categoría: ${label}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📊</div>
          <div>No hay datos para mostrar</div>
        </div>
      )}
      
      {/* Resumen de categorías */}
      <div className="mt-4 space-y-2">
        {chartData.map((item) => (
          <div key={item.originalName} className="flex justify-between items-center text-sm">
            <span>{item.name}</span>
            <div className="text-right">
              <div className="font-bold">${item.value.toLocaleString()}</div>
              <div className="text-xs text-gray-500">
                {((item.value / totalAmount) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
