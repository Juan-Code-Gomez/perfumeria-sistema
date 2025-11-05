import React, { useState, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  InputNumber,
  Select,
  message,
  Space,
  Row,
  Col,
  Divider,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import debounce from "lodash.debounce";
import * as productService from "../../services/productService";
import { createOrder } from "../../services/orderService";
import type { CreateOrderDto, CreateOrderDetailDto } from "../../types/OrderTypes";
import type { Product } from "../../services/productService";
import ClientSelector from "../clients/ClientSelector";

const { Option } = Select;
const { TextArea } = Input;

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface OrderRow {
  key: string;
  productId?: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  stock?: number;
  reservedStock?: number;
}

const CreateOrderModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [clientMode, setClientMode] = useState<"existing" | "casual">("casual");
  const [selectedClient, setSelectedClient] = useState<{ id: number; name: string } | null>(null);

  // Estado para búsqueda de productos
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);

  // Debounce para búsqueda de productos
  const debouncedFetchProducts = useCallback(
    debounce(async (searchText: string, cb: (products: Product[]) => void) => {
      setProductLoading(true);
      try {
        const res = await productService.getProducts({
          name: searchText,
          page: 1,
          pageSize: 20,
        });
        cb(res.data?.items || []);
      } catch {
        cb([]);
      } finally {
        setProductLoading(false);
      }
    }, 350),
    []
  );

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        key: Date.now().toString(),
        productId: undefined,
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveRow = (key: string) => {
    setRows(rows.filter((row) => row.key !== key));
  };

  const handleProductChange = (key: string, productId: number) => {
    const product = suggestedProducts.find((p) => p.id === productId);
    if (product) {
      setRows((prev) =>
        prev.map((row) =>
          row.key === key
            ? {
                ...row,
                productId: product.id,
                productName: product.name,
                unitPrice: product.salePrice,
                stock: product.stock,
                reservedStock: product.reservedStock || 0,
              }
            : row
        )
      );
    }
  };

  const handleQuantityChange = (key: string, quantity: number) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, quantity } : row))
    );
  };

  const handlePriceChange = (key: string, unitPrice: number) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, unitPrice } : row))
    );
  };

  const calculateTotal = () => {
    return rows.reduce((sum, row) => sum + (row.quantity * row.unitPrice || 0), 0);
  };

  const handleSubmit = async (values: any) => {
    if (rows.length === 0) {
      message.warning("Debes agregar al menos un producto");
      return;
    }

    // Validar filas
    for (const row of rows) {
      if (!row.productId) {
        message.warning("Todos los productos deben estar seleccionados");
        return;
      }
      if (row.quantity <= 0) {
        message.warning("Las cantidades deben ser mayores a 0");
        return;
      }
      if (row.unitPrice < 0) {
        message.warning("Los precios no pueden ser negativos");
        return;
      }

      // Validar stock disponible
      const availableStock = (row.stock || 0) - (row.reservedStock || 0);
      if (availableStock < row.quantity) {
        message.error(
          `Stock insuficiente para "${row.productName}". ` +
          `Disponible: ${availableStock}, Solicitado: ${row.quantity}`
        );
        return;
      }
    }

    const details: CreateOrderDetailDto[] = rows.map((row) => ({
      productId: row.productId!,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      totalPrice: row.quantity * row.unitPrice,
    }));

    const payload: CreateOrderDto = {
      totalAmount: calculateTotal(),
      notes: values.notes,
      details,
    };

    if (selectedClient) {
      payload.clientId = selectedClient.id;
    } else if (values.customerName) {
      payload.customerName = values.customerName;
    }

    setSaving(true);
    try {
      await createOrder(payload);
      message.success("Pedido creado exitosamente");
      form.resetFields();
      setRows([]);
      setSelectedClient(null);
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error al crear pedido");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setRows([]);
    setSelectedClient(null);
    onClose();
  };

  const columns = [
    {
      title: "Producto",
      key: "product",
      width: "35%",
      render: (_: any, record: OrderRow) => (
        <Select
          showSearch
          placeholder="Buscar producto..."
          style={{ width: "100%" }}
          value={record.productId}
          onSearch={(text) => debouncedFetchProducts(text, setSuggestedProducts)}
          onChange={(value) => handleProductChange(record.key, value)}
          filterOption={false}
          loading={productLoading}
        >
          {suggestedProducts.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name} - Stock: {(p.stock - (p.reservedStock || 0)).toFixed(2)}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Stock Disponible",
      key: "stock",
      width: "15%",
      align: "center" as const,
      render: (_: any, record: OrderRow) => {
        if (!record.stock) return "-";
        const available = record.stock - (record.reservedStock || 0);
        return (
          <span style={{ color: available < record.quantity ? "red" : "inherit" }}>
            {available.toFixed(2)}
          </span>
        );
      },
    },
    {
      title: "Cantidad",
      key: "quantity",
      width: "15%",
      render: (_: any, record: OrderRow) => (
        <InputNumber
          min={0.01}
          step={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(record.key, value || 1)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Precio Unitario",
      key: "unitPrice",
      width: "15%",
      render: (_: any, record: OrderRow) => (
        <InputNumber
          min={0}
          step={1}
          precision={0}
          value={record.unitPrice}
          onChange={(value) => handlePriceChange(record.key, value || 0)}
          style={{ width: "100%" }}
          prefix="$"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      ),
    },
    {
      title: "Total",
      key: "total",
      width: "15%",
      align: "right" as const,
      render: (_: any, record: OrderRow) => (
        <strong>${(record.quantity * record.unitPrice).toLocaleString('es-CO')}</strong>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "5%",
      render: (_: any, record: OrderRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveRow(record.key)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="Crear Nuevo Pedido"
      open={open}
      onCancel={handleCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={saving}
          onClick={() => form.submit()}
        >
          Crear Pedido
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tipo de Cliente">
              <Select
                value={clientMode}
                onChange={(value) => {
                  setClientMode(value);
                  setSelectedClient(null);
                  form.setFieldsValue({ customerName: undefined });
                }}
              >
                <Option value="casual">Cliente Ocasional</Option>
                <Option value="existing">Cliente Registrado</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col span={12}>
            {clientMode === "casual" ? (
              <Form.Item
                name="customerName"
                label="Nombre del Cliente"
                rules={[{ required: false }]}
              >
                <Input placeholder="Nombre del cliente (opcional)" />
              </Form.Item>
            ) : (
              <Form.Item label="Cliente Registrado">
                <ClientSelector
                  value={selectedClient}
                  onSelectClient={setSelectedClient}
                />
              </Form.Item>
            )}
          </Col>
        </Row>

        <Form.Item name="notes" label="Observaciones">
          <TextArea
            rows={2}
            placeholder="Observaciones del pedido (opcional)"
          />
        </Form.Item>

        <Divider>Productos del Pedido</Divider>

        <Button
          type="dashed"
          onClick={handleAddRow}
          icon={<PlusOutlined />}
          style={{ marginBottom: 16, width: "100%" }}
        >
          Agregar Producto
        </Button>

        <Table
          columns={columns}
          dataSource={rows}
          pagination={false}
          size="small"
          scroll={{ y: 300 }}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Space size="large">
            <span>
              <strong>Total de Productos:</strong> {rows.length}
            </span>
            <span style={{ fontSize: 18 }}>
              <strong>Total: ${calculateTotal().toLocaleString('es-CO')}</strong>
            </span>
          </Space>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateOrderModal;
