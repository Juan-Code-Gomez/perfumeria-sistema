import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Alert,
  Space,
  Descriptions,
  Spin,
  Typography,
  Tooltip,
  Modal,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

interface CashClosingSummary {
  fecha: string;
  totalSales: number;
  cashSales: number;
  cardSales: number;
  transferSales: number;
  creditSales: number;
  totalIncome: number;
  totalExpense: number;
  totalPayments: number;
  systemCash: number;
}

interface CashClosingFormProps {
  summary?: CashClosingSummary;
  loading?: boolean;
  onSubmit: (values: any) => Promise<void>;
  onDateChange: (date: any) => void;
  initialDate?: any;
}

const CashClosingForm: React.FC<CashClosingFormProps> = ({
  summary,
  loading,
  onSubmit,
  onDateChange,
  initialDate,
}) => {
  const [form] = Form.useForm();
  const [difference, setDifference] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showExtraIncomeModal, setShowExtraIncomeModal] = useState(false);
  const [isLateClosing, setIsLateClosing] = useState(false);
  const [closingDate, setClosingDate] = useState(initialDate);

  useEffect(() => {
    if (initialDate) {
      form.setFieldsValue({ date: initialDate });
      checkIfLateClosing(initialDate);
    }
  }, [initialDate, form]);

  const checkIfLateClosing = (date: any) => {
    if (!date) return;
    const selectedDate = dayjs(date).format('YYYY-MM-DD');
    const today = dayjs().format('YYYY-MM-DD');
    setIsLateClosing(selectedDate !== today);
    setClosingDate(date);
  };

  const handleDateChange = (date: any) => {
    checkIfLateClosing(date);
    onDateChange(date);
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await onSubmit(values);
    } finally {
      setSaving(false);
    }
  };

  const handleValuesChange = (_: any, values: any) => {
    if (summary && values.closingCash !== undefined) {
      const extraIncome = values.totalIncome || 0;
      const adjustedSystemCash = summary.systemCash + extraIncome;
      setDifference(values.closingCash - adjustedSystemCash);
    }
  };

  const getDifferenceStatus = () => {
    if (difference === 0) return 'success';
    if (Math.abs(difference) <= 5000) return 'warning';
    return 'error';
  };

  const getDifferenceIcon = () => {
    if (difference === 0) return <CheckCircleOutlined />;
    if (Math.abs(difference) <= 5000) return <InfoCircleOutlined />;
    return <CloseCircleOutlined />;
  };

  const getDifferenceMessage = () => {
    if (difference === 0) return 'Caja Cuadrada - Sin Diferencia';
    if (difference > 0) return `Sobra $${difference.toLocaleString()}`;
    return `Falta $${Math.abs(difference).toLocaleString()}`;
  };

  const shouldShowWarning = () => {
    return Math.abs(difference) > 10000; // Alerta si la diferencia es mayor a $10,000
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Spin size="large" tip="Calculando resumen del día..." />
      </div>
    );
  }

  if (!summary) {
    return (
      <Alert
        message="⚠️ Sin datos para mostrar"
        description="No hay ventas ni gastos registrados para el día seleccionado"
        type="warning"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Advertencia de cierre tardío */}
      {isLateClosing && (
        <Alert
          message="⚠️ ADVERTENCIA: Cierre de Caja con Retraso"
          description={
            <div>
              <p>
                Estás cerrando la caja del día <strong>{dayjs(closingDate).format('DD/MM/YYYY')}</strong> pero hoy es <strong>{dayjs().format('DD/MM/YYYY')}</strong>.
              </p>
              <p style={{ marginBottom: 8 }}>
                Los cierres tardíos pueden causar descuadres porque:
              </p>
              <ul style={{ marginBottom: 8, paddingLeft: 20 }}>
                <li>Las ventas se registran cuando se confirman, no cuando se realizan</li>
                <li>Transferencias confirmadas hoy aparecerán en el cierre de hoy</li>
                <li>Puede haber confusión sobre qué transacciones pertenecen a qué día</li>
              </ul>
              <p style={{ marginBottom: 0 }}>
                <strong>Recomendación:</strong> Realizar los cierres diariamente al finalizar operaciones para evitar descuadres.
              </p>
            </div>
          }
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 24 }}
          closable
        />
      )}

      {/* Resumen del día */}
      <Title level={4} className="mb-4">📊 Resumen del Día</Title>
      
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={8}>
          <Card size="small" className="text-center">
            <Statistic
              title="💰 Total Ventas"
              value={summary.totalSales}
              prefix="$"
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Statistic
              title="💸 Total Gastos"
              value={summary.totalExpense}
              prefix="$"
              valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className="text-center">
            <Statistic
              title="🖥️ Caja Sistema"
              value={summary.systemCash + (form.getFieldValue('totalIncome') || 0)}
              prefix="$"
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      <Descriptions
        column={2}
        bordered
        size="small"
        className="mb-6"
        title="💳 Desglose por Método de Pago"
      >
        <Descriptions.Item label="💵 Efectivo">
          <Text strong>${summary.cashSales?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="💳 Tarjeta">
          <Text strong>${summary.cardSales?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="🏦 Transferencia">
          <Text strong>${summary.transferSales?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="📋 Crédito">
          <Text strong>${summary.creditSales?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="🏪 Pagos Proveedores">
          <Text strong>${summary.totalPayments?.toLocaleString()}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="💰 Ingresos Extra">
          <Text strong>${(form.getFieldValue('totalIncome') || 0).toLocaleString()}</Text>
        </Descriptions.Item>
      </Descriptions>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
        initialValues={{
          date: initialDate,
          openingCash: 0,
          closingCash: 0,
          totalIncome: 0,
          notes: "",
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <CalendarOutlined />
                  <span>Fecha del Cierre</span>
                </Space>
              }
              name="date"
              rules={[{ required: true, message: "Selecciona la fecha" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
                onChange={handleDateChange}
                allowClear={false}
                placeholder="Seleccionar fecha"
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <DollarOutlined />
                  <span>Saldo Inicial (Apertura)</span>
                </Space>
              }
              name="openingCash"
              rules={[
                { required: true, message: "Ingresa el saldo inicial" },
                { type: 'number', min: 0, message: "El saldo no puede ser negativo" }
              ]}
              tooltip="Efectivo que había en caja al iniciar el día"
            >
              <InputNumber
                min={0}
                max={10000000}
                formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                style={{ width: "100%" }}
                placeholder="0"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <DollarOutlined />
                  <span>Saldo Final Contado</span>
                </Space>
              }
              name="closingCash"
              rules={[
                { required: true, message: "Ingresa el saldo contado" },
                { type: 'number', min: 0, message: "El saldo no puede ser negativo" }
              ]}
              tooltip="Efectivo real contado físicamente al final del día"
            >
              <InputNumber
                min={0}
                max={10000000}
                formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                style={{ width: "100%" }}
                placeholder="0"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={
                <Space>
                  <InfoCircleOutlined />
                  <span>Ingresos Extra</span>
                  <Tooltip title="Dinero adicional que ingresó a caja (préstamos, devoluciones, etc.)">
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => setShowExtraIncomeModal(true)}
                    >
                      ¿Qué incluir?
                    </Button>
                  </Tooltip>
                </Space>
              }
              name="totalIncome"
              tooltip="Ingresos adicionales no registrados como ventas"
            >
              <InputNumber
                min={0}
                max={10000000}
                formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                style={{ width: "100%" }}
                placeholder="0 (opcional)"
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Indicador de diferencia */}
        <Card 
          size="small" 
          className={`mb-4 ${
            getDifferenceStatus() === 'success' ? 'border-green-400' : 
            getDifferenceStatus() === 'warning' ? 'border-yellow-400' : 'border-red-400'
          }`}
        >
          <Row justify="center" align="middle">
            <Col span={24} className="text-center">
              <Text strong style={{ fontSize: '16px' }}>
                ⚖️ Diferencia: {" "}
                <Tag 
                  icon={getDifferenceIcon()} 
                  color={getDifferenceStatus()} 
                  style={{ fontSize: '14px' }}
                >
                  {getDifferenceMessage()}
                </Tag>
              </Text>
              {shouldShowWarning() && (
                <div className="mt-2">
                  <Alert
                    message={
                      <Space>
                        <WarningOutlined />
                        <span>Diferencia significativa detectada</span>
                      </Space>
                    }
                    description="La diferencia es mayor a $10,000. Verifica el conteo y registros."
                    type="warning"
                    showIcon
                  />
                </div>
              )}
            </Col>
          </Row>
        </Card>

        <Form.Item
          label={
            <Space>
              <InfoCircleOutlined />
              <span>Observaciones</span>
            </Space>
          }
          name="notes"
        >
          <Input.TextArea 
            placeholder="Cualquier observación sobre el cierre del día (opcional)" 
            rows={3}
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving}
            block
            size="large"
            disabled={!summary || summary.totalSales === 0}
            icon={<CheckCircleOutlined />}
          >
            {saving ? 'Guardando...' : 'Registrar Cierre de Caja'}
          </Button>
          {summary && summary.totalSales === 0 && (
            <Alert
              message="No hay ventas registradas para este día"
              type="warning"
              showIcon
              className="mt-2"
            />
          )}
        </Form.Item>
      </Form>

      {/* Modal de ayuda para ingresos extra */}
      <Modal
        title="💰 ¿Qué incluir en Ingresos Extra?"
        open={showExtraIncomeModal}
        onCancel={() => setShowExtraIncomeModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowExtraIncomeModal(false)}>
            Cerrar
          </Button>
        ]}
      >
        <div>
          <Title level={5}>Incluir en Ingresos Extra:</Title>
          <ul>
            <li>💸 Préstamos recibidos en efectivo</li>
            <li>🔄 Devoluciones de gastos en efectivo</li>
            <li>💵 Cambio de billetes grandes por menores</li>
            <li>🎁 Ingresos por servicios no registrados en el sistema</li>
            <li>💰 Dinero encontrado o recuperado</li>
          </ul>
          
          <Divider />
          
          <Title level={5}>NO incluir:</Title>
          <ul>
            <li>❌ Ventas (ya están contabilizadas)</li>
            <li>❌ Pagos con tarjeta o transferencia</li>
            <li>❌ Dinero prestado (que debe devolverse)</li>
            <li>❌ Cambios para clientes</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default CashClosingForm;
