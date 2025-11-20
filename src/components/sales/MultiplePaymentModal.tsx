// src/components/sales/MultiplePaymentModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Select,
  Table,
  Space,
  Typography,
  InputNumber,
  Divider,
  Tag,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  DollarOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

export interface PaymentMethod {
  id: string;
  method: string;
  amount: number;
  note?: string;
}

interface MultiplePaymentModalProps {
  visible: boolean;
  totalAmount: number;
  onConfirm: (payments: PaymentMethod[]) => void;
  onCancel: () => void;
  isProcessing?: boolean; // Nuevo prop para mostrar loading
}

const PAYMENT_METHODS = [
  { value: 'Efectivo', label: '💵 Efectivo', icon: '💵' },
  { value: 'Transferencia', label: '🏦 Transferencia', icon: '🏦' },
  { value: 'Tarjeta Débito', label: '💳 Tarjeta Débito', icon: '💳' },
  { value: 'Tarjeta Crédito', label: '💳 Tarjeta Crédito', icon: '💳' },
  { value: 'Nequi', label: '📱 Nequi', icon: '📱' },
  { value: 'Daviplata', label: '📱 Daviplata', icon: '📱' },
  { value: 'Otros', label: '💰 Otros', icon: '💰' },
];

const MultiplePaymentModal: React.FC<MultiplePaymentModalProps> = ({
  visible,
  totalAmount,
  onConfirm,
  onCancel,
  isProcessing = false, // Valor por defecto
}) => {
  const [payments, setPayments] = useState<PaymentMethod[]>([]);
  const [form] = Form.useForm();

  // Reiniciar cuando se abre el modal
  useEffect(() => {
    if (visible) {
      setPayments([]);
      form.resetFields();
    }
  }, [visible, form]);

  // Agregar nuevo método de pago
  const addPayment = () => {
    form.validateFields(['method', 'amount']).then((values) => {
      const newPayment: PaymentMethod = {
        id: Date.now().toString(),
        method: values.method,
        amount: values.amount,
        note: values.note || undefined,
      };

      setPayments([...payments, newPayment]);
      form.resetFields(['method', 'amount', 'note']);
    }).catch(() => {
      message.warning('Complete los campos requeridos');
    });
  };

  // Eliminar método de pago
  const removePayment = (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  // Calcular totales
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remaining = totalAmount - totalPaid;
  const isComplete = Math.abs(remaining) < 0.01;

  // Confirmar pagos
  const handleConfirm = () => {
    if (payments.length === 0) {
      message.error('Debe agregar al menos un método de pago');
      return;
    }

    if (!isComplete) {
      message.error(`Falta pagar $${remaining.toLocaleString()}`);
      return;
    }

    onConfirm(payments);
  };

  // Agregar pago rápido (resto en efectivo)
  const addQuickCash = () => {
    if (remaining > 0) {
      const cashPayment: PaymentMethod = {
        id: Date.now().toString(),
        method: 'Efectivo',
        amount: remaining,
        note: 'Resto en efectivo',
      };
      setPayments([...payments, cashPayment]);
    }
  };

  const columns = [
    {
      title: 'Método de Pago',
      dataIndex: 'method',
      key: 'method',
      render: (method: string) => {
        const config = PAYMENT_METHODS.find(p => p.value === method);
        return (
          <Space>
            <span>{config?.icon || '💰'}</span>
            <Text>{method}</Text>
          </Space>
        );
      },
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>${amount.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Nota',
      dataIndex: 'note',
      key: 'note',
      render: (note?: string) => note || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 80,
      render: (_: any, record: PaymentMethod) => (
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removePayment(record.id)}
        />
      ),
    },
  ];

  return (
    <Modal
      title="💳 Métodos de Pago Múltiples"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <div>
            <Text type="secondary">Total a Pagar:</Text>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
              ${totalAmount.toLocaleString()}
            </Title>
          </div>
          <div>
            <Text type="secondary">Total Pagado:</Text>
            <Title level={4} style={{ margin: 0, color: totalPaid >= totalAmount ? '#52c41a' : '#faad14' }}>
              ${totalPaid.toLocaleString()}
            </Title>
          </div>
          <div>
            <Text type="secondary">Restante:</Text>
            <Title level={4} style={{ margin: 0, color: remaining > 0 ? '#ff4d4f' : '#52c41a' }}>
              ${remaining.toLocaleString()}
            </Title>
          </div>
        </Space>
      </div>

      <Divider />

      {/* Formulario para agregar pagos */}
      <Form form={form} layout="vertical">
        <Space size="middle" style={{ display: 'flex', alignItems: 'end' }}>
          <Form.Item
            name="method"
            label="Método de Pago"
            rules={[{ required: true, message: 'Seleccione un método' }]}
            style={{ width: 200 }}
          >
            <Select placeholder="Seleccionar método">
              {PAYMENT_METHODS.map(method => (
                <Option key={method.value} value={method.value}>
                  {method.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Monto"
            rules={[
              { required: true, message: 'Ingrese el monto' },
              { type: 'number', min: 0.01, message: 'El monto debe ser mayor a 0' }
            ]}
            style={{ width: 150 }}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/\$\s?|(,*)/g, '')}
              precision={0}
            />
          </Form.Item>

          <Form.Item
            name="note"
            label="Nota (Opcional)"
            style={{ width: 150 }}
          >
            <Input placeholder="Ej: Referencia" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addPayment}
            >
              Agregar
            </Button>
          </Form.Item>
        </Space>
      </Form>

      {remaining > 0 && (
        <div style={{ margin: '16px 0', textAlign: 'center' }}>
          <Button
            type="dashed"
            icon={<DollarOutlined />}
            onClick={addQuickCash}
          >
            Agregar resto en efectivo (${remaining.toLocaleString()})
          </Button>
        </div>
      )}

      <Divider />

      {/* Tabla de pagos */}
      <Table
        dataSource={payments}
        columns={columns}
        pagination={false}
        size="small"
        locale={{ emptyText: 'No se han agregado métodos de pago' }}
        rowKey="id"
      />

      {/* Estado del pago */}
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        {isComplete ? (
          <Tag color="success" style={{ fontSize: '14px', padding: '8px 16px' }}>
            ✅ Pago Completo
          </Tag>
        ) : remaining > 0 ? (
          <Tag color="warning" style={{ fontSize: '14px', padding: '8px 16px' }}>
            ⚠️ Falta: ${remaining.toLocaleString()}
          </Tag>
        ) : (
          <Tag color="error" style={{ fontSize: '14px', padding: '8px 16px' }}>
            ❌ Sobra: ${Math.abs(remaining).toLocaleString()}
          </Tag>
        )}
      </div>

      {/* Botones de acción */}
      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space>
          <Button onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={!isComplete || payments.length === 0 || isProcessing}
            loading={isProcessing}
            icon={<CreditCardOutlined />}
          >
            Confirmar Pagos
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default MultiplePaymentModal;
