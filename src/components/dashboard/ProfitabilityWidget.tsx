// src/components/dashboard/ProfitabilityWidget.tsx
import React from 'react';
import { Card, Table, Tag, Typography, Space, Avatar, Progress } from 'antd';
import { TrophyOutlined, RiseOutlined, FallOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface ProfitabilityData {
  productId: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  margin: number;
  marginPercentage: number;
  totalSold: number;
  totalProfit: number;
  trend: 'up' | 'down' | 'stable';
}

interface ProfitabilityWidgetProps {
  data: ProfitabilityData[];
  loading?: boolean;
}

export const ProfitabilityWidget: React.FC<ProfitabilityWidgetProps> = ({ 
  data = [], 
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

  const getMarginColor = (percentage: number) => {
    if (percentage >= 50) return '#52c41a'; // Verde
    if (percentage >= 30) return '#faad14'; // Amarillo
    if (percentage >= 15) return '#fa8c16'; // Naranja
    return '#ff4d4f'; // Rojo
  };

  const getMarginStatus = (percentage: number) => {
    if (percentage >= 50) return 'Excelente';
    if (percentage >= 30) return 'Bueno';
    if (percentage >= 15) return 'Regular';
    return 'Bajo';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <RiseOutlined style={{ color: '#52c41a' }} />;
      case 'down': return <FallOutlined style={{ color: '#ff4d4f' }} />;
      default: return <span style={{ color: '#666' }}>–</span>;
    }
  };

  const columns = [
    {
      title: 'Ranking',
      key: 'rank',
      width: 70,
      render: (_: any, __: any, index: number) => (
        <div className="flex items-center">
          <Avatar
            size={32}
            style={{
              backgroundColor: index < 3 ? '#faad14' : '#1890ff',
              color: 'white'
            }}
            icon={index < 3 ? <TrophyOutlined /> : null}
          >
            {index < 3 ? '' : index + 1}
          </Avatar>
        </div>
      ),
    },
    {
      title: 'Producto',
      key: 'product',
      render: (_: any, record: ProfitabilityData) => (
        <div>
          <Text strong className="text-sm">
            {record.name}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.category}
          </Text>
        </div>
      ),
    },
    {
      title: 'Margen',
      key: 'margin',
      align: 'center' as const,
      render: (_: any, record: ProfitabilityData) => (
        <div className="text-center">
          <div className="mb-2">
            <Text 
              strong 
              style={{ color: getMarginColor(record.marginPercentage) }}
            >
              {record.marginPercentage.toFixed(1)}%
            </Text>
          </div>
          <Progress
            percent={Math.min(record.marginPercentage, 100)}
            size="small"
            strokeColor={getMarginColor(record.marginPercentage)}
            showInfo={false}
            style={{ maxWidth: '80px' }}
          />
          <div className="mt-1">
            <Tag 
              color={record.marginPercentage >= 30 ? 'green' : record.marginPercentage >= 15 ? 'orange' : 'red'}
            >
              {getMarginStatus(record.marginPercentage)}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Ganancia Total',
      key: 'profit',
      align: 'right' as const,
      render: (_: any, record: ProfitabilityData) => (
        <div className="text-right">
          <Text 
            strong 
            className="text-green-600"
          >
            {formatCurrency(record.totalProfit)}
          </Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.totalSold} vendidos
          </Text>
        </div>
      ),
    },
    {
      title: 'Tendencia',
      key: 'trend',
      align: 'center' as const,
      render: (_: any, record: ProfitabilityData) => getTrendIcon(record.trend),
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <FireOutlined style={{ color: '#fa8c16' }} />
          <span>Productos Más Rentables</span>
        </Space>
      }
      className="shadow-lg border-0"
      style={{ borderRadius: '16px' }}
      extra={
        <Tag color="gold" className="rounded-md">
          Top Performers
        </Tag>
      }
    >
      <div className="mb-4">
        <Text type="secondary" className="text-sm">
          Análisis de rentabilidad por producto basado en margen de ganancia y volumen de ventas
        </Text>
      </div>
      
      <Table
        dataSource={data.slice(0, 10)} // Top 10
        columns={columns}
        pagination={false}
        size="small"
        loading={loading}
        rowKey="productId"
        scroll={{ x: 'max-content' }}
        className="custom-table"
      />
      
      {data.length > 10 && (
        <div className="mt-4 text-center">
          <Text type="secondary" className="text-sm">
            Mostrando top 10 de {data.length} productos
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ProfitabilityWidget;
