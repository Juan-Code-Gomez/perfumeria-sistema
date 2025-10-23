// src/components/dashboard/InventoryValuationCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Table, Statistic, Space, Typography, Spin, Alert, Tag } from 'antd';
import { 
  DollarOutlined, 
  InboxOutlined, 
  BarChartOutlined,
  RiseOutlined 
} from '@ant-design/icons';
import productBatchService from '../../services/productBatchService';
import type { InventoryValuation } from '../../services/productBatchService';

const { Text } = Typography;

const InventoryValuationCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<InventoryValuation[]>([]);

  useEffect(() => {
    fetchValuation();
  }, []);

  const fetchValuation = async () => {
    try {
      setLoading(true);
      const response = await productBatchService.getInventoryValuation();
      setData(response);
    } catch (error) {
      console.error('Error al cargar valuación del inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0);
  const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0);

  const columns = [
    {
      title: 'Producto',
      dataIndex: ['product', 'name'],
      key: 'productName',
      width: 250,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Cantidad',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      width: 120,
      align: 'center' as const,
      render: (qty: number) => (
        <Tag color="blue" icon={<InboxOutlined />}>
          {qty}
        </Tag>
      ),
    },
    {
      title: 'Costo Promedio',
      dataIndex: 'averageCost',
      key: 'averageCost',
      width: 150,
      align: 'right' as const,
      render: (cost: number) => (
        <Text style={{ color: '#1890ff' }}>
          ${cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Valor Total',
      dataIndex: 'totalValue',
      key: 'totalValue',
      width: 150,
      align: 'right' as const,
      render: (value: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>
          ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: '% del Total',
      key: 'percentage',
      width: 120,
      align: 'center' as const,
      render: (record: InventoryValuation) => {
        const percentage = ((record.totalValue / totalValue) * 100).toFixed(1);
        return (
          <Tag color="purple" icon={<RiseOutlined />}>
            {percentage}%
          </Tag>
        );
      },
    },
  ];

  return (
    <Card 
      title={
        <Space>
          <DollarOutlined style={{ fontSize: '20px', color: '#1890ff' }} />
          <span>Valuación del Inventario (FIFO)</span>
        </Space>
      }
      extra={
        <Tag color="success" style={{ fontSize: '14px', padding: '4px 12px' }}>
          Sistema de Lotes Activo
        </Tag>
      }
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando valuación..." />
        </div>
      ) : data.length > 0 ? (
        <>
          {/* Resumen general */}
          <div style={{ 
            marginBottom: 24, 
            padding: '20px', 
            background: '#f0f5ff',
            borderRadius: '8px',
            border: '1px solid #d6e4ff'
          }}>
            <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
              <Statistic
                title="Valor Total del Inventario"
                value={totalValue}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '28px' }}
                formatter={(value) => `$${Number(value).toLocaleString(undefined, { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}`}
              />
              <Statistic
                title="Total de Productos"
                value={data.length}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '28px' }}
              />
              <Statistic
                title="Cantidad Total de Unidades"
                value={totalQuantity}
                prefix={<InboxOutlined />}
                valueStyle={{ color: '#722ed1', fontSize: '28px' }}
              />
            </Space>
          </div>

          {/* Información del sistema FIFO */}
          <Alert
            message="Valuación basada en Sistema FIFO"
            description="El valor del inventario se calcula utilizando el costo real de cada lote. Los costos mostrados reflejan el promedio ponderado de los lotes actuales disponibles para cada producto."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          {/* Tabla de productos */}
          <Table
            columns={columns}
            dataSource={data}
            rowKey="productId"
            pagination={{ pageSize: 10, showSizeChanger: true }}
            size="middle"
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ background: '#fafafa' }}>
                  <Table.Summary.Cell index={0}>
                    <Text strong style={{ fontSize: '15px' }}>TOTALES</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align="center">
                    <Tag color="blue" icon={<InboxOutlined />} style={{ fontSize: '14px' }}>
                      {totalQuantity}
                    </Tag>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align="right">
                    -
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong style={{ color: '#52c41a', fontSize: '16px' }}>
                      ${totalValue.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="center">
                    <Tag color="purple" style={{ fontSize: '14px' }}>100%</Tag>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </>
      ) : (
        <Alert
          message="Sin datos de inventario"
          description="No hay productos con lotes registrados. Los lotes se crean automáticamente al realizar compras."
          type="warning"
          showIcon
        />
      )}
    </Card>
  );
};

export default InventoryValuationCard;
