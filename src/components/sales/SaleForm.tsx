import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Form,
  Select,
  DatePicker,
  Button,
  InputNumber,
  Table,
  Row,
  Col,
  message,
  Input,
  Radio,
} from "antd";
import dayjs from "dayjs";
import { useAppDispatch } from "../../store";
import { createSale } from "../../features/sales/salesSlice";
import * as productService from "../../services/productService";
import type { Product } from "../../services/productService";
import debounce from "lodash.debounce";
import ClientSelector from "../clients/ClientSelector";

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
  const [clientMode, setClientMode] = useState<"existing" | "casual">("casual");

  const [selectedClient, setSelectedClient] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Estado para productos sugeridos en el select asíncrono
  const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
  const [productLoading, setProductLoading] = useState(false);

  // Guardar el último texto buscado por fila (para manejar varias búsquedas independientes)
  // @ts-ignore
  const [productSearch, setProductSearch] = useState<{
    [rowKey: string]: string;
  }>({});

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
        cb(res.data?.items || []);
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
      const basePayload = {
        date: values.date.format("YYYY-MM-DD"),
        totalAmount: totalVenta,
        paidAmount: Number(values.paidAmount || totalVenta),
        isPaid: true,
        paymentMethod: values.paymentMethod,
        details,
      };

      console.log(selectedClient, "selectedClient");

      const payload = selectedClient
        ? { ...basePayload, clientId: selectedClient.id }
        : { ...basePayload, customerName: values.freeTextName };

      console.log("Payload final:", payload);

      await dispatch(createSale(payload)).unwrap();

      message.success("Venta registrada correctamente");
      onSaved();
      form.resetFields();
      setRows([]);
      setSelectedClient(null);
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
  const handleProductFocus = (_rowKey: string) => {
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
          style={{ minWidth: 320, maxWidth: 380 }}
          onSearch={(txt) => handleProductSearch(row.key, txt)}
          onFocus={() => handleProductFocus(row.key)}
          loading={productLoading}
          filterOption={false}
          onChange={(val) => handleProductSelect(row.key, val)}
          notFoundContent={productLoading ? "Buscando..." : "No encontrado"}
          optionLabelProp="label"
          dropdownStyle={{ zIndex: 99999 }} // para evitar bugs en modales grandes
        >
          {suggestedProducts.map((p) => (
            <Option
              key={p.id}
              value={p.id}
              label={`${p.name} | ${p.category?.name || "-"} | ${
                p.unit?.name || "-"
              }`}
            >
              <div
                style={{
                  display: "flex",
                  flexWrap: "nowrap",
                  alignItems: "center",
                  gap: 5,
                  minWidth: 0,
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 100,
                    display: "inline-block",
                  }}
                >
                  {p.name}
                </span>
                <span
                  style={{
                    color:
                      (p.category?.name?.toLowerCase() === "esencias" &&
                        "#0079bd") ||
                      (p.category?.name?.toLowerCase() === "perfumes" &&
                        "#C97C5D") ||
                      "#888",
                    fontSize: 12,
                    fontWeight: 500,
                    marginLeft: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 65,
                    display: "inline-block",
                  }}
                >
                  {p.category?.name}
                </span>
                <span
                  style={{
                    color: "#888",
                    fontSize: 12,
                    fontWeight: 400,
                    marginLeft: 3,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 45,
                    display: "inline-block",
                  }}
                >
                  {p.unit?.name}
                </span>
                <span
                  style={{
                    color: "#4CAF50",
                    fontSize: 12,
                    fontWeight: 400,
                    marginLeft: 4,
                    whiteSpace: "nowrap",
                  }}
                >
                  Stock: {p.stock}
                </span>
              </div>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      render: (value: number, row: any) => {
        // Encuentra el producto seleccionado de esta fila
        const selectedProduct = suggestedProducts.find(
          (p) => p.id === row.productId
        );
        // Puedes ajustar el match a tu conveniencia, por ejemplo 'gramo', 'gr', etc
        const isGramo = selectedProduct?.unit?.name
          ?.toLowerCase()
          .includes("gram");
        return (
          <InputNumber
            min={isGramo ? 0.01 : 1}
            max={selectedProduct?.stock}
            step={isGramo ? 0.01 : 1}
            value={value}
            onChange={(val) => handleRowChange(row.key, "quantity", val)}
            style={{ width: 90 }}
            stringMode={!!isGramo}
            placeholder={isGramo ? "Ej: 10.5" : "Ej: 1"}
            disabled={!selectedProduct}
          />
        );
      },
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
      setSelectedClient(null);
      setClientMode('casual');
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
          clientId: undefined,
          freeTextName: '',
        }}
      >
        <Form.Item name="clientId" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Tipo de cliente">
              <Radio.Group
                onChange={(e) => {
                  setClientMode(e.target.value);
                  setSelectedClient(null);
                }}
                value={clientMode}
              >
                <Radio value="existing">Cliente registrado</Radio>
                <Radio value="casual">Venta de mostrador</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            {clientMode === "existing" ? (
                <Form.Item label="Selecciona cliente">
                  <ClientSelector
                    onSelectClient={(client) => {
                      setSelectedClient(client);
                      if (client) {
                        form.setFieldsValue({ clientId: client.id });
                      }
                    }}
                  />
                </Form.Item>
            ) : (
                <Form.Item
                  label="Nombre (venta mostrador)"
                  name="freeTextName"
                  rules={[{ required: true, message: "Ingresa un nombre" }]}
                >
                  <Input placeholder="Ej: Cliente ocasional o ‘Mostrador’" />
                </Form.Item>
            )}
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
