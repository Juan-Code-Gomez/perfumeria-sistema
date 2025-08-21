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
  Avatar
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
  BankOutlined,
  CalendarOutlined,
  RiseOutlined
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
      {/* Header Mejorado */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2 text-gray-800 flex items-center gap-2">
              <RiseOutlined className="text-blue-500" />
              Dashboard Ejecutivo
            </Title>
            <Text type="secondary" className="text-lg">
              Visión completa de tu perfumería en tiempo real
            </Text>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <Button 
                type="primary"
                icon={<ReloadOutlined />} 
                onClick={loadDashboardData}
                loading={loading}
                className="shadow-md"
              >
                Actualizar Datos
              </Button>
            </div>
            <div>
              <Text type="secondary" className="block text-sm">
                <CalendarOutlined className="mr-1" />
                Última actualización
              </Text>
              <Text strong className="text-gray-600">
                {dayjs(lastUpdate).format('DD/MM/YYYY HH:mm')}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas Mejoradas */}
      {safeAlerts.length > 0 && (
        <div className="mb-8">
          <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
            <WarningOutlined className="text-orange-500" />
            Alertas y Notificaciones
          </Title>
          <Card className="shadow-lg border-0">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              {safeAlerts.map((alert, index) => (
                <Alert
                  key={index}
                  message={alert.message}
                  type={getAlertColor(alert.severity)}
                  icon={getAlertIcon(alert.type)}
                  banner
                  closable
                  className="shadow-sm"
                />
              ))}
            </Space>
          </Card>
        </div>
      )}

      {/* KPIs Principales Mejorados */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
          <TrophyOutlined className="text-yellow-500" />
          Métricas de Hoy
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={<DollarOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Ventas de Hoy</span>}
                  value={safeKpis.today.sales}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                />
                <div className="mt-2">
                  <Text className="text-white opacity-80">
                    {safeKpis.today.transactions} transacciones
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={<ShoppingCartOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Gastos de Hoy</span>}
                  value={safeKpis.today.expenses}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: safeKpis.today.profit >= 0 
                  ? 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)'
                  : 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={safeKpis.today.profit >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Utilidad de Hoy</span>}
                  value={safeKpis.today.profit}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={<DollarOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Caja Actual</span>}
                  value={safeKpis.today.cashInRegister}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Inversión en Productos Mejorada */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
          <StockOutlined className="text-blue-500" />
          Inversión en Inventario
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                  <Avatar 
                    size={56} 
                    icon={<StockOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </div>
                <Statistic
                  title="Inversión Total en Productos"
                  value={safeFinances.investment.totalInvestment}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: '#1890ff', fontSize: '20px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg mb-4">
                  <Avatar 
                    size={56} 
                    icon={<TeamOutlined />} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                <Statistic
                  title="Total de Productos"
                  value={safeFinances.investment.totalProducts}
                  valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg mb-4">
                  <Avatar 
                    size={56} 
                    icon={<StockOutlined />} 
                    style={{ backgroundColor: '#faad14' }}
                  />
                </div>
                <Statistic
                  title="Unidades en Stock"
                  value={safeFinances.investment.totalUnits}
                  valueStyle={{ color: '#faad14', fontSize: '20px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Capital Disponible Mejorado */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
          <BankOutlined className="text-green-500" />
          Capital y Liquidez
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="mr-4">
                  <Avatar 
                    size={48} 
                    icon={<DollarOutlined />} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                <div className="flex-1">
                  <Statistic
                    title="Efectivo en Caja"
                    value={safeFinances.capital.cash}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: '#52c41a', fontSize: '18px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center">
                <div className="mr-4">
                  <Avatar 
                    size={48} 
                    icon={<BankOutlined />} 
                    style={{ backgroundColor: '#1890ff' }}
                  />
                </div>
                <div className="flex-1">
                  <Statistic
                    title="Dinero en Banco"
                    value={safeFinances.capital.bank}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: '#1890ff', fontSize: '18px', fontWeight: 'bold' }}
                  />
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                border: '2px solid #52c41a'
              }}
            >
              <div className="flex items-center">
                <div className="mr-4">
                  <Avatar 
                    size={48} 
                    icon={<DollarOutlined />} 
                    style={{ backgroundColor: '#52c41a' }}
                  />
                </div>
                <div className="flex-1">
                  <Statistic
                    title="Capital Total Disponible"
                    value={safeFinances.capital.total}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
                  />
                  {safeFinances.capital.lastUpdate && (
                    <div className="mt-1">
                      <Text type="secondary" className="text-xs">
                        Actualizado: {dayjs(safeFinances.capital.lastUpdate).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* KPIs del Mes Mejorados */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700">
          📊 Resumen del Mes Actual
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">Métricas Mensuales</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="Ventas"
                    value={safeKpis.month.sales}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <div className="flex items-center mt-1">
                    {safeKpis.month.salesGrowth >= 0 ? (
                      <ArrowUpOutlined className="text-green-500 mr-1" />
                    ) : (
                      <ArrowDownOutlined className="text-red-500 mr-1" />
                    )}
                    <Text className={safeKpis.month.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
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
                      <ArrowUpOutlined className="text-red-500 mr-1" />
                    ) : (
                      <ArrowDownOutlined className="text-green-500 mr-1" />
                    )}
                    <Text className={safeKpis.month.expenseGrowth >= 0 ? 'text-red-600' : 'text-green-600'}>
                      {Math.abs(safeKpis.month.expenseGrowth).toFixed(1)}%
                    </Text>
                  </div>
                </Col>
                <Col span={8}>
                  <Statistic
                    title="Utilidad"
                    value={safeKpis.month.profit}
                    formatter={(value) => formatCurrency(Number(value))}
                    valueStyle={{ 
                      color: safeKpis.month.profit >= 0 ? '#3f8600' : '#cf1322' 
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          
          <Col xs={24} lg={16}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">📈 Tendencia de Ventas (Últimos 7 días)</Title>
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safeCharts.salesTrend.slice(-7)}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1890ff" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <RechartsTooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      labelFormatter={(label) => `Día: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#1890ff" 
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Análisis de Ventas y Productos */}
      <div className="mb-8">
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">🏆 Productos Más Vendidos</Title>
              <Table
                columns={productColumns}
                dataSource={safeCharts.topProducts.slice(0, 5)}
                pagination={false}
                size="small"
                rowKey={(record) => record.product.id}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">💳 Métodos de Pago</Title>
              {paymentMethodData.length > 0 ? (
                <div style={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentMethodData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {paymentMethodData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text type="secondary">No hay datos de métodos de pago disponibles</Text>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Análisis Financiero Final */}
      {expenseData.length > 0 && (
        <div className="mb-8">
          <Card className="shadow-lg border-0">
            <Title level={5} className="mb-4 text-gray-600">💰 Gastos por Categoría</Title>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                  />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" fill="#ff7875" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExecutiveDashboard;
