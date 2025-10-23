// src/pages/invoices/InvoiceManagement_FIFO.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  message,
  Tag,
  Popconfirm,
  Input,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import InvoiceForm from '../../components/invoices/InvoiceForm';
import InvoiceDetailModal from '../../components/invoices/InvoiceDetailModal';
import { getInvoices, createInvoice, deleteInvoice } from '../../services/invoiceService';
import { getSuppliers } from '../../services/supplierService';
import { getProducts } from '../../services/productService';
import type { Invoice } from '../../services/invoiceService';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const InvoiceManagementFIFO: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [invoicesData, suppliersData, productsData] = await Promise.all([
        getInvoices(),
        getSuppliers(),
        getProducts(),
      ]);
      setInvoices(invoicesData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: any) => {
    setLoading(true);
    try {
      await createInvoice(data);
      message.success('✅ Factura creada y inventario procesado correctamente');
      setFormVisible(false);
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al crear factura');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      await deleteInvoice(id);
      message.success('Factura eliminada');
      loadData();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Error al eliminar factura');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDetailVisible(true);
  };

  const filteredInvoices = invoices.filter((invoice) =>
    invoice.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
    (invoice.Supplier?.name || invoice.supplierName).toLowerCase().includes(searchText.toLowerCase())
  );

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const processedCount = filteredInvoices.filter((inv) => inv.inventoryProcessed).length;

  const columns = [
    {
      title: 'Número',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 150,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Proveedor',
      key: 'supplier',
      width: 200,
      render: (_: any, record: Invoice) => record.Supplier?.name || record.supplierName,
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
          ${amount.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center' as const,
      render: (status: string) => {
        const colors: Record<string, string> = {
          PENDING: 'warning',
          PARTIAL: 'processing',
          PAID: 'success',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Inventario',
      dataIndex: 'inventoryProcessed',
      key: 'inventoryProcessed',
      width: 120,
      align: 'center' as const,
      render: (processed: boolean) =>
        processed ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Procesado
          </Tag>
        ) : (
          <Tag color="default">Sin procesar</Tag>
        ),
    },
    {
      title: 'Items',
      key: 'itemCount',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Invoice) => (
        <Tag color="blue">{record.InvoiceItem?.length || 0}</Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      align: 'center' as const,
      render: (_: any, record: Invoice) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Ver
          </Button>
          <Popconfirm
            title="¿Eliminar esta factura?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              📄 Gestión de Facturas con FIFO
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={loadData}
                loading={loading}
              >
                Actualizar
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setFormVisible(true)}
                size="large"
              >
                Nueva Factura
              </Button>
            </Space>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Total Facturas"
                  value={filteredInvoices.length}
                  prefix={<ShoppingCartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Monto Total"
                  value={totalAmount}
                  precision={2}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Inventario Procesado"
                  value={processedCount}
                  suffix={`/ ${filteredInvoices.length}`}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Search
            placeholder="Buscar por número de factura o proveedor..."
            allowClear
            enterButton="Buscar"
            size="large"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 500 }}
          />

          <Table
            dataSource={filteredInvoices}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total: ${total} facturas`,
              showSizeChanger: true,
            }}
          />
        </Space>
      </Card>

      <InvoiceForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleCreate}
        loading={loading}
        suppliers={suppliers}
        products={products}
      />

      <InvoiceDetailModal
        visible={detailVisible}
        invoice={selectedInvoice}
        onClose={() => setDetailVisible(false)}
      />
    </div>
  );
};

export default InvoiceManagementFIFO;
