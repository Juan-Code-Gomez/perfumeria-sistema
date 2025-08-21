// src/pages/ExecutiveDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Spin,
  Alert,
  Typography,
  Table,
  Badge,
  Button,
  Space,
  Divider
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExclamationCircleOutlined,
  WarningOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  TeamOutlined,
  StockOutlined,
  ReloadOutlined,
  BankOutlined
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
      total: number;
      lastUpdate: string | null;
    };
    cashFlow: {
      income: number;
      expenses: number;
      netFlow: number;
    };
    accounts: {
      receivable: number;
      payable: number;
      netPosition: number;
    };
  };
  alerts: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    data?: any;
  }>;
  metadata: {
    generatedAt: string;
    period: {
      today: string;
      month: string;
    };
  };
}

const ExecutiveDashboard: React.FC = () => {
  const [data, setData] = useState<ExecutiveSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/dashboard/executive-summary");
      
      // Extraer los datos correctamente según la estructura del backend
      // El backend envuelve la respuesta con { success: true, data: ..., timestamp: ... }
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
    // Auto-refresh cada 5 minutos
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  const { kpis, charts, finances, alerts } = data;

  // Valores por defecto seguros con validación
  const safeKpis = {
    today: {
      sales: kpis?.today?.sales || 0,
      expenses: kpis?.today?.expenses || 0,
      profit: kpis?.today?.profit || 0,
      transactions: kpis?.today?.transactions || 0,
      cashInRegister: kpis?.today?.cashInRegister || 0
    },
    month: {
      sales: kpis?.month?.sales || 0,
      expenses: kpis?.month?.expenses || 0,
      profit: kpis?.month?.profit || 0,
      transactions: kpis?.month?.transactions || 0,
      salesGrowth: kpis?.month?.salesGrowth || 0,
      expenseGrowth: kpis?.month?.expenseGrowth || 0
    }
  };

  const safeCharts = {
    salesTrend: charts?.salesTrend || [],
    topProducts: charts?.topProducts || [],
    paymentMethods: charts?.paymentMethods || {
      efectivo: 0,
      tarjeta: 0,
      transferencia: 0,
      credito: 0
    },
    expensesByCategory: charts?.expensesByCategory || {}
  };

  const safeFinances = {
    investment: {
      totalInvestment: finances?.investment?.totalInvestment || 0,
      totalProducts: finances?.investment?.totalProducts || 0,
      totalUnits: finances?.investment?.totalUnits || 0
    },
    capital: {
      cash: finances?.capital?.cash || 0,
      bank: finances?.capital?.bank || 0,
      total: finances?.capital?.total || 0,
      lastUpdate: finances?.capital?.lastUpdate || null
    },
    cashFlow: {
      income: finances?.cashFlow?.income || 0,
      expenses: finances?.cashFlow?.expenses || 0,
      netFlow: finances?.cashFlow?.netFlow || 0
    },
    accounts: {
      receivable: finances?.accounts?.receivable || 0,
      payable: finances?.accounts?.payable || 0,
      netPosition: finances?.accounts?.netPosition || 0
    }
  };

  const safeAlerts = alerts || [];

  // Colores para gráficos
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Formatear moneda
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  // Preparar datos para gráfico de métodos de pago
  const paymentMethodData = Object.entries(safeCharts.paymentMethods)
    .filter(([_, amount]) => amount > 0) // Filtrar métodos con valor 0
    .map(([method, amount]) => ({
      name: method.charAt(0).toUpperCase() + method.slice(1),
      value: amount,
      percentage: ((amount / Object.values(safeCharts.paymentMethods).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    }));

  // Preparar datos para gráfico de gastos por categoría
  const expenseData = Object.entries(safeCharts.expensesByCategory)
    .filter(([_, amount]) => amount > 0) // Filtrar categorías con valor 0
    .map(([category, amount]) => ({
      name: category,
      value: amount
    }));

  // Columnas para tabla de productos top
  const productColumns = [
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'name',
      render: (text: string, record: any) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.product.category?.name || 'Sin categoría'}
          </Text>
        </div>
      ),
    },
    {
      title: 'Vendidos',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      render: (qty: number) => <Badge count={qty} style={{ backgroundColor: '#52c41a' }} />
    },
    {
      title: 'Ingresos',
      dataIndex: 'revenue',
      key: 'revenue',
      align: 'right' as const,
      render: (revenue: number) => <Text strong>{formatCurrency(revenue)}</Text>
    }
  ];

  // Obtener color de alerta según severidad
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'stock': return <StockOutlined />;
      case 'credits': return <TeamOutlined />;
      case 'cash_closing': return <DollarOutlined />;
      default: return <ExclamationCircleOutlined />;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={2} className="mb-0">Dashboard Ejecutivo</Title>
          <Text type="secondary">
            Última actualización: {dayjs(lastUpdate).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadDashboardData}
          loading={loading}
        >
          Actualizar
        </Button>
      </div>

      {/* Alertas */}
      {safeAlerts.length > 0 && (
        <Row className="mb-6">
          <Col span={24}>
            <Card title={<><WarningOutlined /> Alertas Importantes</>} size="small">
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {safeAlerts.map((alert, index) => (
                  <Alert
                    key={index}
                    message={alert.message}
                    type={getAlertColor(alert.severity)}
                    icon={getAlertIcon(alert.type)}
                    banner
                    closable
                  />
                ))}
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* KPIs Principales */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ventas de Hoy"
              value={safeKpis.today.sales}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#3f8600' }} />}
            />
            <div className="mt-2">
              <Text type="secondary">{safeKpis.today.transactions} transacciones</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Gastos de Hoy"
              value={safeKpis.today.expenses}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<ShoppingCartOutlined style={{ color: '#cf1322' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Utilidad de Hoy"
              value={safeKpis.today.profit}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={safeKpis.today.profit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: safeKpis.today.profit >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Caja Actual"
              value={safeKpis.today.cashInRegister}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Inversión en Productos */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Inversión Total en Productos"
              value={safeFinances.investment.totalInvestment}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<StockOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total de Productos"
              value={safeFinances.investment.totalProducts}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total de Unidades en Stock"
              value={safeFinances.investment.totalUnits}
              prefix={<StockOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* Capital Disponible */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Efectivo en Caja"
              value={safeFinances.capital.cash}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Dinero en Banco"
              value={safeFinances.capital.bank}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<BankOutlined style={{ color: '#1890ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Capital Total Disponible"
              value={safeFinances.capital.total}
              formatter={(value) => formatCurrency(Number(value))}
              prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* KPIs del Mes */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Resumen del Mes">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Ventas"
                  value={safeKpis.month.sales}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <div className="flex items-center mt-1">
                  {safeKpis.month.salesGrowth >= 0 ? (
                    <ArrowUpOutlined style={{ color: '#3f8600', fontSize: '12px' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#cf1322', fontSize: '12px' }} />
                  )}
                  <Text 
                    type={safeKpis.month.salesGrowth >= 0 ? 'success' : 'danger'}
                    className="ml-1 text-sm"
                  >
                    {Math.abs(safeKpis.month.salesGrowth).toFixed(1)}%
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Gastos"
                  value={safeKpis.month.expenses}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <div className="flex items-center mt-1">
                  {safeKpis.month.expenseGrowth >= 0 ? (
                    <ArrowUpOutlined style={{ color: '#cf1322', fontSize: '12px' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#3f8600', fontSize: '12px' }} />
                  )}
                  <Text 
                    type={safeKpis.month.expenseGrowth >= 0 ? 'danger' : 'success'}
                    className="ml-1 text-sm"
                  >
                    {Math.abs(safeKpis.month.expenseGrowth).toFixed(1)}%
                  </Text>
                </div>
              </Col>
              <Col span={8}>
                <Statistic
                  title="Utilidad"
                  value={safeKpis.month.profit}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: safeKpis.month.profit >= 0 ? '#3f8600' : '#cf1322' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Flujo de Caja">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Ingresos:</Text>
                <Text strong className="text-green-600">
                  {formatCurrency(safeFinances.cashFlow.income)}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text>Egresos:</Text>
                <Text strong className="text-red-600">
                  {formatCurrency(safeFinances.cashFlow.expenses)}
                </Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text strong>Flujo Neto:</Text>
                <Text 
                  strong 
                  className={safeFinances.cashFlow.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {formatCurrency(safeFinances.cashFlow.netFlow)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Cuentas">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Por Cobrar:</Text>
                <Text strong className="text-blue-600">
                  {formatCurrency(safeFinances.accounts.receivable)}
                </Text>
              </div>
              <div className="flex justify-between">
                <Text>Por Pagar:</Text>
                <Text strong className="text-orange-600">
                  {formatCurrency(safeFinances.accounts.payable)}
                </Text>
              </div>
              <Divider className="my-2" />
              <div className="flex justify-between">
                <Text strong>Posición Neta:</Text>
                <Text 
                  strong 
                  className={safeFinances.accounts.netPosition >= 0 ? 'text-green-600' : 'text-red-600'}
                >
                  {formatCurrency(safeFinances.accounts.netPosition)}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* Tendencia de Ventas */}
        <Col xs={24} lg={12}>
          <Card title="Tendencia de Ventas (7 días)" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={safeCharts.salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  formatter={(value: any) => {
                    // Manejar tanto arrays como valores individuales
                    const actualValue = Array.isArray(value) ? value[0] : value;
                    return [formatCurrency(Number(actualValue)), 'Ventas'];
                  }}
                  labelFormatter={(day, payload) => {
                    if (payload && payload[0]) {
                      return `${day} - ${payload[0].payload.date}`;
                    }
                    return day;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#1890ff" 
                  fill="#1890ff" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Métodos de Pago */}
        <Col xs={24} lg={12}>
          <Card title="Métodos de Pago (Este Mes)" size="small">
            {paymentMethodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: any) => {
                    const actualValue = Array.isArray(value) ? value[0] : value;
                    return formatCurrency(Number(actualValue));
                  }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                No hay datos de métodos de pago para mostrar
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Top Productos */}
        <Col xs={24} lg={12}>
          <Card 
            title={<><TrophyOutlined /> Top Productos del Mes</>} 
            size="small"
          >
            <Table
              dataSource={safeCharts.topProducts}
              columns={productColumns}
              pagination={false}
              size="small"
              rowKey={(record) => record.product.id}
              scroll={{ y: 300 }}
            />
          </Card>
        </Col>

        {/* Gastos por Categoría */}
        <Col xs={24} lg={12}>
          <Card title="Gastos por Categoría (Este Mes)" size="small">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <RechartsTooltip formatter={(value: any) => {
                    const actualValue = Array.isArray(value) ? value[0] : value;
                    return formatCurrency(Number(actualValue));
                  }} />
                  <Bar dataKey="value" fill="#ff7300" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-[300px] text-gray-500">
                No hay datos de gastos para mostrar
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ExecutiveDashboard;
