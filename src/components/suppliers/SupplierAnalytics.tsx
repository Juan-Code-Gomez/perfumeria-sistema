// src/components/suppliers/SupplierAnalytics.tsx
import React from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Typography,
  Table,
  List,
  Avatar,
} from 'antd';
import {
  DollarOutlined,
  TrophyOutlined,
  ExclamationCircleOutlined,
  RiseOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { Supplier } from '../../features/suppliers/supplierSlice';

const { Title, Text } = Typography;

interface SupplierAnalyticsProps {
  suppliers: Supplier[];
}

const SupplierAnalytics: React.FC<SupplierAnalyticsProps> = ({ suppliers }) => {
  // Análisis de datos
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.isActive);
  const preferredSuppliers = suppliers.filter(s => s.isPreferred);
  const suppliersWithDebt = suppliers.filter(s => (s.currentDebt || 0) > 0);
  
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.currentDebt || 0), 0);
  const totalCreditLimit = suppliers.reduce((sum, s) => sum + (s.creditLimit || 0), 0);
  
  // Distribución por tipo
  const typeDistribution = suppliers.reduce((acc, supplier) => {
    const type = supplier.supplierType || 'Sin clasificar';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Top proveedores por deuda
  const topDebtors = suppliers
    .filter(s => (s.currentDebt || 0) > 0)
    .sort((a, b) => (b.currentDebt || 0) - (a.currentDebt || 0))
    .slice(0, 5);

  // Columnas para la tabla de distribución por tipo
  const typeColumns = [
    {
      title: 'Tipo de Proveedor',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const emoji = {
          'ESENCIAS': '🌸',
          'FRASCOS': '🍶',
          'ORIGINALES': '💎',
          'LOCIONES': '🧴',
          'CREMAS': '🧴',
          'MIXTO': '🔄',
          'DISTRIBUIDOR': '🚛',
          'FABRICANTE': '🏭',
          'IMPORTADOR': '🌍',
          'LOCAL': '🏪',
        }[type] || '📦';
        return `${emoji} ${type}`;
      },
    },
    {
      title: 'Cantidad',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Porcentaje',
      key: 'percentage',
      render: (_: any, record: any) => {
        const percentage = totalSuppliers > 0 ? ((record.count / totalSuppliers) * 100).toFixed(1) : '0';
        return (
          <div>
            <Progress 
              percent={parseFloat(percentage)} 
              size="small" 
              format={() => `${percentage}%`}
            />
          </div>
        );
      },
    },
  ];

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    key: type,
    type,
    count,
  }));

  return (
    <div>
      {/* Métricas principales */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Eficiencia de Proveedores"
              value={totalSuppliers > 0 ? ((activeSuppliers.length / totalSuppliers) * 100).toFixed(1) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Utilización de Crédito"
              value={totalCreditLimit > 0 ? ((totalDebt / totalCreditLimit) * 100).toFixed(1) : 0}
              suffix="%"
              prefix={<DollarOutlined />}
              valueStyle={{ 
                color: totalCreditLimit > 0 && (totalDebt / totalCreditLimit) > 0.8 ? '#cf1322' : '#1890ff' 
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Proveedores Preferidos"
              value={totalSuppliers > 0 ? ((preferredSuppliers.length / totalSuppliers) * 100).toFixed(1) : 0}
              suffix="%"
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Riesgo de Deuda"
              value={suppliersWithDebt.length}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Análisis detallado */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="📊 Distribución por Tipo" style={{ marginBottom: 16 }}>
            {typeData.length > 0 ? (
              <Table
                dataSource={typeData}
                columns={typeColumns}
                pagination={false}
                size="small"
              />
            ) : (
              <Text type="secondary">No hay datos de proveedores para mostrar.</Text>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="💰 Top Deudores" style={{ marginBottom: 16 }}>
            {topDebtors.length > 0 ? (
              <List
                dataSource={topDebtors}
                renderItem={(supplier) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: '#ff4d4f' }}
                        />
                      }
                      title={supplier.name}
                      description={
                        <div>
                          <Text strong style={{ color: '#ff4d4f' }}>
                            ${(supplier.currentDebt || 0).toLocaleString()}
                          </Text>
                          {supplier.creditLimit && (
                            <div style={{ fontSize: '12px', color: '#999' }}>
                              Límite: ${supplier.creditLimit.toLocaleString()}
                            </div>
                          )}
                        </div>
                      }
                    />
                    <div>
                      {supplier.creditLimit && (
                        <Progress
                          percent={Math.min(
                            ((supplier.currentDebt || 0) / supplier.creditLimit) * 100,
                            100
                          )}
                          size="small"
                          status={
                            (supplier.currentDebt || 0) / supplier.creditLimit > 0.8
                              ? 'exception'
                              : 'normal'
                          }
                        />
                      )}
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Text type="secondary">No hay proveedores con deuda pendiente.</Text>
            )}
          </Card>
        </Col>
      </Row>

      {/* Alertas y recomendaciones */}
      <Row gutter={16}>
        <Col xs={24}>
          <Card title="🚨 Alertas y Recomendaciones">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                    {' '}Proveedores de Alto Riesgo
                  </Title>
                  {suppliersWithDebt.length > 0 ? (
                    <Text type="secondary">
                      {suppliersWithDebt.length} proveedores tienen deuda pendiente.
                      Revisar términos de pago y seguimiento de cobranza.
                    </Text>
                  ) : (
                    <Text type="success">
                      ✅ No hay proveedores con deuda pendiente.
                    </Text>
                  )}
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>
                    <RiseOutlined style={{ color: '#52c41a' }} />
                    {' '}Oportunidades de Mejora
                  </Title>
                  <Text type="secondary">
                    {totalSuppliers > 0 && preferredSuppliers.length < totalSuppliers * 0.3 
                      ? 'Considerar identificar más proveedores estratégicos como preferidos.'
                      : '✅ Buena distribución de proveedores preferidos.'
                    }
                  </Text>
                </div>
              </Col>
              
              <Col xs={24} md={8}>
                <div style={{ marginBottom: 16 }}>
                  <Title level={5}>
                    <TrophyOutlined style={{ color: '#1890ff' }} />
                    {' '}Rendimiento General
                  </Title>
                  <Text type="secondary">
                    {totalSuppliers > 0 && activeSuppliers.length / totalSuppliers > 0.8
                      ? '✅ Excelente ratio de proveedores activos.'
                      : 'Revisar proveedores inactivos y evaluar reactivación.'
                    }
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupplierAnalytics;
