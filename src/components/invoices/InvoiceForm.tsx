// src/components/invoices/InvoiceForm.tsx
import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Table,
  Space,
  message,
  Switch,
  DatePicker,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { InvoiceItem } from '../../services/invoiceService';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface InvoiceFormProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  suppliers: Array<{ id: number; name: string }>;
  products: Array<{ id: number; name: string; purchasePrice: number; stock: number }>;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  visible,
  onCancel,
  onSubmit,
  loading,
  suppliers,
  products,
}) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<dayjs.Dayjs | null>(null);

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);
  const discount = Form.useWatch('discount', form) || 0;
  const total = subtotal - discount;

  const handleAddItem = () => {
    if (!selectedProduct) {
      message.warning('Selecciona un producto');
      return;
    }
    if (quantity <= 0) {
      message.warning('La cantidad debe ser mayor a 0');
      return;
    }
    if (unitCost <= 0) {
      message.warning('El costo unitario debe ser mayor a 0');
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const newItem: InvoiceItem = {
      productId: selectedProduct,
      quantity,
      unitCost,
      description: product.name,
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate ? expiryDate.format('YYYY-MM-DD') : undefined,
    };

    setItems([...items, newItem]);
    
    // Limpiar campos
    setSelectedProduct(null);
    setQuantity(1);
    setUnitCost(0);
    setBatchNumber('');
    setExpiryDate(null);
    
    message.success(`${product.name} agregado a la factura`);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (productId: number) => {
    setSelectedProduct(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setUnitCost(product.purchasePrice);
    }
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      message.error('Agrega al menos un producto a la factura');
      return;
    }

    try {
      const values = await form.validateFields();
      const data = {
        invoiceNumber: values.invoiceNumber,
        supplierId: values.supplierId,
        discount: values.discount || 0,
        notes: values.notes,
        processInventory: values.processInventory ?? true,
        items,
      };
      onSubmit(data);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setItems([]);
    setSelectedProduct(null);
    setQuantity(1);
    setUnitCost(0);
    setBatchNumber('');
    setExpiryDate(null);
    onCancel();
  };

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
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      align: 'right' as const,
      width: 120,
      render: (_: any, record: InvoiceItem) => `$${(record.quantity * record.unitCost).toFixed(2)}`,
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
      render: (value: string) => value || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      align: 'center' as const,
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(index)}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <ShoppingCartOutlined />
          <span>Nueva Factura con Inventario FIFO</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      onOk={handleSubmit}
      width={1200}
      confirmLoading={loading}
      okText="Crear Factura y Procesar Inventario"
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="invoiceNumber"
          label="Número de Factura"
          rules={[{ required: true, message: 'Ingresa el número de factura' }]}
        >
          <Input placeholder="F-2024-001" prefix="📄" />
        </Form.Item>

        <Form.Item
          name="supplierId"
          label="Proveedor"
          rules={[{ required: true, message: 'Selecciona un proveedor' }]}
        >
          <Select
            placeholder="Selecciona un proveedor"
            showSearch
            optionFilterProp="children"
          >
            {suppliers.map((supplier) => (
              <Option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="processInventory"
          label={
            <Space>
              <span>Procesar Inventario Automáticamente</span>
              <Tooltip title="Si está activado, creará automáticamente la compra, los lotes FIFO y actualizará el stock">
                <InfoCircleOutlined />
              </Tooltip>
            </Space>
          }
          valuePropName="checked"
          initialValue={true}
        >
          <Switch checkedChildren="Sí" unCheckedChildren="No" defaultChecked />
        </Form.Item>

        <div style={{ marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <h4>Agregar Productos</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Select
                placeholder="Seleccionar producto"
                style={{ width: 250 }}
                value={selectedProduct}
                onChange={handleProductChange}
                showSearch
                optionFilterProp="children"
              >
                {products.map((product) => (
                  <Option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.stock})
                  </Option>
                ))}
              </Select>

              <InputNumber
                min={0.01}
                step={1}
                value={quantity}
                onChange={(value) => setQuantity(value || 1)}
                placeholder="Cantidad"
                style={{ width: 120 }}
                prefix="📦"
              />

              <InputNumber
                min={0}
                step={0.01}
                value={unitCost}
                onChange={(value) => setUnitCost(value || 0)}
                placeholder="Costo unitario"
                style={{ width: 150 }}
                prefix="$"
              />

              <Input
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                placeholder="Número de lote (opcional)"
                style={{ width: 180 }}
              />

              <DatePicker
                value={expiryDate}
                onChange={setExpiryDate}
                placeholder="Vencimiento (opcional)"
                format="YYYY-MM-DD"
                style={{ width: 180 }}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
              >
                Agregar
              </Button>
            </Space>
          </Space>
        </div>

        <Table
          dataSource={items}
          columns={columns}
          pagination={false}
          rowKey={(_, index) => index?.toString() || '0'}
          locale={{ emptyText: 'No hay productos agregados' }}
          size="small"
          scroll={{ y: 300 }}
        />

        <div style={{ marginTop: 16, padding: 16, background: '#e6f7ff', borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Subtotal:</strong>
              <span style={{ fontSize: 16 }}>${subtotal.toFixed(2)}</span>
            </div>
            
            <Form.Item
              name="discount"
              label="Descuento"
              style={{ marginBottom: 8 }}
            >
              <InputNumber
                min={0}
                max={subtotal}
                step={0.01}
                placeholder="0.00"
                style={{ width: '100%' }}
                prefix="$"
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#1890ff' }}>${total.toFixed(2)}</span>
            </div>
          </Space>
        </div>

        <Form.Item name="notes" label="Notas adicionales" style={{ marginTop: 16 }}>
          <TextArea rows={3} placeholder="Notas o comentarios sobre la factura..." />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default InvoiceForm;
