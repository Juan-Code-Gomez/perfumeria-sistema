import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  Table,
  Row,
  Col,
  message,
  Checkbox,
} from "antd";
import dayjs from "dayjs";
import { useAppDispatch } from "../../store";
import { createSale } from "../../features/sales/salesSlice";
import * as productService from "../../services/productService";
import type { Product } from "../../features/products/types";
import debounce from "lodash.debounce";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SaleForm: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();

  // Filas de la tabla de productos a vender
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Estado para productos sugeridos en el select asíncrono
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);

  // Guardar el último texto buscado por fila (para manejar varias búsquedas independientes)
  const [productSearch, setProductSearch] = useState<{ [rowKey: string]: string }>({});

  // Debounce para no buscar en cada tecla
  // Se define fuera del render usando useCallback
  const debouncedFetchProducts = useCallback(
    debounce(async (searchText: string, cb: (products: Product[]) => void) => {
      setProductLoading(true);
      try {
        const res = await productService.getProducts({
          name: searchText,
          page: 1,
          pageSize: 10,
        });
        cb(res.items);
      } catch {
        cb([]);
      } finally {
        setProductLoading(false);
      }
    }, 350),
    []
  );

  // Añadir fila de producto
  const handleAddRow = () => {
    setRows([
      ...rows,
      { key: Date.now(), productId: undefined, quantity: 1, unitPrice: 0 },
    ]);
  };

  // Cambiar campo de fila
  const handleRowChange = (key: any, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  };

  // Quitar fila
  const handleRemoveRow = (key: any) => {
    setRows(rows.filter((row) => row.key !== key));
    setProductSearch((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Total de la venta
  const totalVenta = rows.reduce(
    (sum, row) => sum + (row.quantity * row.unitPrice || 0),
    0
  );

  // Guardar venta
  const handleSubmit = async (values: any) => {
    if (rows.length === 0) {
      message.warning("Debes agregar al menos un producto");
      return;
    }
    if (rows.some((r) => !r.productId || r.quantity <= 0 || r.unitPrice < 0)) {
      message.warning(
        "Verifica que todos los productos, cantidades y precios sean válidos"
      );
      return;
    }

    const details = rows.map((row) => ({
      productId: row.productId,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unitPrice),
      totalPrice: Number(row.quantity) * Number(row.unitPrice),
    }));

    setSaving(true);
    try {
      await dispatch(
        createSale({
          customerName: values.customerName,
          date: values.date.format("YYYY-MM-DD"),
          totalAmount: totalVenta,
          paidAmount: Number(values.paidAmount || 0),
          isPaid: !!values.isPaid,
          paymentMethod: values.paymentMethod,
          details,
        })
      ).unwrap();
      message.success("Venta registrada correctamente");
      onSaved();
      form.resetFields();
      setRows([]);
      onClose();
    } catch (err: any) {
      message.error(err.message || "Error al registrar venta");
    } finally {
      setSaving(false);
    }
  };

  // Cargar sugerencias cuando el usuario escribe en el select de productos (asíncrono)
  const handleProductSearch = (rowKey: string, value: string) => {
    setProductSearch((prev) => ({ ...prev, [rowKey]: value }));
    debouncedFetchProducts(value, (products) => {
      setSuggestedProducts(products);
    });
  };

  // Al enfocar el select (sin texto), mostrar los primeros productos
  const handleProductFocus = (rowKey: string) => {
    debouncedFetchProducts("", (products) => {
      setSuggestedProducts(products);
    });
  };

  // Cuando seleccionas un producto, puedes llenar el precio unitario si lo deseas (auto)
  const handleProductSelect = (rowKey: string, productId: number) => {
    const selected = suggestedProducts.find((p) => p.id === productId);
    handleRowChange(rowKey, "productId", productId);
    if (selected) {
      handleRowChange(rowKey, "unitPrice", selected.salePrice || 0);
    }
  };

  // Columnas de la tabla de productos
  const columns = [
    {
      title: "Producto",
      dataIndex: "productId",
      key: "productId",
      render: (value: number, row: any) => (
        <Select
          showSearch
          placeholder="Buscar producto"
          value={value}
          style={{ minWidth: 230 }}
          onSearch={(txt) => handleProductSearch(row.key, txt)}
          onFocus={() => handleProductFocus(row.key)}
          loading={productLoading}
          filterOption={false}
          onChange={(val) => handleProductSelect(row.key, val)}
          notFoundContent={productLoading ? "Buscando..." : "No encontrado"}
        >
          {suggestedProducts.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name} {p.stock !== undefined ? `| Stock: ${p.stock}` : ""}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number, row: any) => (
        <InputNumber
          min={1}
          value={value}
          onChange={(val) => handleRowChange(row.key, "quantity", val)}
          style={{ width: 80 }}
        />
      ),
    },
    {
      title: "P. unitario",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (value: number, row: any) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleRowChange(row.key, "unitPrice", val)}
          style={{ width: 100 }}
          step={100}
        />
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (_: any, row: any) => (
        <b>${(row.quantity * row.unitPrice || 0).toLocaleString()}</b>
      ),
    },
    {
      title: "",
      key: "remove",
      render: (_: any, row: any) => (
        <Button danger type="link" onClick={() => handleRemoveRow(row.key)}>
          Quitar
        </Button>
      ),
    },
  ];

  // Reiniciar los productos sugeridos cada vez que abres el modal
  useEffect(() => {
    if (open) {
      setSuggestedProducts([]);
      setRows([]);
      setProductSearch({});
      form.resetFields();
    }
  }, [open, form]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Registrar nueva venta"
      width={800}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          isPaid: false,
          paidAmount: 0,
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Cliente" name="customerName">
              <Input placeholder="Nombre del cliente (opcional)" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Fecha"
              name="date"
              rules={[{ required: true, message: "Selecciona la fecha" }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Table
              columns={columns}
              dataSource={rows}
              pagination={false}
              rowKey="key"
              size="small"
              style={{ marginBottom: 12 }}
            />
            <Button type="dashed" onClick={handleAddRow} block>
              + Agregar producto
            </Button>
          </Col>
        </Row>
        <Row gutter={16} className="mt-4">
          <Col xs={24} sm={8}>
            <Form.Item label="Monto pagado" name="paidAmount">
              <InputNumber
                min={0}
                formatter={(v) =>
                  `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              name="isPaid"
              valuePropName="checked"
              label="¿Venta pagada?"
              className="mt-7"
            >
              <Checkbox>Pagada</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-right mt-7">
              <b>Total venta: </b>
              <span style={{ fontSize: 18 }}>
                ${totalVenta.toLocaleString()}
              </span>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item
              label="Método de pago"
              name="paymentMethod"
              rules={[
                { required: true, message: "Selecciona el método de pago" },
              ]}
            >
              <Select placeholder="Selecciona método de pago">
                <Option value="Efectivo">Efectivo</Option>
                <Option value="Transferencia">Transferencia</Option>
                <Option value="Tarjeta">Tarjeta</Option>
                <Option value="Otro">Otro</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              block
              size="large"
            >
              Guardar venta
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default SaleForm;
