// src/components/dashboard/ExpiringBatchesAlert.tsx
import React, { useEffect, useState } from 'react';
import { Card, Table, Alert, Tag, Space, Typography, Spin, Badge, Select } from 'antd';
import { 
  WarningOutlined, 
  ClockCircleOutlined,
  DollarOutlined,
  InboxOutlined 
} from '@ant-design/icons';
import productBatchService from '../../services/productBatchService';
import type { ExpiringBatch } from '../../services/productBatchService';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

const ExpiringBatchesAlert: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExpiringBatch[]>([]);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchExpiringBatches();
  }, [days]);

  const fetchExpiringBatches = async () => {
    try {
      setLoading(true);
      const response = await productBatchService.getExpiringBatches(days);
      setData(response);
    } catch (error) {
      console.error('Error al cargar lotes por vencer:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPotentialLoss = data.reduce((sum, item) => sum + item.potentialLoss, 0);
  const totalUnits = data.reduce((sum, item) => sum + item.remainingQty, 0);

  const columns = [
    {
      title: 'Lote #',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <Tag color="orange">#{id}</Tag>,
    },
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'productName',
      width: 200,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Fecha de Vencimiento',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 180,
      render: (date: string) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#fa8c16' }} />
          <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
        </Space>
      ),
    },
    {
      title: 'Días Restantes',
      dataIndex: 'daysUntilExpiry',
      key: 'daysUntilExpiry',
      width: 140,
      align: 'center' as const,
      render: (days: number) => {
        let color = 'orange';
        if (days <= 7) color = 'red';
        else if (days <= 15) color = 'volcano';
        
        return (
          <Badge 
            count={days} 
            style={{ 
              backgroundColor: color === 'red' ? '#ff4d4f' : 
                               color === 'volcano' ? '#ff7a45' : '#fa8c16',
              fontSize: '14px',
              padding: '0 10px'
            }}
          />
        );
      },
    },
    {
      title: 'Stock Restante',
      dataIndex: 'remainingQty',
      key: 'remainingQty',
      width: 130,
      align: 'center' as const,
      render: (qty: number) => (
        <Tag color="blue" icon={<InboxOutlined />} style={{ fontSize: '13px' }}>
          {qty} unidades
        </Tag>
      ),
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 130,
      align: 'right' as const,
      render: (cost: number) => (
        <Text style={{ color: '#1890ff' }}>
          ${cost.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Pérdida Potencial',
      dataIndex: 'potentialLoss',
      key: 'potentialLoss',
      width: 150,
      align: 'right' as const,
      render: (loss: number, record: ExpiringBatch) => {
        const isUrgent = record.daysUntilExpiry <= 7;
        return (
          <Text 
            strong 
            style={{ 
              color: isUrgent ? '#ff4d4f' : '#fa8c16',
              fontSize: isUrgent ? '15px' : '14px'
            }}
          >
            ${loss.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: 'Urgencia',
      key: 'urgency',
      width: 100,
      align: 'center' as const,
      render: (record: ExpiringBatch) => {
        if (record.daysUntilExpiry <= 7) {
          return <Tag color="error">URGENTE</Tag>;
        } else if (record.daysUntilExpiry <= 15) {
          return <Tag color="warning">ALTA</Tag>;
        } else {
          return <Tag color="default">MEDIA</Tag>;
        }
      },
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <WarningOutlined style={{ fontSize: '20px', color: '#fa8c16' }} />
          <span>Lotes Próximos a Vencer</span>
        </Space>
      }
      extra={
        <Space>
          <Text>Mostrar lotes que vencen en:</Text>
          <Select value={days} onChange={setDays} style={{ width: 120 }}>
            <Option value={7}>7 días</Option>
            <Option value={15}>15 días</Option>
            <Option value={30}>30 días</Option>
            <Option value={60}>60 días</Option>
            <Option value={90}>90 días</Option>
          </Select>
        </Space>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando lotes..." />
        </div>
      ) : (
        <>
          {data.length > 0 ? (
            <>
              {/* Alerta general */}
              <Alert
                message={`⚠️ ${data.length} lote${data.length > 1 ? 's' : ''} próximo${data.length > 1 ? 's' : ''} a vencer`}
                description={
                  <div>
                    <p>
                      Se detectaron <strong>{data.length}</strong> lote{data.length > 1 ? 's' : ''} con{' '}
                      <strong>{totalUnits}</strong> unidades que vencen en los próximos{' '}
                      <strong>{days}</strong> días.
                    </p>
                    <p style={{ marginBottom: 0 }}>
                      <DollarOutlined /> Pérdida potencial total:{' '}
                      <Text strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
                        ${totalPotentialLoss.toLocaleString()}
                      </Text>
                    </p>
                  </div>
                }
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {/* Tabla de lotes */}
              <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                size="middle"
                rowClassName={(record) => {
                  if (record.daysUntilExpiry <= 7) return 'expiring-urgent';
                  if (record.daysUntilExpiry <= 15) return 'expiring-high';
                  return '';
                }}
              />

              <style>
                {`
                  .expiring-urgent {
                    background-color: #fff1f0 !important;
                  }
                  .expiring-high {
                    background-color: #fff7e6 !important;
                  }
                `}
              </style>
            </>
          ) : (
            <Alert
              message="✅ No hay lotes próximos a vencer"
              description={`No se encontraron lotes que venzan en los próximos ${days} días.`}
              type="success"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}
    </Card>
  );
};

export default ExpiringBatchesAlert;
