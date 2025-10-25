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
  Tooltip,
  DatePicker,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { InvoiceItem } from '../../services/invoiceService';
import { searchProductsForInvoice } from '../../services/productService';
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
  // Asegurar que siempre sean arrays válidos
  const suppliersList = Array.isArray(suppliers) ? suppliers : [];
  
  const [form] = Form.useForm();
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Búsqueda dinámica de productos cuando el usuario escribe
  const handleSearchProducts = async (value: string) => {
    setSearchText(value);
    
    if (!value || value.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    try {
      // Llamar al servicio específico de búsqueda para facturas (no interfiere con el módulo de productos)
      const results = await searchProductsForInvoice(value, 50);
      setSearchResults(results || []);
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Productos a mostrar: resultados de búsqueda o lista inicial
  const displayProducts = searchText.trim().length >= 2 ? searchResults : products;

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

    const product = displayProducts.find((p: any) => p.id === selectedProduct);
    if (!product) return;

    const newItem: InvoiceItem = {
      productId: selectedProduct,
      quantity,
      unitCost,
      description: product.name,
    };

    setItems([...items, newItem]);
    
    // Limpiar campos
    setSelectedProduct(null);
    setQuantity(1);
    setUnitCost(0);
    
    message.success(`${product.name} agregado a la factura`);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (productId: number) => {
    setSelectedProduct(productId);
    const product = displayProducts.find((p: any) => p.id === productId);
    if (product) {
      setUnitCost(product.purchasePrice || 0);
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
        invoiceDate: values.invoiceDate ? values.invoiceDate.toISOString() : new Date().toISOString(),
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
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
      width: 140,
      render: (value: number) => `$${Math.round(value).toLocaleString('es-CO')}`,
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      align: 'right' as const,
      width: 140,
      render: (_: any, record: InvoiceItem) => `$${Math.round(record.quantity * record.unitCost).toLocaleString('es-CO')}`,
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
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Form.Item
              name="invoiceNumber"
              label="Número de Factura"
              rules={[{ required: true, message: 'Ingresa el número de factura' }]}
            >
              <Input placeholder="F-2025-001" prefix="📄" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="invoiceDate"
              label="Fecha de la Factura"
              initialValue={dayjs()}
              rules={[{ required: true, message: 'Selecciona la fecha de la factura' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Seleccionar fecha"
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="dueDate"
              label="Fecha de Vencimiento"
              tooltip="Fecha límite para pagar la factura"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
                placeholder="Fecha de vencimiento (opcional)"
                disabledDate={(current) => current && current < dayjs().startOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

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
            {suppliersList.map((supplier) => (
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
          <h4>Agregar Productos a la Factura</h4>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space wrap>
              <Select
                placeholder="Escribe para buscar productos..."
                style={{ width: 500 }}
                value={selectedProduct}
                onChange={handleProductChange}
                onSearch={handleSearchProducts}
                showSearch
                filterOption={false}
                loading={searching}
                notFoundContent={
                  searching ? "Buscando..." : 
                  searchText.trim().length < 2 ? "Escribe al menos 2 caracteres para buscar" :
                  "No se encontraron productos"
                }
              >
                {(displayProducts || []).map((product: any) => (
                  <Option key={product.id} value={product.id}>
                    <span>
                      <strong>{product.name}</strong> 
                      {product.category?.name && <span style={{ color: '#999', marginLeft: 8 }}>({product.category.name})</span>}
                      <span style={{ marginLeft: 8 }}>- Stock: {product.stock}</span>
                      <span style={{ marginLeft: 8 }}>- ${Math.round(product.purchasePrice || 0).toLocaleString('es-CO')}</span>
                    </span>
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
                step={1}
                precision={0}
                value={unitCost}
                onChange={(value) => setUnitCost(value || 0)}
                placeholder="Costo unitario"
                style={{ width: 180 }}
                prefix="$"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              />

              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddItem}
                disabled={!selectedProduct || quantity <= 0 || unitCost <= 0}
              >
                Agregar
              </Button>
            </Space>
            
            <small style={{ color: '#666' }}>
              💡 El lote y vencimiento se asignarán automáticamente según el número de factura
            </small>
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
              <span style={{ fontSize: 16 }}>${Math.round(subtotal).toLocaleString('es-CO')}</span>
            </div>
            
            <Form.Item
              name="discount"
              label="Descuento"
              style={{ marginBottom: 8 }}
            >
              <InputNumber
                min={0}
                max={subtotal}
                step={1}
                precision={0}
                placeholder="0"
                style={{ width: '100%' }}
                prefix="$"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 'bold' }}>
              <span>Total:</span>
              <span style={{ color: '#1890ff' }}>${Math.round(total).toLocaleString('es-CO')}</span>
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
