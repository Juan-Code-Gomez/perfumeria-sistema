// src/components/dashboard/CashFlowWidget.tsx
import React from 'react';
import { Card, Row, Col, Typography, Progress, Statistic, Space, Tag, Alert } from 'antd';
import { 
  DollarOutlined, 
  RiseOutlined, 
  FallOutlined,
  WalletOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const { Title, Text } = Typography;

interface CashFlowData {
  date: string;
  inflows: number;
  outflows: number;
  netFlow: number;
  cumulativeFlow: number;
}

interface LiquidityMetrics {
  cashOnHand: number;
  bankBalance: number;
  totalLiquidity: number;
  burnRate: number;
  runway: number; // meses
  operatingExpenses: number;
  projectedCashFlow: number;
}

interface CashFlowWidgetProps {
  cashFlowData: CashFlowData[];
  liquidityMetrics: LiquidityMetrics;
  loading?: boolean;
}

export const CashFlowWidget: React.FC<CashFlowWidgetProps> = ({ 
  cashFlowData = [], 
  liquidityMetrics,
  loading = false 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getRunwayStatus = (months: number) => {
    if (months >= 12) return { color: 'success', text: 'Excelente', icon: '✅' };
    if (months >= 6) return { color: 'processing', text: 'Bueno', icon: '⚠️' };
    if (months >= 3) return { color: 'warning', text: 'Atención', icon: '⚠️' };
    return { color: 'error', text: 'Crítico', icon: '🚨' };
  };

  const runwayStatus = getRunwayStatus(liquidityMetrics.runway);

  const cashFlowSummary = {
    totalInflows: cashFlowData.reduce((sum, item) => sum + item.inflows, 0),
    totalOutflows: cashFlowData.reduce((sum, item) => sum + item.outflows, 0),
    netCashFlow: cashFlowData.reduce((sum, item) => sum + item.netFlow, 0),
    trend: cashFlowData.length > 1 ? 
      (cashFlowData[cashFlowData.length - 1].netFlow - cashFlowData[0].netFlow) : 0
  };

  return (
    <div>
      <Card 
        title={
          <Space>
            <WalletOutlined style={{ color: '#1890ff' }} />
            <span>Flujo de Caja y Liquidez</span>
          </Space>
        }
        className="shadow-lg border-0 mb-6"
        style={{ borderRadius: '16px' }}
        extra={
          <Tag color={runwayStatus.color} className="rounded-md">
            {runwayStatus.icon} {runwayStatus.text}
          </Tag>
        }
      >
        {/* Métricas de liquidez */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
              <DollarOutlined className="text-2xl text-green-500 mb-2" />
              <Statistic
                title="Liquidez Total"
                value={liquidityMetrics.totalLiquidity}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ color: '#52c41a', fontSize: '18px' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                Efectivo + Banco
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <RiseOutlined className="text-2xl text-blue-500 mb-2" />
              <Statistic
                title="Flujo Neto Mensual"
                value={cashFlowSummary.netCashFlow}
                formatter={(value) => formatCurrency(Number(value))}
                valueStyle={{ 
                  color: cashFlowSummary.netCashFlow >= 0 ? '#52c41a' : '#ff4d4f', 
                  fontSize: '18px' 
                }}
                prefix={cashFlowSummary.netCashFlow >= 0 ? '↗️' : '↘️'}
              />
              <div className="mt-2 text-xs text-gray-500">
                Ingresos - Egresos
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={8}>
            <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
              <ClockCircleOutlined className="text-2xl text-orange-500 mb-2" />
              <Statistic
                title="Autonomía"
                value={liquidityMetrics.runway}
                suffix="meses"
                valueStyle={{ 
                  color: runwayStatus.color === 'error' ? '#ff4d4f' : 
                         runwayStatus.color === 'warning' ? '#fa8c16' : '#52c41a',
                  fontSize: '18px' 
                }}
              />
              <div className="mt-2">
                <Progress
                  percent={Math.min((liquidityMetrics.runway / 12) * 100, 100)}
                  strokeColor={
                    liquidityMetrics.runway >= 6 ? '#52c41a' : 
                    liquidityMetrics.runway >= 3 ? '#fa8c16' : '#ff4d4f'
                  }
                  size="small"
                  showInfo={false}
                />
              </div>
            </div>
          </Col>
        </Row>

        {/* Alerta de runway bajo */}
        {liquidityMetrics.runway < 6 && (
          <Alert
            message={`⚠️ Atención: Autonomía financiera de ${liquidityMetrics.runway.toFixed(1)} meses`}
            description={`Con el ritmo actual de gastos (${formatCurrency(liquidityMetrics.burnRate)}/mes), 
                         se recomienda optimizar el flujo de caja o buscar financiamiento adicional.`}
            type={liquidityMetrics.runway < 3 ? "error" : "warning"}
            showIcon
            className="mb-4"
            style={{ borderRadius: '8px' }}
          />
        )}

        {/* Gráfico de flujo de caja */}
        <div className="mt-6">
          <Title level={5} className="mb-4">
            📈 Proyección de Flujo de Caja (Próximos 30 días)
          </Title>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    formatCurrency(value), 
                    name === 'inflows' ? 'Ingresos' : 
                    name === 'outflows' ? 'Egresos' : 
                    name === 'netFlow' ? 'Flujo Neto' : 'Acumulado'
                  ]}
                  labelFormatter={(label) => `Fecha: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                
                <Line 
                  type="monotone" 
                  dataKey="inflows" 
                  stroke="#52c41a" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="inflows"
                />
                <Line 
                  type="monotone" 
                  dataKey="outflows" 
                  stroke="#ff4d4f" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="outflows"
                />
                <Line 
                  type="monotone" 
                  dataKey="netFlow" 
                  stroke="#1890ff" 
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  name="netFlow"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Desglose detallado */}
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Space direction="vertical" className="w-full">
                <Text strong className="text-gray-700">💰 Estructura de Liquidez</Text>
                <div className="flex justify-between">
                  <Text>Efectivo en caja:</Text>
                  <Text strong className="text-green-600">
                    {formatCurrency(liquidityMetrics.cashOnHand)}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Saldo bancario:</Text>
                  <Text strong className="text-blue-600">
                    {formatCurrency(liquidityMetrics.bankBalance)}
                  </Text>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Text strong>Total disponible:</Text>
                  <Text strong className="text-lg">
                    {formatCurrency(liquidityMetrics.totalLiquidity)}
                  </Text>
                </div>
              </Space>
            </div>
          </Col>
          
          <Col xs={24} md={12}>
            <div className="p-4 bg-gray-50 rounded-lg">
              <Space direction="vertical" className="w-full">
                <Text strong className="text-gray-700">📊 Análisis de Gastos</Text>
                <div className="flex justify-between">
                  <Text>Gastos operativos/mes:</Text>
                  <Text strong className="text-orange-600">
                    {formatCurrency(liquidityMetrics.operatingExpenses)}
                  </Text>
                </div>
                <div className="flex justify-between">
                  <Text>Tasa de quema/mes:</Text>
                  <Text strong className="text-red-600">
                    {formatCurrency(liquidityMetrics.burnRate)}
                  </Text>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <Text strong>Proyección próximo mes:</Text>
                  <Text strong className={liquidityMetrics.projectedCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {formatCurrency(liquidityMetrics.projectedCashFlow)}
                  </Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default CashFlowWidget;
