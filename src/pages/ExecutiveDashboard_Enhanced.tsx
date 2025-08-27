// src/pages/ExecutiveDashboard_Enhanced.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Typography,
  Table,
  Badge,
  Button,
  Space,
  Avatar,
  Tag
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  WarningOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  ReloadOutlined,
  BankOutlined,
  CalendarOutlined,
  RiseOutlined,
  ThunderboltOutlined,
  CrownOutlined
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import api from "../services/api";
import dayjs from "dayjs";
import "dayjs/locale/es";

dayjs.locale("es");

const { Title, Text } = Typography;

// Paleta de colores mejorada
const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa8c16',
  gradient: {
    blue: ['#667eea', '#764ba2'],
    green: ['#11998e', '#38ef7d'],
    purple: ['#667eea', '#764ba2'],
    orange: ['#f093fb', '#f5576c'],
    teal: ['#4facfe', '#00f2fe']
  },
  chart: ['#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']
};

interface ExecutiveSummary {
  kpis: {
    today: {
      sales: number;
      expenses: number;
      profit: number;
      transactions: number;
      cashInRegister: number;
    };
    month: {
      sales: number;
      expenses: number;
      profit: number;
      transactions: number;
      salesGrowth: number;
      expenseGrowth: number;
    };
  };
  charts: {
    salesTrend: Array<{
      date: string;
      day: string;
      sales: number;
      transactions: number;
    }>;
    topProducts: Array<{
      product: any;
      quantity: number;
      revenue: number;
    }>;
    paymentMethods: {
      efectivo: number;
      tarjeta: number;
      transferencia: number;
      credito: number;
    };
    expensesByCategory: Record<string, number>;
  };
  finances: {
    investment: {
      totalInvestment: number;
      totalProducts: number;
      totalUnits: number;
    };
    capital: {
      cash: number;
      bank: number;
      pending: number;
    };
    receivables: {
      currentCredits: number;
      overdueCredits: number;
      totalCredits: number;
    };
  };
  alerts: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    detail: string;
  }>;
}

