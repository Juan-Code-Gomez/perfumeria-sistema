// src/components/invoices/PaymentModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Select,
  DatePicker,
  Input,
  Table,
  Space,
  message,
  Divider,
  Row,
  Col,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  DollarOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  registerInvoicePayment,
  getPaymentHistory,
  type InvoicePayment,
} from '../../services/invoicePaymentService';

const { TextArea } = Input;
const { Text } = Typography;

interface Invoice {
  id: number;
  invoiceNumber: string;
  supplierName: string;
  amount: number;
  paidAmount: number;
  status: string;
  dueDate?: string;
}

interface PaymentModalProps {
  visible: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  invoice,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<InvoicePayment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const remainingAmount = invoice ? invoice.amount - invoice.paidAmount : 0;

  useEffect(() => {
    if (visible && invoice) {
      loadPaymentHistory();
      // Resetear el formulario con valores predeterminados
      form.setFieldsValue({
        amount: remainingAmount,
        paymentDate: dayjs(),
        paymentMethod: 'EFECTIVO',
      });
    }
  }, [visible, invoice]);

  const loadPaymentHistory = async () => {
    if (!invoice) return;
    
    setLoadingHistory(true);
    try {
      const response = await getPaymentHistory(invoice.id);
      setPaymentHistory(response.payments);
    } catch (error: any) {
      console.error('Error loading payment history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async () => {
    if (!invoice) return;

    try {
      const values = await form.validateFields();
      
      if (values.amount > remainingAmount) {
        message.error(`El monto no puede exceder el saldo pendiente de $${remainingAmount.toLocaleString('es-CO')}`);
        return;
      }

      setLoading(true);

      const paymentData = {
        invoiceId: invoice.id,
        amount: values.amount,
        paymentDate: values.paymentDate ? values.paymentDate.toISOString() : undefined,
        paymentMethod: values.paymentMethod,
        notes: values.notes,
      };

      await registerInvoicePayment(paymentData);
      
      message.success('Pago registrado exitosamente');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error registering payment:', error);
      message.error(error.response?.data?.message || 'Error al registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const paymentColumns = [
    {
      title: 'Fecha',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Monto',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right' as const,
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          ${Math.round(amount).toLocaleString('es-CO')}
        </Text>
      ),
    },
    {
      title: 'Método',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 120,
      render: (method: string) => method || 'N/A',
    },
    {
      title: 'Notas',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes: string) => notes || '-',
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <DollarOutlined style={{ color: '#52c41a' }} />
          <span>Registrar Pago de Factura</span>
        </Space>
      }
      open={visible}
      onOk={handleSubmit}
      onCancel={handleCancel}
      width={900}
      confirmLoading={loading}
      okText="Registrar Pago"
      cancelText="Cancelar"
      okButtonProps={{ disabled: remainingAmount <= 0 }}
    >
      {invoice && (
        <>
          {/* Información de la Factura */}
          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Factura"
                  value={invoice.invoiceNumber}
                  valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Proveedor"
                  value={invoice.supplierName}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Estado"
                  value={invoice.status}
                  valueRender={() => {
                    const colors: Record<string, string> = {
                      PENDING: 'warning',
                      PARTIAL: 'processing',
                      PAID: 'success',
                    };
                    return <Tag color={colors[invoice.status] || 'default'}>{invoice.status}</Tag>;
                  }}
                />
              </Col>
            </Row>
            
            <Divider style={{ margin: '12px 0' }} />
            
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Monto Total"
                  value={Math.round(invoice.amount)}
                  prefix="$"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Pagado"
                  value={Math.round(invoice.paidAmount)}
                  prefix="$"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Saldo Pendiente"
                  value={Math.round(remainingAmount)}
                  prefix="$"
                  valueStyle={{ color: remainingAmount > 0 ? '#ff4d4f' : '#52c41a' }}
                />
              </Col>
            </Row>
          </div>

          {remainingAmount > 0 ? (
            <>
              {/* Formulario de Pago */}
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="amount"
                      label="Monto a Pagar"
                      rules={[
                        { required: true, message: 'Ingresa el monto a pagar' },
                        {
                          validator: (_, value) => {
                            if (value > remainingAmount) {
                              return Promise.reject(`El monto no puede exceder $${remainingAmount.toLocaleString('es-CO')}`);
                            }
                            if (value <= 0) {
                              return Promise.reject('El monto debe ser mayor a 0');
                            }
                            return Promise.resolve();
                          },
                        },
                      ]}
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        prefix="$"
                        placeholder="Monto"
                        min={0}
                        max={remainingAmount}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="paymentDate"
                      label="Fecha de Pago"
                      initialValue={dayjs()}
                      rules={[{ required: true, message: 'Selecciona la fecha' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        placeholder="Fecha de pago"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="paymentMethod"
                  label="Método de Pago"
                  initialValue="EFECTIVO"
                >
                  <Select placeholder="Selecciona método de pago">
                    <Select.Option value="EFECTIVO">💵 Efectivo</Select.Option>
                    <Select.Option value="TRANSFERENCIA">🏦 Transferencia</Select.Option>
                    <Select.Option value="TARJETA">💳 Tarjeta</Select.Option>
                    <Select.Option value="CHEQUE">📝 Cheque</Select.Option>
                    <Select.Option value="OTRO">Otro</Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item name="notes" label="Notas (opcional)">
                  <TextArea
                    rows={3}
                    placeholder="Notas o comentarios sobre el pago..."
                  />
                </Form.Item>
              </Form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Tag color="success" style={{ fontSize: '16px', padding: '8px 16px' }}>
                ✅ Factura totalmente pagada
              </Tag>
            </div>
          )}

          {/* Historial de Pagos */}
          <Divider orientation="left">
            <Space>
              <ClockCircleOutlined />
              <span>Historial de Pagos</span>
            </Space>
          </Divider>

          <Table
            columns={paymentColumns}
            dataSource={paymentHistory}
            rowKey="id"
            loading={loadingHistory}
            pagination={false}
            size="small"
            locale={{ emptyText: 'No hay pagos registrados' }}
            scroll={{ y: 200 }}
          />
        </>
      )}
    </Modal>
  );
};

export default PaymentModal;
