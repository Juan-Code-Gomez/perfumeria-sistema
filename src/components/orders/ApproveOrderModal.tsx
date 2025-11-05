import React, { useState } from "react";
import {
  Modal,
  Select,
  InputNumber,
  Button,
  Table,
  message,
  Input,
  Divider,
  Row,
  Col,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Order, ApproveOrderDto } from "../../types/OrderTypes";
import { approveOrder } from "../../services/orderService";

const { Option } = Select;

interface Props {
  open: boolean;
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

interface PaymentRow {
  key: string;
  method: string;
  amount: string;
  note?: string;
}

const ApproveOrderModal: React.FC<Props> = ({ open, order, onClose, onSuccess }) => {
  const [payments, setPayments] = useState<PaymentRow[]>([
    { key: "1", method: "Efectivo", amount: order.totalAmount.toString(), note: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const paymentMethods = [
    "Efectivo",
    "Tarjeta de Débito",
    "Tarjeta de Crédito",
    "Transferencia",
    "QR",
    "Otro",
  ];

  const handleAddPayment = () => {
    setPayments([
      ...payments,
      { key: Date.now().toString(), method: "Efectivo", amount: "0", note: "" },
    ]);
  };

  const handleRemovePayment = (key: string) => {
    if (payments.length === 1) {
      message.warning("Debe haber al menos una forma de pago");
      return;
    }
    setPayments(payments.filter((p) => p.key !== key));
  };

  const handlePaymentChange = (key: string, field: string, value: any) => {
    setPayments((prev) =>
      prev.map((p) => (p.key === key ? { ...p, [field]: value } : p))
    );
  };

  const calculateTotalPayments = () => {
    return payments.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);
  };

  const handleSubmit = async () => {
    // Validar pagos
    for (const payment of payments) {
      if (!payment.method) {
        message.warning("Todas las formas de pago deben tener un método seleccionado");
        return;
      }
      if (parseFloat(payment.amount) <= 0) {
        message.warning("Los montos deben ser mayores a 0");
        return;
      }
    }

    const totalPayments = calculateTotalPayments();
    if (Math.abs(totalPayments - order.totalAmount) > 1) {
      message.error(
        `La suma de los pagos ($${totalPayments.toLocaleString('es-CO')}) debe ser igual al total del pedido ($${order.totalAmount.toLocaleString('es-CO')})`
      );
      return;
    }

    const payload: ApproveOrderDto = {
      payments: payments.map((p) => ({
        method: p.method,
        amount: p.amount,
        note: p.note,
      })),
    };

    setSaving(true);
    try {
      await approveOrder(order.id, payload);
      message.success("Pedido aprobado exitosamente y convertido en venta");
      onSuccess();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error al aprobar pedido");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPayments([
      { key: "1", method: "Efectivo", amount: order.totalAmount.toString(), note: "" },
    ]);
    onClose();
  };

  const paymentColumns = [
    {
      title: "Método de Pago",
      key: "method",
      width: "30%",
      render: (_: any, record: PaymentRow) => (
        <Select
          style={{ width: "100%" }}
          value={record.method}
          onChange={(value) => handlePaymentChange(record.key, "method", value)}
        >
          {paymentMethods.map((method) => (
            <Option key={method} value={method}>
              {method}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Monto",
      key: "amount",
      width: "25%",
      render: (_: any, record: PaymentRow) => (
        <InputNumber
          style={{ width: "100%" }}
          min={0}
          step={1}
          precision={0}
          value={parseFloat(record.amount)}
          onChange={(value) => handlePaymentChange(record.key, "amount", (value || 0).toString())}
          prefix="$"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, ''))}
        />
      ),
    },
    {
      title: "Nota",
      key: "note",
      width: "35%",
      render: (_: any, record: PaymentRow) => (
        <Input
          placeholder="Nota opcional"
          value={record.note}
          onChange={(e) => handlePaymentChange(record.key, "note", e.target.value)}
        />
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      render: (_: any, record: PaymentRow) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemovePayment(record.key)}
          disabled={payments.length === 1}
        />
      ),
    },
  ];

  const productColumns = [
    {
      title: "Producto",
      key: "product",
      render: (_: any, record: any) => record.product?.name || "N/A",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number) => qty.toFixed(0),
    },
    {
      title: "Precio Unit.",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => `$${price.toLocaleString('es-CO')}`,
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right" as const,
      render: (total: number) => <strong>${total.toLocaleString('es-CO')}</strong>,
    },
  ];

  const totalPayments = calculateTotalPayments();
  const difference = totalPayments - order.totalAmount;

  return (
    <Modal
      title={`Aprobar Pedido ${order.orderNumber}`}
      open={open}
      onCancel={handleCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancelar
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={saving}
          onClick={handleSubmit}
          disabled={Math.abs(difference) > 1}
        >
          Aprobar y Crear Venta
        </Button>,
      ]}
    >
      <div>
        <Divider>Productos del Pedido</Divider>

        <Table
          columns={productColumns}
          dataSource={order.details}
          rowKey="id"
          pagination={false}
          size="small"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>
                  <strong>Total del Pedido</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong style={{ fontSize: 16 }}>
                    ${order.totalAmount.toLocaleString('es-CO')}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />

        <Divider>Formas de Pago</Divider>

        <Button
          type="dashed"
          onClick={handleAddPayment}
          icon={<PlusOutlined />}
          style={{ marginBottom: 16, width: "100%" }}
        >
          Agregar Forma de Pago
        </Button>

        <Table
          columns={paymentColumns}
          dataSource={payments}
          pagination={false}
          size="small"
        />

        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col span={8}>
            <div style={{ padding: 12, background: "#f0f0f0", borderRadius: 4 }}>
              <div style={{ color: "#666" }}>Total Pedido</div>
              <div style={{ fontSize: 18, fontWeight: "bold" }}>
                ${order.totalAmount.toLocaleString('es-CO')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ padding: 12, background: "#f0f0f0", borderRadius: 4 }}>
              <div style={{ color: "#666" }}>Total Pagos</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: Math.abs(difference) > 1 ? "#ff4d4f" : "#52c41a",
                }}
              >
                ${totalPayments.toLocaleString('es-CO')}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div style={{ padding: 12, background: "#f0f0f0", borderRadius: 4 }}>
              <div style={{ color: "#666" }}>Diferencia</div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: Math.abs(difference) > 1 ? "#ff4d4f" : "#52c41a",
                }}
              >
                ${difference.toLocaleString('es-CO')}
              </div>
            </div>
          </Col>
        </Row>

        {Math.abs(difference) > 1 && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              background: "#fff2e8",
              border: "1px solid #ffbb96",
              borderRadius: 4,
              color: "#d4380d",
            }}
          >
            ⚠️ La suma de los pagos debe ser exactamente igual al total del pedido
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ApproveOrderModal;
