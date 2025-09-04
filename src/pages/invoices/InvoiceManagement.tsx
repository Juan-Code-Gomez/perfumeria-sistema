// src/pages/invoices/InvoiceManagement.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Space,
  Typography,
  Statistic,
  Row,
  Col,
  message,
  Tag,
  Popconfirm,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DollarOutlined,
  FileTextOutlined,
  ReloadOutlined,
  PayCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { usePermissions } from '../../hooks/usePermissions';
import {
  fetchInvoices,
  fetchInvoiceSummary,
  createInvoice,
  updateInvoice,
  payInvoice,
  deleteInvoice,
  clearError,
} from '../../features/invoices/invoiceSlice';
import type { Invoice, CreateInvoiceData, UpdateInvoiceData } from '../../services/invoiceService';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface InvoiceFormData {
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paidAmount?: number;
  description?: string;
  invoiceDate: dayjs.Dayjs;
  dueDate?: dayjs.Dayjs;
}

interface PaymentFormData {
  amount: number;
  description?: string;
}

const InvoiceManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, summary, loading, error } = useAppSelector((state) => state.invoices);
  const { hasPermission } = usePermissions();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  const [paymentForm] = Form.useForm();

  useEffect(() => {
    dispatch(fetchInvoices({}));
    dispatch(fetchInvoiceSummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const filters: any = {};
    
    switch (key) {
      case 'pending':
        filters.status = 'PENDING';
        break;
      case 'partial':
        filters.status = 'PARTIAL';
        break;
      case 'paid':
        filters.status = 'PAID';
        break;
      case 'overdue':
        filters.overdue = true;
        break;
      default:
        break;
    }
    
    dispatch(fetchInvoices(filters));
  };

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item: Invoice) => {
    setEditingItem(item);
    form.setFieldsValue({
      invoiceNumber: item.invoiceNumber,
      supplierName: item.supplierName,
      amount: item.amount,
      paidAmount: item.paidAmount,
      description: item.description,
      invoiceDate: dayjs(item.invoiceDate),
      dueDate: item.dueDate ? dayjs(item.dueDate) : undefined,
    });
    setModalVisible(true);
  };

  const handlePay = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    const pendingAmount = invoice.amount - invoice.paidAmount;
    paymentForm.setFieldsValue({
      amount: pendingAmount,
      description: `Pago factura ${invoice.invoiceNumber}`,
    });
    setPaymentModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteInvoice(id)).unwrap();
      message.success('Factura eliminada exitosamente');
      dispatch(fetchInvoiceSummary());
    } catch (error) {
      message.error('Error al eliminar la factura');
    }
  };

  const handleSubmit = async (values: InvoiceFormData) => {
    try {
      const submitData: CreateInvoiceData | UpdateInvoiceData = {
        invoiceNumber: values.invoiceNumber,
        supplierName: values.supplierName,
        amount: values.amount,
        paidAmount: values.paidAmount || 0,
        description: values.description,
        invoiceDate: values.invoiceDate.toISOString(),
        dueDate: values.dueDate?.toISOString(),
      };

      if (editingItem) {
        await dispatch(updateInvoice({ id: editingItem.id, data: submitData })).unwrap();
        message.success('Factura actualizada exitosamente');
      } else {
        await dispatch(createInvoice(submitData as CreateInvoiceData)).unwrap();
        message.success('Factura creada exitosamente');
      }
      
      setModalVisible(false);
      dispatch(fetchInvoiceSummary());
    } catch (error) {
      message.error('Error al guardar la factura');
    }
  };

  const handlePaymentSubmit = async (values: PaymentFormData) => {
    if (!payingInvoice) return;

    try {
      await dispatch(payInvoice({ 
        id: payingInvoice.id, 
        data: values 
      })).unwrap();
      
      message.success('Pago registrado exitosamente');
      setPaymentModalVisible(false);
      dispatch(fetchInvoiceSummary());
      handleTabChange(activeTab); // Refresh current tab
    } catch (error) {
      message.error('Error al registrar el pago');
    }
  };

  const handleRefresh = () => {
    handleTabChange(activeTab);
    dispatch(fetchInvoiceSummary());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'orange', text: 'Pendiente' },
      PARTIAL: { color: 'blue', text: 'Parcial' },
      PAID: { color: 'green', text: 'Pagada' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const isOverdue = (invoice: Invoice) => {
    if (!invoice.dueDate || invoice.status === 'PAID') return false;
    return dayjs().isAfter(dayjs(invoice.dueDate));
  };

  const columns = [
    {
      title: 'N° Factura',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text: string, record: Invoice) => (
        <div>
          <Text strong>{text}</Text>
          {isOverdue(record) && (
            <div>
              <Tag color="red">
                <ExclamationCircleOutlined /> Vencida
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Proveedor',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: 'Monto Total',
      dataIndex: 'amount',
      key: 'amount',
      render: (value: number) => formatCurrency(value),
      sorter: (a: Invoice, b: Invoice) => a.amount - b.amount,
    },
    {
      title: 'Monto Pagado',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (value: number) => (
        <Text style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </Text>
      ),
      sorter: (a: Invoice, b: Invoice) => a.paidAmount - b.paidAmount,
    },
    {
      title: 'Saldo Pendiente',
      key: 'pending',
      render: (record: Invoice) => {
        const pending = record.amount - record.paidAmount;
        return (
          <Text style={{ color: pending > 0 ? '#cf1322' : '#52c41a' }}>
            {formatCurrency(pending)}
          </Text>
        );
      },
      sorter: (a: Invoice, b: Invoice) => 
        (a.amount - a.paidAmount) - (b.amount - b.paidAmount),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
      filters: [
        { text: 'Pendiente', value: 'PENDING' },
        { text: 'Parcial', value: 'PARTIAL' },
        { text: 'Pagada', value: 'PAID' },
      ],
    },
    {
      title: 'Fecha Factura',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: Invoice, b: Invoice) => 
        dayjs(a.invoiceDate).unix() - dayjs(b.invoiceDate).unix(),
    },
    {
      title: 'Fecha Vencimiento',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: Invoice) => (
        <Space>
          {record.status !== 'PAID' && (
            <Button
              type="link"
              icon={<PayCircleOutlined />}
              onClick={() => handlePay(record)}
              size="small"
            >
              Pagar
            </Button>
          )}
          {hasPermission('facturas', 'edit') && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              size="small"
            >
              Editar
            </Button>
          )}
          {hasPermission('facturas', 'delete') && (
            <Popconfirm
              title="¿Está seguro de eliminar esta factura?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                size="small"
              >
                Eliminar
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          Gestión de Facturas
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Nueva Factura
          </Button>
        </Space>
      </div>

      {/* Resumen de Facturas */}
      {summary && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Facturas"
                value={summary.total.amount}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<FileTextOutlined />}
              />
              <Text type="secondary">{summary.total.count} facturas</Text>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Pendientes de Pago"
                value={summary.pending.pending}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: '#faad14' }} />}
              />
              <Text type="secondary">{summary.pending.count} facturas</Text>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Facturas Vencidas"
                value={summary.overdue.pending}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              />
              <Text type="secondary">{summary.overdue.count} facturas</Text>
            </Card>
          </Col>
          <Col xs={24} sm={6}>
            <Card>
              <Statistic
                title="Total Pagado"
                value={summary.total.paid}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs y Tabla */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Todas" key="all" />
          <TabPane tab="Pendientes" key="pending" />
          <TabPane tab="Parciales" key="partial" />
          <TabPane tab="Pagadas" key="paid" />
          <TabPane tab="Vencidas" key="overdue" />
        </Tabs>

        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} facturas`,
          }}
        />
      </Card>

      {/* Modal de Formulario de Factura */}
      <Modal
        title={editingItem ? 'Editar Factura' : 'Nueva Factura'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Número de Factura"
                name="invoiceNumber"
                rules={[
                  { required: true, message: 'El número de factura es requerido' },
                ]}
              >
                <Input placeholder="Ej: FAC-001" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Proveedor"
                name="supplierName"
                rules={[
                  { required: true, message: 'El nombre del proveedor es requerido' },
                ]}
              >
                <Input placeholder="Nombre del proveedor" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Monto Total"
                name="amount"
                rules={[
                  { required: true, message: 'El monto total es requerido' },
                  { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Monto de la factura"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Monto Pagado"
                name="paidAmount"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Monto ya pagado (opcional)"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  precision={2}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Fecha de Factura"
                name="invoiceDate"
                rules={[
                  { required: true, message: 'La fecha de factura es requerida' },
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Fecha de Vencimiento"
                name="dueDate"
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Seleccionar fecha (opcional)"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descripción"
            name="description"
          >
            <Input.TextArea
              placeholder="Descripción de la factura (opcional)"
              rows={3}
              maxLength={500}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal de Pago */}
      <Modal
        title={`Registrar Pago - ${payingInvoice?.invoiceNumber}`}
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
        width={400}
      >
        {payingInvoice && (
          <>
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="flex justify-between">
                <Text>Monto Total:</Text>
                <Text strong>{formatCurrency(payingInvoice.amount)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Ya Pagado:</Text>
                <Text>{formatCurrency(payingInvoice.paidAmount)}</Text>
              </div>
              <div className="flex justify-between border-t pt-2">
                <Text strong>Saldo Pendiente:</Text>
                <Text strong style={{ color: '#cf1322' }}>
                  {formatCurrency(payingInvoice.amount - payingInvoice.paidAmount)}
                </Text>
              </div>
            </div>

            <Form
              form={paymentForm}
              layout="vertical"
              onFinish={handlePaymentSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Monto del Pago"
                name="amount"
                rules={[
                  { required: true, message: 'El monto del pago es requerido' },
                  { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' },
                  {
                    validator: (_, value) => {
                      const pendingAmount = payingInvoice.amount - payingInvoice.paidAmount;
                      if (value > pendingAmount) {
                        return Promise.reject('El monto no puede ser mayor al saldo pendiente');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Monto a pagar"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                  precision={2}
                />
              </Form.Item>

              <Form.Item
                label="Descripción"
                name="description"
              >
                <Input.TextArea
                  placeholder="Descripción del pago (opcional)"
                  rows={2}
                  maxLength={200}
                />
              </Form.Item>

              <div className="flex justify-end space-x-2">
                <Button onClick={() => setPaymentModalVisible(false)}>
                  Cancelar
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Registrar Pago
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default InvoiceManagement;
