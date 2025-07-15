// src/components/purchases/PurchaseForm.tsx
import  { useEffect, useState } from "react";
import {
  Modal, Form, Select, DatePicker, Button, InputNumber, Table, Row, Col, message, Checkbox
} from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSuppliers } from "../../features/suppliers/supplierSlice";
import { fetchProducts } from "../../features/products/productSlice";
import { createPurchase } from "../../features/purchases/purchaseSlice";

const { Option } = Select;

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

  // Total de línea y total compra
  const totalCompra = rows.reduce((sum, row) => sum + (row.quantity * row.unitCost || 0), 0);

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
        totalAmount: totalCompra,
        paidAmount: Number(values.paidAmount || 0),
        isPaid: !!values.isPaid,
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
      width={800}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit} initialValues={{
        date: dayjs(),
        isPaid: false,
        paidAmount: 0,
      }}>
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
                formatter={v => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <Form.Item name="isPaid" valuePropName="checked" label="¿Compra pagada?" className="mt-7">
              <Checkbox>Pagada</Checkbox>
            </Form.Item>
          </Col>
          <Col xs={24} sm={8}>
            <div className="text-right mt-7">
              <b>Total compra: </b>
              <span style={{ fontSize: 18 }}>${totalCompra.toLocaleString()}</span>
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
