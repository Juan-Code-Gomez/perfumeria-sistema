import React, { useEffect, useState } from "react";
import {
  Modal, Form, Input, Select, DatePicker, Button, InputNumber, Table, Row, Col, message, Checkbox,
} from "antd";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchProducts } from "../../features/products/productSlice";
import { createSale } from "../../features/sales/salesSlice";

const { Option } = Select;

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const SaleForm: React.FC<Props> = ({ open, onClose, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items: productList } = useAppSelector((s) => s.products);
  const [rows, setRows] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!productList.length) dispatch(fetchProducts({}));
  }, [dispatch, productList]);

  // Añadir una fila de producto
  const handleAddRow = () => {
    setRows([
      ...rows,
      { key: Date.now(), productId: undefined, quantity: 1, unitPrice: 0 },
    ]);
  };

  // Cambiar un campo de una fila
  const handleRowChange = (key: any, field: string, value: any) => {
    setRows((prev) =>
      prev.map((row) => (row.key === key ? { ...row, [field]: value } : row))
    );
  };

  // Quitar fila
  const handleRemoveRow = (key: any) => {
    setRows(rows.filter((row) => row.key !== key));
  };

  // Calcular total de la venta
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
      message.warning("Verifica que todos los productos, cantidades y precios sean válidos");
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

  // Columnas de la tabla de productos
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
            String(option?.children || "")
              .toLowerCase()
              .includes(input.toLowerCase())
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