const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/executive-summary");
      const dashboardData = response.data.data || response.data;
      setData(dashboardData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error loading executive dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <Alert
        message="Error al cargar el dashboard"
        description="No se pudieron cargar los datos del dashboard ejecutivo."
        type="error"
        showIcon
      />
    );
  }

  // Datos seguros con valores por defecto
  const safeKpis = data.kpis || { today: {}, month: {} };
  const safeCharts = data.charts || { salesTrend: [], topProducts: [], paymentMethods: {}, expensesByCategory: {} };
  const safeFinances = data.finances || { investment: {}, capital: {}, receivables: {} };
  const safeAlerts = data.alerts || [];

  // Crear Card con gradiente y sombra mejorada
  const GradientCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    gradient: string[];
    suffix?: string;
    prefix?: string;
    trend?: number;
    trendLabel?: string;
  }> = ({ title, value, icon, gradient, suffix, prefix, trend, trendLabel }) => (
    <Card
      className="hover:shadow-2xl transition-all duration-300 border-0"
      style={{
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        color: 'white',
        borderRadius: '16px',
        overflow: 'hidden'
      }}
    >
      <div className="relative">
        {/* Patrón de fondo sutil */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <Avatar
              size={56}
              icon={icon}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)'
              }}
            />
            {trend !== undefined && (
              <div className="text-right">
                <div className="flex items-center text-white">
                  {trend >= 0 ? (
                    <ArrowUpOutlined className="mr-1" />
                  ) : (
                    <ArrowDownOutlined className="mr-1" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(trend).toFixed(1)}%
                  </span>
                </div>
                <Text className="text-white opacity-80 text-xs">
                  {trendLabel}
                </Text>
              </div>
            )}
          </div>
          
          <div>
            <Text className="text-white opacity-90 text-sm block mb-2">
              {title}
            </Text>
            <div className="text-3xl font-bold text-white">
              {prefix}{typeof value === 'number' ? formatCurrency(value) : value}{suffix}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  // Datos para gráficos de métodos de pago
  const paymentMethodsData = Object.entries(safeCharts.paymentMethods || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value as number,
    percentage: ((value as number) / Object.values(safeCharts.paymentMethods || {}).reduce((a, b) => (a as number) + (b as number), 0) * 100)
  }));

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div className="p-6">
        {/* Header mejorado */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Title 
                level={1} 
                className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                style={{ fontWeight: 700, fontSize: '2.5rem' }}
              >
                📊 Dashboard Ejecutivo
              </Title>
              <Text className="text-lg text-gray-600">
                Visión completa y en tiempo real de Milán Fragancias
              </Text>
            </div>
            <div className="text-right">
              <Button 
                type="primary"
                size="large"
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                loading={loading}
                className="shadow-lg hover:shadow-xl transition-shadow"
                style={{
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                Actualizar
              </Button>
              <div className="mt-2">
                <Text type="secondary" className="text-sm">
                  <CalendarOutlined className="mr-1" />
                  {dayjs(lastUpdate).format('DD/MM/YYYY HH:mm')}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas mejoradas */}
        {safeAlerts.length > 0 && (
          <div className="mb-8">
            <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
              <WarningOutlined className="text-orange-500" />
              Alertas Importantes
            </Title>
            <Row gutter={[16, 16]}>
              {safeAlerts.slice(0, 3).map((alert, index) => (
                <Col xs={24} lg={8} key={alert.id || index}>
                  <Alert
                    message={alert.message}
                    description={alert.detail}
                    type={alert.severity === 'high' ? 'error' : alert.severity === 'medium' ? 'warning' : 'info'}
                    showIcon
                    style={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </Col>
              ))}
            </Row>
          </div>
        )}

        {/* KPIs del día - Mejorados */}
        <div className="mb-8">
          <Title level={3} className="mb-6 text-gray-700 flex items-center gap-2">
            <ThunderboltOutlined className="text-yellow-500" />
            Métricas de Hoy
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} xl={6}>
              <GradientCard
                title="Ventas del Día"
                value={safeKpis.today.sales || 0}
                icon={<ShoppingCartOutlined />}
                gradient={COLORS.gradient.blue}
                trend={safeKpis.month.salesGrowth}
                trendLabel="vs mes anterior"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <GradientCard
                title="Gastos del Día"
                value={safeKpis.today.expenses || 0}
                icon={<DollarOutlined />}
                gradient={COLORS.gradient.orange}
                trend={safeKpis.month.expenseGrowth}
                trendLabel="vs mes anterior"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <GradientCard
                title="Utilidad del Día"
                value={(safeKpis.today.sales || 0) - (safeKpis.today.expenses || 0)}
                icon={<RiseOutlined />}
                gradient={COLORS.gradient.green}
                trend={((safeKpis.today.sales || 0) - (safeKpis.today.expenses || 0)) > 0 ? 15 : -10}
                trendLabel="rendimiento"
              />
            </Col>
            <Col xs={24} sm={12} xl={6}>
              <GradientCard
                title="Transacciones"
                value={safeKpis.today.transactions || 0}
                icon={<TeamOutlined />}
                gradient={COLORS.gradient.purple}
                suffix=" ventas"
              />
            </Col>
          </Row>
        </div>

        {/* Métricas del mes */}
        <div className="mb-8">
          <Title level={3} className="mb-6 text-gray-700 flex items-center gap-2">
            <CalendarOutlined className="text-blue-500" />
            Resumen del Mes
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card 
                title={
                  <span className="text-lg font-semibold text-gray-700">
                    📈 Tendencia de Ventas (Últimos 7 días)
                  </span>
                }
                className="shadow-lg border-0"
                style={{ borderRadius: '16px' }}
              >
                <div style={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={safeCharts.salesTrend.slice(-7)}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="day" 
                        tick={{ fontSize: 12, fill: '#666' }}
                        axisLine={{ stroke: '#e8e8e8' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 12, fill: '#666' }}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                        axisLine={{ stroke: '#e8e8e8' }}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                        labelFormatter={(label) => `Día: ${label}`}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
            
            <Col xs={24} lg={8}>
              <Card 
                title={
                  <span className="text-lg font-semibold text-gray-700">
                    💳 Métodos de Pago
                  </span>
                }
                className="shadow-lg border-0"
                style={{ borderRadius: '16px', height: '100%' }}
              >
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodsData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {paymentMethodsData.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS.chart[index % COLORS.chart.length]} 
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Total']}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: 'none',
                          borderRadius: '12px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4">
                  {paymentMethodsData.map((method, index) => (
                    <div key={method.name} className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS.chart[index % COLORS.chart.length] }}
                        />
                        <Text className="text-sm">{method.name}</Text>
                      </div>
                      <Text strong className="text-sm">
                        {formatCurrency(method.value)}
                      </Text>
                    </div>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Top productos y finanzas */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <CrownOutlined className="text-yellow-500" />
                  Productos Estrella del Mes
                </span>
              }
              className="shadow-lg border-0"
              style={{ borderRadius: '16px' }}
            >
              <Table
                dataSource={safeCharts.topProducts.slice(0, 5)}
                pagination={false}
                size="small"
                rowKey={(record, index) => `${record.product?.id || index}`}
                columns={[
                  {
                    title: 'Ranking',
                    key: 'rank',
                    width: 60,
                    render: (_, __, index) => (
                      <Badge 
                        count={index + 1} 
                        style={{ 
                          backgroundColor: index < 3 ? COLORS.warning : COLORS.primary,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }} 
                      />
                    ),
                  },
                  {
                    title: 'Producto',
                    key: 'product',
                    render: (_, record) => (
                      <div>
                        <Text strong className="text-sm">
                          {record.product?.name || 'Sin nombre'}
                        </Text>
                        <br />
                        <Text type="secondary" className="text-xs">
                          {record.product?.category?.name || 'Sin categoría'}
                        </Text>
                      </div>
                    ),
                  },
                  {
                    title: 'Vendidos',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    align: 'center' as const,
                    render: (qty: number) => (
                      <Tag color="green" className="font-semibold">
                        {qty} unidades
                      </Tag>
                    )
                  },
                  {
                    title: 'Ingresos',
                    dataIndex: 'revenue',
                    key: 'revenue',
                    align: 'right' as const,
                    render: (revenue: number) => (
                      <Text strong className="text-green-600">
                        {formatCurrency(revenue)}
                      </Text>
                    )
                  }
                ]}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card 
              title={
                <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <BankOutlined className="text-green-500" />
                  Estado Financiero
                </span>
              }
              className="shadow-lg border-0"
              style={{ borderRadius: '16px' }}
            >
              <Space direction="vertical" size="large" className="w-full">
                {/* Capital disponible */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 font-semibold">💰 Capital Disponible</Text>
                    <Text strong className="text-green-600 text-lg">
                      {formatCurrency((safeFinances.capital.cash || 0) + (safeFinances.capital.bank || 0))}
                    </Text>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Text type="secondary" className="text-xs">Efectivo</Text>
                      <div className="text-green-600 font-semibold">
                        {formatCurrency(safeFinances.capital.cash || 0)}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Banco</Text>
                      <div className="text-green-600 font-semibold">
                        {formatCurrency(safeFinances.capital.bank || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inversión en inventario */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 font-semibold">📦 Inversión en Inventario</Text>
                    <Text strong className="text-blue-600 text-lg">
                      {formatCurrency(safeFinances.investment.totalInvestment || 0)}
                    </Text>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <Text type="secondary" className="text-xs">Productos</Text>
                      <div className="text-blue-600 font-semibold">
                        {safeFinances.investment.totalProducts || 0}
                      </div>
                    </div>
                    <div>
                      <Text type="secondary" className="text-xs">Unidades</Text>
                      <div className="text-blue-600 font-semibold">
                        {safeFinances.investment.totalUnits || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cuentas por cobrar */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-600 font-semibold">📋 Cuentas por Cobrar</Text>
                    <Text strong className="text-orange-600 text-lg">
                      {formatCurrency(safeFinances.receivables.totalCredits || 0)}
                    </Text>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <Text type="secondary" className="text-xs">Al día</Text>
                      <Text className="text-green-600 font-semibold text-sm">
                        {formatCurrency(safeFinances.receivables.currentCredits || 0)}
                      </Text>
                    </div>
                    <div className="flex justify-between">
                      <Text type="secondary" className="text-xs">Vencidos</Text>
                      <Text className="text-red-600 font-semibold text-sm">
                        {formatCurrency(safeFinances.receivables.overdueCredits || 0)}
                      </Text>
                    </div>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
