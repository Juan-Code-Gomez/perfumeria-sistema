// src/pages/Dashboard.tsx
import React, { useEffect } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Spin, 
  DatePicker, 
  message, 
  Typography,
  Space,
  Divider,
  Avatar
} from "antd";
import { 
  DollarOutlined,
  TrophyOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  RiseOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchDashboard } from "../features/dashboard/dashboardSlice";
import InventoryValuationCard from "../components/dashboard/InventoryValuationCard";
import ExpiringBatchesAlert from "../components/dashboard/ExpiringBatchesAlert";

import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, loading, error } = useAppSelector((s) => s.dashboard);

  // Filtros de fecha
  const [dates, setDates] = React.useState<[any, any]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  useEffect(() => {
    dispatch(
      fetchDashboard({
        dateFrom: dates[0].format("YYYY-MM-DD"),
        dateTo: dates[1].format("YYYY-MM-DD"),
      })
    );
  }, [dispatch, dates]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading || !summary)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  
  if (error) message.error(error);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Title level={2} className="mb-2 text-gray-800">
              Dashboard Ejecutivo
            </Title>
            <Text type="secondary" className="text-lg">
              Resumen general de tu perfumería
            </Text>
          </div>
          <div className="text-right">
            <Text type="secondary" className="block text-sm">
              Última actualización
            </Text>
            <Text strong className="text-gray-600">
              {dayjs().format('DD/MM/YYYY HH:mm')}
            </Text>
          </div>
        </div>

        {/* Date Filter Section */}
        <Card className="shadow-sm border-0">
          <div className="flex items-center gap-3">
            <CalendarOutlined className="text-blue-500 text-lg" />
            <Text strong className="text-gray-700">Período de análisis:</Text>
            <RangePicker
              value={dates}
              onChange={(val) => {
                if (val) setDates(val as [any, any]);
              }}
              allowClear={false}
              format="DD/MM/YYYY"
              className="shadow-sm"
            />
          </div>
        </Card>
      </div>

      {/* Main KPIs Section */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700 flex items-center gap-2">
          <RiseOutlined className="text-green-500" />
          Indicadores Principales
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card 
              className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                  title={<span className="text-white opacity-90">Total Ventas</span>}
                  value={summary.totalSales}
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
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={<TrophyOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Utilidad Total</span>}
                  value={summary.totalProfit}
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
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
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
                  title={<span className="text-white opacity-90">Total Egresos</span>}
                  value={summary.totalExpenses}
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
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white'
              }}
            >
              <div className="text-center">
                <Avatar 
                  size={48} 
                  icon={<WalletOutlined />} 
                  className="mb-3"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <Statistic
                  title={<span className="text-white opacity-90">Cierre de Caja</span>}
                  value={summary.cashClosing || 0}
                  formatter={(value) => formatCurrency(Number(value))}
                  valueStyle={{ color: 'white', fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Summary Analysis Section */}
      <div className="mb-8">
        <Title level={4} className="mb-4 text-gray-700">
          Análisis del Período
        </Title>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">
                📊 Resumen Financiero
              </Title>
              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <Text className="text-gray-600">Ingresos Totales</Text>
                  <Text strong className="text-green-600 text-lg">
                    {formatCurrency(summary.totalSales)}
                  </Text>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <Text className="text-gray-600">Egresos Totales</Text>
                  <Text strong className="text-red-600 text-lg">
                    {formatCurrency(summary.totalExpenses)}
                  </Text>
                </div>
                <Divider className="my-3" />
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <Text className="text-gray-600 font-semibold">Balance Neto</Text>
                  <Text 
                    strong 
                    className={`text-lg ${
                      (summary.totalSales - summary.totalExpenses) >= 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(summary.totalSales - summary.totalExpenses)}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card className="shadow-lg border-0">
              <Title level={5} className="mb-4 text-gray-600">
                💡 Información Adicional
              </Title>
              <Space direction="vertical" size="middle" className="w-full">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                  <Text className="text-gray-600 block mb-2">
                    📅 Período Analizado
                  </Text>
                  <Text strong className="text-gray-800">
                    {dates[0].format('DD/MM/YYYY')} - {dates[1].format('DD/MM/YYYY')}
                  </Text>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <Text className="text-gray-600 block mb-2">
                    🎯 Margen de Utilidad
                  </Text>
                  <Text strong className="text-gray-800 text-lg">
                    {summary.totalSales > 0 
                      ? ((summary.totalProfit / summary.totalSales) * 100).toFixed(1) 
                      : 0}%
                  </Text>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <Text className="text-gray-600 block mb-2">
                    💰 Estado de Caja
                  </Text>
                  <Text strong className="text-gray-800">
                    {summary.cashClosing > 0 ? 'Positivo' : 'Revisar'}
                  </Text>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Sistema de Lotes FIFO - Alertas de Vencimiento */}
      <div className="mb-6">
        <ExpiringBatchesAlert />
      </div>

      {/* Sistema de Lotes FIFO - Valuación del Inventario */}
      <div className="mb-6">
        <InventoryValuationCard />
      </div>

      {/* Future Features Placeholder */}
      <div className="mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-center py-8">
            <Title level={4} className="text-gray-600 mb-2">
              📈 Próximamente
            </Title>
            <Text type="secondary" className="text-base">
              Gráficos de tendencias, productos más vendidos y alertas inteligentes
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
