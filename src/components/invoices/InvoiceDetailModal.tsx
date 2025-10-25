// src/components/invoices/InvoiceDetailModal.tsx
import React from 'react';
import { Modal, Descriptions, Table, Tag, Space, Typography, Button } from 'antd';
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import type { Invoice, InvoiceItem } from '../../services/invoiceService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface InvoiceDetailModalProps {
  visible: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onOpenPayment?: (invoice: Invoice) => void;
}

const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  visible,
  invoice,
  onClose,
  onOpenPayment,
}) => {
  if (!invoice) return null;

  const remainingAmount = invoice.amount - invoice.paidAmount;

  const columns = [
    {
      title: 'Producto',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Cantidad',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center' as const,
      width: 100,
    },
    {
      title: 'Costo Unitario',
      dataIndex: 'unitCost',
      key: 'unitCost',
      align: 'right' as const,
      width: 120,
      render: (value: number) => `$${Math.round(value || 0).toLocaleString('es-CO')}`,
    },
    {
      title: 'Subtotal',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      align: 'right' as const,
      width: 120,
      render: (value: number, record: InvoiceItem) => 
        `$${Math.round(value || (record.quantity * record.unitCost)).toLocaleString('es-CO')}`,
    },
    {
      title: 'Lote',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
      width: 120,
      render: (value: string) => value || '-',
    },
    {
      title: 'Vencimiento',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
      render: (value: string) => value ? dayjs(value).format('DD/MM/YYYY') : '-',
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Detalle de Factura</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={
        <Space>
          <Button onClick={onClose}>Cerrar</Button>
          {invoice.status !== 'PAID' && onOpenPayment && (
            <Button
              type="primary"
              icon={<WalletOutlined />}
              onClick={() => {
                onOpenPayment(invoice);
                onClose();
              }}
            >
              Registrar Pago / Abono
            </Button>
          )}
        </Space>
      }
      width={1000}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="Número de Factura">
            <strong>{invoice.invoiceNumber}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Estado">
            <Tag color={
              invoice.status === 'PAID' ? 'success' : 
              invoice.status === 'PARTIAL' ? 'processing' : 
              'warning'
            }>
              {invoice.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Proveedor">
            {invoice.Supplier?.name || invoice.supplierName}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Factura">
            {dayjs(invoice.invoiceDate || invoice.createdAt).format('DD/MM/YYYY')}
          </Descriptions.Item>
          {invoice.dueDate && (
            <Descriptions.Item label="Fecha de Vencimiento" span={2}>
              <Text type={dayjs(invoice.dueDate).isBefore(dayjs()) && invoice.status !== 'PAID' ? 'danger' : undefined}>
                {dayjs(invoice.dueDate).format('DD/MM/YYYY')}
                {dayjs(invoice.dueDate).isBefore(dayjs()) && invoice.status !== 'PAID' && (
                  <Tag color="error" style={{ marginLeft: 8 }}>VENCIDA</Tag>
                )}
              </Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Monto Total">
            <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
              ${Math.round(invoice.amount).toLocaleString('es-CO')}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Monto Pagado">
            <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
              ${Math.round(invoice.paidAmount).toLocaleString('es-CO')}
            </Text>
          </Descriptions.Item>
          <Descriptions.Item label="Saldo Pendiente" span={2}>
            <Text strong style={{ fontSize: 18, color: remainingAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
              ${Math.round(remainingAmount).toLocaleString('es-CO')}
            </Text>
            {remainingAmount === 0 && (
              <Tag color="success" style={{ marginLeft: 8 }}>PAGADA</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Inventario Procesado" span={2}>
            {invoice.inventoryProcessed ? (
              <Tag icon={<CheckCircleOutlined />} color="success">
                Sí - Lotes FIFO creados
              </Tag>
            ) : (
              <Tag icon={<ClockCircleOutlined />} color="warning">
                No procesado
              </Tag>
            )}
          </Descriptions.Item>
          {invoice.notes && (
            <Descriptions.Item label="Notas" span={2}>
              {invoice.notes}
            </Descriptions.Item>
          )}
        </Descriptions>

        {invoice.InvoiceItem && invoice.InvoiceItem.length > 0 && (
          <>
            <Title level={5}>Productos</Title>
            <Table
              dataSource={invoice.InvoiceItem}
              columns={columns}
              pagination={false}
              rowKey="id"
              size="small"
            />
          </>
        )}
      </Space>
    </Modal>
  );
};

export default InvoiceDetailModal;
