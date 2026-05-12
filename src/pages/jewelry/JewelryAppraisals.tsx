// src/pages/jewelry/JewelryAppraisals.tsx
import React from 'react';
import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import { PlusOutlined, SafetyOutlined } from '@ant-design/icons';
import { FeatureGuard } from '../../components/common/FeatureGuard';

const { Title, Paragraph } = Typography;

/**
 * Página de Valuaciones de Joyería
 * Solo visible para usuarios con feature JEWELRY_APPRAISAL
 */
const JewelryAppraisals: React.FC = () => {
  // Datos de ejemplo
  const mockData = [
    {
      key: '1',
      id: 'VAL-001',
      cliente: 'Ana Martínez',
      articulo: 'Collar con diamantes',
      valorEstimado: '$5,000,000',
      estado: 'Completado',
      fecha: '2026-05-08',
    },
    {
      key: '2',
      id: 'VAL-002',
      cliente: 'Carlos López',
      articulo: 'Reloj de oro',
      valorEstimado: '$8,500,000',
      estado: 'En revisión',
      fecha: '2026-05-11',
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Cliente',
      dataIndex: 'cliente',
      key: 'cliente',
    },
    {
      title: 'Artículo',
      dataIndex: 'articulo',
      key: 'articulo',
    },
    {
      title: 'Valor Estimado',
      dataIndex: 'valorEstimado',
      key: 'valorEstimado',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const color = estado === 'Completado' ? 'green' : 'blue';
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: () => (
        <Space>
          <Button size="small" type="link">Ver</Button>
          <Button size="small" type="link">Imprimir</Button>
        </Space>
      ),
    },
  ];

  return (
    <FeatureGuard feature="JEWELRY_APPRAISAL">
      <div style={{ padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>
                  <SafetyOutlined /> Valuaciones de Joyería
                </Title>
                <Paragraph>
                  Gestiona las valuaciones y tasaciones de artículos de joyería
                </Paragraph>
              </div>
              <Button type="primary" icon={<PlusOutlined />}>
                Nueva Valuación
              </Button>
            </div>

            <Table
              columns={columns}
              dataSource={mockData}
              pagination={{ pageSize: 10 }}
            />
          </Space>
        </Card>
      </div>
    </FeatureGuard>
  );
};

export default JewelryAppraisals;
