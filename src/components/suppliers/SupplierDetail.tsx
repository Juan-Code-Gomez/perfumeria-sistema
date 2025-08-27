// src/components/suppliers/SupplierDetail.tsx
import React from 'react';
import {
  Descriptions,
  Tag,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  Progress,
} from 'antd';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  StarOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import type { Supplier } from '../../features/suppliers/supplierSlice';

const { Title, Text } = Typography;

interface SupplierDetailProps {
  supplier: Supplier;
}

const SupplierDetail: React.FC<SupplierDetailProps> = ({ supplier }) => {
  const getRatingStars = (rating?: number) => {
    if (!rating) return '-';
    return '⭐'.repeat(rating) + ' ☆'.repeat(5 - rating);
  };

  const getPaymentTermsDisplay = (terms?: string) => {
    const termMap: { [key: string]: string } = {
      'CONTADO': 'Contado',
      '15_DIAS': '15 días',
      '30_DIAS': '30 días',
      '45_DIAS': '45 días',
      '60_DIAS': '60 días',
      '90_DIAS': '90 días',
    };
    return terms ? termMap[terms] || terms : '-';
  };

  const getCreditUsagePercentage = () => {
    if (!supplier.creditLimit || supplier.creditLimit === 0) return 0;
    const debt = supplier.currentDebt || 0;
    return Math.min((debt / supplier.creditLimit) * 100, 100);
  };

  return (
    <div>
      {/* Header del proveedor */}
      <Row align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: supplier.isPreferred ? '#52c41a' : '#1890ff',
              marginRight: 16 
            }}
          />
        </Col>
        <Col flex="auto">
          <Title level={3} style={{ margin: 0 }}>
            {supplier.name}
            {supplier.isPreferred && (
              <Tag color="green" style={{ marginLeft: 12 }}>PREFERIDO</Tag>
            )}
          </Title>
          <Space>
            <Tag color={supplier.isActive ? 'green' : 'red'}>
              {supplier.isActive ? 'ACTIVO' : 'INACTIVO'}
            </Tag>
            {supplier.supplierType && (
              <Tag>{supplier.supplierType}</Tag>
            )}
          </Space>
        </Col>
      </Row>

      {/* Estadísticas rápidas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Deuda Actual"
              value={supplier.currentDebt || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              valueStyle={{ color: (supplier.currentDebt || 0) > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Límite de Crédito"
              value={supplier.creditLimit || 0}
              prefix={<CreditCardOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tiempo de Entrega"
              value={supplier.leadTimeDays || 0}
              suffix="días"
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Calificación"
              value={supplier.rating || 0}
              suffix="/ 5"
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Uso de crédito */}
      {supplier.creditLimit && supplier.creditLimit > 0 && (
        <Card title="Uso de Crédito" style={{ marginBottom: 24 }}>
          <Progress
            percent={getCreditUsagePercentage()}
            status={getCreditUsagePercentage() > 80 ? 'exception' : 'normal'}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary">
              ${(supplier.currentDebt || 0).toLocaleString()} de ${supplier.creditLimit.toLocaleString()} utilizado
            </Text>
          </div>
        </Card>
      )}

      {/* Información detallada */}
      <Card title="Información Detallada">
        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
          <Descriptions.Item label="Nombre" span={2}>
            {supplier.name}
          </Descriptions.Item>
          
          <Descriptions.Item label="NIT / RUT">
            {supplier.nit || '-'}
          </Descriptions.Item>
          
          <Descriptions.Item label="Tipo de Proveedor">
            {supplier.supplierType ? (
              <Tag>{supplier.supplierType}</Tag>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Persona de Contacto">
            {supplier.contactPerson ? (
              <Space>
                <UserOutlined />
                {supplier.contactPerson}
              </Space>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Teléfono">
            {supplier.phone ? (
              <Space>
                <PhoneOutlined />
                {supplier.phone}
              </Space>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Email">
            {supplier.email ? (
              <Space>
                <MailOutlined />
                <a href={`mailto:${supplier.email}`}>{supplier.email}</a>
              </Space>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Dirección" span={2}>
            {supplier.address ? (
              <Space>
                <EnvironmentOutlined />
                {supplier.address}
              </Space>
            ) : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Términos de Pago">
            {getPaymentTermsDisplay(supplier.paymentTerms)}
          </Descriptions.Item>

          <Descriptions.Item label="Calificación">
            {getRatingStars(supplier.rating)}
          </Descriptions.Item>

          <Descriptions.Item label="Estado">
            <Tag color={supplier.isActive ? 'green' : 'red'}>
              {supplier.isActive ? 'ACTIVO' : 'INACTIVO'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Proveedor Preferido">
            <Tag color={supplier.isPreferred ? 'green' : 'default'}>
              {supplier.isPreferred ? 'SÍ' : 'NO'}
            </Tag>
          </Descriptions.Item>

          {supplier.minOrderAmount && (
            <Descriptions.Item label="Pedido Mínimo" span={2}>
              ${supplier.minOrderAmount.toLocaleString()}
            </Descriptions.Item>
          )}

          {supplier.website && (
            <Descriptions.Item label="Sitio Web" span={2}>
              <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                {supplier.website}
              </a>
            </Descriptions.Item>
          )}

          {supplier.notes && (
            <Descriptions.Item label="Notas" span={2}>
              <Text>{supplier.notes}</Text>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="Fecha de Creación">
            {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : '-'}
          </Descriptions.Item>

          <Descriptions.Item label="Última Actualización">
            {supplier.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default SupplierDetail;
