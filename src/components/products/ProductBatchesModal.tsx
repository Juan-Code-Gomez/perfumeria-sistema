// src/components/products/ProductBatchesModal.tsx
import React, { useEffect, useState } from 'react';
import { Modal, Table, Tag, Statistic, Row, Col, Card, Alert, Spin, Space, Typography } from 'antd';
import { 
  DollarOutlined, 
  InboxOutlined, 
  ShoppingCartOutlined,
  CalendarOutlined,
  BarChartOutlined 
} from '@ant-design/icons';
import productBatchService from '../../services/productBatchService';
import type { ProductBatchesResponse } from '../../services/productBatchService';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface ProductBatchesModalProps {
  visible: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const ProductBatchesModal: React.FC<ProductBatchesModalProps> = ({
  visible,
  onClose,
  productId,
  productName,
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductBatchesResponse | null>(null);

  useEffect(() => {
    if (visible && productId) {
      fetchBatches();
    }
  }, [visible, productId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await productBatchService.getBatchesByProduct(productId);
      setData(response);
    } catch (error) {
      console.error('Error al cargar lotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Lote #',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <Tag color="blue">#{id}</Tag>,
    },
    {
      title: 'Fecha de Compra',
      dataIndex: 'purchaseDate',
      key: 'purchaseDate',
      width: 150,
      render: (date: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(date).format('DD/MM/YYYY')}
        </Space>
      ),
    },
    {
      title: 'Proveedor',
      key: 'supplier',
      width: 180,
      render: (record: any) => record.purchase?.supplier?.name || 'N/A',
    },
    {
      title: 'Cantidad Inicial',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center' as const,
      render: (qty: number) => (
        <Tag color="geekblue" icon={<ShoppingCartOutlined />}>
          {qty}
        </Tag>
      ),
    },
    {
      title: 'Stock Actual',
      dataIndex: 'remainingQty',
      key: 'remainingQty',
      width: 120,
      align: 'center' as const,
      render: (remainingQty: number, record: any) => {
        const percentage = (remainingQty / record.quantity) * 100;
        let color = 'green';
        if (percentage === 0) color = 'red';
        else if (percentage < 30) color = 'orange';
        
        return (
          <Tag color={color} icon={<InboxOutlined />}>
            {remainingQty}
          </Tag>
        );
      },
    },
    {
      title: 'Consumidas',
      key: 'consumed',
      width: 100,
      align: 'center' as const,
      render: (record: any) => {
        const consumed = record.quantity - record.remainingQty;
        return <Text type="secondary">{consumed}</Text>;
      },
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      width: 130,
      align: 'right' as const,
      render: (cost: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          ${cost.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Valor del Lote',
      key: 'totalValue',
      width: 140,
      align: 'right' as const,
      render: (record: any) => {
        const value = record.remainingQty * record.unitCost;
        return (
          <Text strong style={{ color: '#52c41a' }}>
            ${value.toLocaleString()}
          </Text>
        );
      },
    },
    {
      title: 'Estado',
      key: 'status',
      width: 100,
      align: 'center' as const,
      render: (record: any) => {
        if (record.remainingQty === 0) {
          return <Tag color="red">Agotado</Tag>;
        } else if (record.remainingQty < record.quantity * 0.3) {
          return <Tag color="orange">Bajo</Tag>;
        } else {
          return <Tag color="green">Disponible</Tag>;
        }
      },
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <BarChartOutlined />
          <span>Lotes de Inventario - {productName}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={1400}
      footer={null}
      styles={{ body: { maxHeight: '70vh', overflowY: 'auto' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" tip="Cargando lotes..." />
        </div>
      ) : data ? (
        <>
          {/* Resumen de estadísticas */}
          <Card style={{ marginBottom: 24, background: '#fafafa' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total de Lotes"
                  value={data.summary.totalBatches}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Cantidad Total Comprada"
                  value={data.summary.totalQuantity}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Stock Disponible"
                  value={data.summary.totalRemaining}
                  prefix={<InboxOutlined />}
                  valueStyle={{ 
                    color: data.summary.totalRemaining === 0 ? '#ff4d4f' : '#722ed1' 
                  }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Valor del Inventario"
                  value={data.summary.totalValue}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Col>
            </Row>
            <Row gutter={16} style={{ marginTop: 16 }}>
              <Col span={24}>
                <Card size="small" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong style={{ color: '#1890ff' }}>
                      💡 Costo Promedio Ponderado del Inventario Actual:
                    </Text>
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                      ${data.summary.averageCost.toLocaleString(undefined, { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </Title>
                    <Text type="secondary">
                      Calculado sobre {data.summary.totalRemaining} unidades disponibles
                    </Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Información FIFO */}
          {data.batches.length > 0 && (
            <Alert
              message="Sistema FIFO (First In, First Out)"
              description={
                <div>
                  <p>
                    Las ventas consumen <strong>automáticamente</strong> del lote más antiguo primero.
                    El costo de cada venta se calcula basándose en los lotes que se consumen.
                  </p>
                  {data.batches.filter(b => b.remainingQty > 0).length > 0 && (
                    <p style={{ marginBottom: 0 }}>
                      <strong>Próximo lote a consumir:</strong>{' '}
                      Lote #{data.batches.filter(b => b.remainingQty > 0)[0]?.id} -{' '}
                      {data.batches.filter(b => b.remainingQty > 0)[0]?.remainingQty} unidades disponibles @{' '}
                      ${data.batches.filter(b => b.remainingQty > 0)[0]?.unitCost.toLocaleString()}
                    </p>
                  )}
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {/* Tabla de lotes */}
          {data.batches.length > 0 ? (
            <Table
              columns={columns}
              dataSource={data.batches}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
              size="small"
            />
          ) : (
            <Alert
              message="Sin lotes"
              description="Este producto aún no tiene lotes registrados. Los lotes se crean automáticamente al realizar compras."
              type="warning"
              showIcon
              style={{ marginTop: 16 }}
            />
          )}
        </>
      ) : (
        <Alert
          message="No hay datos disponibles"
          type="warning"
          showIcon
        />
      )}
    </Modal>
  );
};

export default ProductBatchesModal;
