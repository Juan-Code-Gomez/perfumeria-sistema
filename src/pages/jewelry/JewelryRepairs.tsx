// src/pages/jewelry/JewelryRepairs.tsx
import React from 'react';
import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import { PlusOutlined, ToolOutlined } from '@ant-design/icons';
import { FeatureGuard } from '../../components/common/FeatureGuard';

const { Title, Paragraph } = Typography;

/**
 * Página de Reparaciones de Joyería
 * Solo visible para usuarios con feature JEWELRY_REPAIRS
 */
const JewelryRepairs: React.FC = () => {
  // Datos de ejemplo
  const mockData = [
    {
      key: '1',
      id: 'REP-001',
      cliente: 'María González',
      articulo: 'Anillo de oro 18K',
      tipo: 'Ajuste de talla',
      estado: 'En proceso',
      fechaIngreso: '2026-05-10',
      fechaPromesa: '2026-05-15',
    },
    {
      key: '2',
      id: 'REP-002',
      cliente: 'Juan Pérez',
      articulo: 'Cadena de plata',
      tipo: 'Soldadura',
      estado: 'Pendiente',
      fechaIngreso: '2026-05-12',
      fechaPromesa: '2026-05-18',
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
      title: 'Tipo de Reparación',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado: string) => {
        const color = estado === 'En proceso' ? 'blue' : estado === 'Completado' ? 'green' : 'orange';
        return <Tag color={color}>{estado}</Tag>;
      },
    },
    {
      title: 'Fecha Ingreso',
      dataIndex: 'fechaIngreso',
      key: 'fechaIngreso',
    },
    {
      title: 'Fecha Promesa',
      dataIndex: 'fechaPromesa',
      key: 'fechaPromesa',
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: () => (
        <Space>
          <Button size="small" type="link">Ver</Button>
          <Button size="small" type="link">Editar</Button>
        </Space>
      ),
    },
  ];

  return (
    <FeatureGuard feature="JEWELRY_REPAIRS">
      <div style={{ padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>
                  <ToolOutlined /> Reparaciones de Joyería
                </Title>
                <Paragraph>
                  Gestiona las reparaciones y trabajos de joyería en proceso
                </Paragraph>
              </div>
              <Button type="primary" icon={<PlusOutlined />}>
                Nueva Reparación
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

export default JewelryRepairs;
