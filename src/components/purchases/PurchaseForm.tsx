// src/components/purchases/PurchaseForm.tsx
import  { useEffect, useState } from "react";
import {
  Modal, Form, Select, DatePicker, Button, InputNumber, Table, Row, Col, message, Collapse, Input
} from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSuppliers } from "../../features/suppliers/supplierSlice";
import { fetchProducts } from "../../features/products/productSlice";
import { createPurchase } from "../../features/purchases/purchaseSlice";

const { Option } = Select;
const { TextArea } = Input;
const { Panel } = Collapse;

const PurchaseForm = ({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items: supplierList } = useAppSelector((s) => s.suppliers);
  const { items: productList } = useAppSelector((s) => s.products);
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  // Cargar proveedores y productos si no hay
  useEffect(() => {
    if (!supplierList.length) dispatch(fetchSuppliers());
    if (!productList.length) dispatch(fetchProducts({}));
  }, [dispatch, supplierList, productList]);

  // Para agregar producto al detalle
  const handleAddRow = () => {
    setRows([...rows, { key: Date.now(), productId: undefined, quantity: 1, unitCost: 0 }]);
  };

  // Para cambiar producto, cantidad o precio
  const handleRowChange = (key: any, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  };

  // Quitar producto
  const handleRemoveRow = (key: any) => {
    setRows(rows.filter((row) => row.key !== key));
  };

  // Subtotal (suma de productos)
  const subtotal = rows.reduce((sum, row) => sum + (row.quantity * row.unitCost || 0), 0);
  
  // Obtener descuento del formulario
  const currentDiscount = Form.useWatch('discount', form) || 0;
  
  // Total con descuento
  const totalCompra = subtotal - currentDiscount;

  // Guardar compra
  const handleSubmit = async (values: any) => {
    if (rows.length === 0) {
      message.warning("Debes agregar al menos un producto");
      return;
    }
    const details = rows.map((row) => ({
      productId: row.productId,
      quantity: Number(row.quantity),
      unitCost: Number(row.unitCost),
    }));

    setSaving(true);
    try {
      await dispatch(createPurchase({
        supplierId: values.supplierId,
        date: values.date.toISOString(),
        paidAmount: Number(values.paidAmount || 0),
        discount: Number(values.discount || 0),
        invoiceNumber: values.invoiceNumber || undefined,
        invoiceDate: values.invoiceDate?.toISOString() || undefined,
        dueDate: values.dueDate?.toISOString() || undefined,
        notes: values.notes || undefined,
        details,
      })).unwrap();
      message.success("Compra registrada correctamente");
      onSaved();
      form.resetFields();
      setRows([]);
      onClose();
    } catch (err: any) {
      message.error(err.message || "Error al guardar compra");
    } finally {
      setSaving(false);
    }
  };

  // Columnas tabla productos
  const columns = [
    {
      title: "Producto",
      dataIndex: "productId",
      key: "productId",
      render: (value: number, row: any) => (
        <Select
          showSearch
          placeholder="Selecciona producto"
          value={value}
          style={{ minWidth: 180 }}
          onChange={(val) => handleRowChange(row.key, "productId", val)}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {productList.map((p) => (
            <Option key={p.id} value={p.id}>
              {p.name}
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
      dataIndex: "unitCost",
      key: "unitCost",
      render: (value: number, row: any) => (
        <InputNumber
          min={0}
          value={value}
          onChange={(val) => handleRowChange(row.key, "unitCost", val)}
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
        <b>${(row.quantity * row.unitCost || 0).toLocaleString()}</b>
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

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Registrar nueva compra"
      width={900}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{
        date: dayjs(),
        discount: 0,
        paidAmount: 0,
      }}>
        {/* Datos básicos */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Proveedor"
              name="supplierId"
              rules={[{ required: true, message: "Selecciona proveedor" }]}
            >
              <Select placeholder="Selecciona proveedor" showSearch>
                {supplierList.map((s) => (
                  <Option key={s.id} value={s.id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Fecha de compra"
              name="date"
              rules={[{ required: true, message: "Selecciona la fecha" }]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        {/* Datos de factura (opcional) */}
        <Collapse ghost className="mb-4">
          <Panel header="📄 Datos de factura (opcional)" key="1">
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Número de factura" name="invoiceNumber">
                  <Input placeholder="Ej: F-001-12345" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Fecha de factura" name="invoiceDate">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item label="Fecha de vencimiento (si es a crédito)" name="dueDate">
                  <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Descuento" name="discount">
                  <InputNumber
                    min={0}
                    max={subtotal}
                    formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    style={{ width: "100%" }}
                    placeholder="0"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label="Notas" name="notes">
                  <TextArea rows={2} placeholder="Observaciones adicionales..." />
                </Form.Item>
              </Col>
            </Row>
          </Panel>
        </Collapse>

        {/* Tabla de productos */}
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

        {/* Totales y pago */}
        <div className="bg-gray-50 p-4 rounded mt-4 mb-4">
          <Row gutter={16}>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-600">Subtotal:</div>
              <div className="text-lg font-semibold">${subtotal.toLocaleString()}</div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-600">Descuento:</div>
              <div className="text-lg font-semibold text-red-600">
                -${currentDiscount.toLocaleString()}
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="text-sm text-gray-600">Total a pagar:</div>
              <div className="text-xl font-bold text-blue-600">
                ${totalCompra.toLocaleString()}
              </div>
            </Col>
          </Row>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item 
              label="Monto pagado ahora" 
              name="paidAmount"
              help="Si paga menos del total, quedará pendiente"
            >
              <InputNumber
                min={0}
                max={totalCompra}
                formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <div className="mt-8">
              <div className="text-sm text-gray-600">Estado:</div>
              <div className="text-base">
                {(Form.useWatch('paidAmount', form) || 0) >= totalCompra ? (
                  <span className="text-green-600 font-semibold">✓ Pagada</span>
                ) : (
                  <span className="text-orange-600 font-semibold">⏳ Pendiente</span>
                )}
              </div>
            </div>
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
              Guardar compra
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default PurchaseForm;
