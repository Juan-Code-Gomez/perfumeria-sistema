// src/pages/jewelry/JewelryCertificates.tsx
import React from 'react';
import { Card, Table, Button, Space, Tag, Typography } from 'antd';
import { PlusOutlined, SafetyCertificateOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { FeatureGuard } from '../../components/common/FeatureGuard';

const { Title, Paragraph } = Typography;

/**
 * Página de Certificados de Joyería
 * Solo visible para usuarios con feature CERTIFICATE_MANAGEMENT
 */
const JewelryCertificates: React.FC = () => {
  // Datos de ejemplo
  const mockData = [
    {
      key: '1',
      id: 'CERT-001',
      producto: 'Anillo con diamante 1.5ct',
      certificado: 'GIA-123456789',
      tipo: 'Diamante',
      claridad: 'VVS1',
      color: 'D',
      quilates: '1.5',
      fecha: '2026-05-01',
    },
    {
      key: '2',
      id: 'CERT-002',
      producto: 'Collar de oro 18K',
      certificado: 'IGI-987654321',
      tipo: 'Oro',
      claridad: '-',
      color: '-',
      quilates: '18K',
      fecha: '2026-05-05',
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Producto',
      dataIndex: 'producto',
      key: 'producto',
    },
    {
      title: 'Número de Certificado',
      dataIndex: 'certificado',
      key: 'certificado',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
    },
    {
      title: 'Claridad',
      dataIndex: 'claridad',
      key: 'claridad',
    },
    {
      title: 'Color',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Quilates',
      dataIndex: 'quilates',
      key: 'quilates',
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
          <Button size="small" type="link" icon={<EyeOutlined />}>Ver</Button>
          <Button size="small" type="link" icon={<DownloadOutlined />}>PDF</Button>
        </Space>
      ),
    },
  ];

  return (
    <FeatureGuard feature="CERTIFICATE_MANAGEMENT">
      <div style={{ padding: '24px' }}>
        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Title level={2}>
                  <SafetyCertificateOutlined /> Certificados de Joyería
                </Title>
                <Paragraph>
                  Gestiona los certificados de autenticidad de diamantes y piedras preciosas
                </Paragraph>
              </div>
              <Button type="primary" icon={<PlusOutlined />}>
                Nuevo Certificado
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

export default JewelryCertificates;
