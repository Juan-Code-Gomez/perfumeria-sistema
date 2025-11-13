import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  InputNumber,
  Input,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  Alert,
  Space,
  Typography,
  Descriptions,
  Divider,
  Spin,
  DatePicker,
  message,
} from 'antd';
import {
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseCircleOutlined,
  CalculatorOutlined,
  FilePdfOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Text } = Typography;
const { TextArea } = Input;

interface DetailedCashClosingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  summary: any;
  loading?: boolean;
  selectedDate: string;
  activeSession?: any; // Información de la sesión activa
}

const DetailedCashClosingModal: React.FC<DetailedCashClosingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  summary,
  loading,
  selectedDate,
  activeSession
}) => {
  const [form] = Form.useForm();
  const [generating, setGenerating] = useState(false);
  const [calculatedDiff, setCalculatedDiff] = useState(0);

  // Calcular diferencia en tiempo real
  useEffect(() => {
    const openingCash = form.getFieldValue('openingCash') || activeSession?.openingCash || 0;
    const closingCash = form.getFieldValue('closingCash') || 0;
    
    if (summary && closingCash > 0) {
      const systemCash = openingCash + (summary.cashSales || 0) - (summary.totalExpense || 0) - (summary.totalPayments || 0);
      const diff = closingCash - systemCash;
      setCalculatedDiff(diff);
    }
  }, [form, summary, activeSession]);

  // Inicializar valores del formulario
  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        date: dayjs(selectedDate),
        openingCash: activeSession?.openingCash || 0,
        closingCash: 0,
        notes: ''
      });
    }
  }, [activeSession, visible, selectedDate, form]);

  const handleSubmit = async (values: any) => {
    try {
      // Asegurarnos de que date sea un objeto dayjs
      const dateValue = values.date instanceof dayjs ? values.date : dayjs(values.date);
      
      await onSubmit({
        ...values,
        date: dateValue,
        openingCash: activeSession?.openingCash || values.openingCash || 0
      });
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      
      // Verificar primero si existe un cierre para este día
      const checkResponse = await api.get(`/cash-closing/summary?date=${selectedDate}`);
      
      if (!checkResponse.data || !checkResponse.data.closingExists) {
        message.warning('⚠️ Debes completar el cierre de caja primero antes de generar el reporte PDF');
        return;
      }
      
      // Usar axios para descargar el PDF
      const response = await api.get(`/cash-closing/report/pdf/${selectedDate}`, {
        responseType: 'blob', // Importante para recibir el archivo como blob
      });
      
      // Crear un blob desde la respuesta
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cierre-caja-detallado-${selectedDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      // Manejar errores específicos
      if (error.response?.data?.error) {
        message.error(error.response.data.error);
      } else if (error.response?.status === 404) {
        message.warning('No se encontró el cierre de caja para este día. Completa el cierre primero.');
      } else {
        message.error('Error al generar el PDF. Por favor intenta de nuevo.');
      }
    } finally {
      setGenerating(false);
    }
  };

  const getDifferenceStatus = () => {
    const abs = Math.abs(calculatedDiff);
    if (abs === 0) return { status: 'success', icon: <CheckCircleOutlined />, text: 'Caja Cuadrada - Sin Diferencia', color: 'success' };
    if (abs <= 5000) return { status: 'warning', icon: <InfoCircleOutlined />, text: 'Diferencia Menor', color: 'warning' };
    return { status: 'error', icon: <CloseCircleOutlined />, text: 'Diferencia Significativa', color: 'error' };
  };

  const diffStatus = getDifferenceStatus();

  return (
    <Modal
      title={
        <Space>
          <CalculatorOutlined />
          <span>Registrar Cierre de Caja - {dayjs(selectedDate).format('DD/MM/YYYY')}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <br />
          <Text>Cargando resumen del día...</Text>
        </div>
      ) : !summary ? (
        <Alert
          message="⚠️ Sin datos para mostrar"
          description="No hay ventas ni gastos registrados para el día seleccionado"
          type="warning"
          showIcon
        />
      ) : (
        <div>
          {/* Información de la sesión activa */}
          {activeSession && (
            <Alert
              message={`🔓 Caja Activa - Turno #${activeSession.sessionNumber}`}
              description={`Abierta por: ${activeSession.openedBy?.name || 'Sistema'} • ${dayjs(activeSession.openedAt).format('DD/MM/YYYY HH:mm')}`}
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          {/* Resumen del día */}
          <Card title="📊 Resumen del Día" style={{ marginBottom: '20px' }}>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="💰 Total Ventas"
                    value={summary.totalSales || 0}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="💸 Total Gastos"
                    value={summary.totalExpense || 0}
                    prefix="$"
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="🏪 Pagos Proveedores"
                    value={summary.totalPayments || 0}
                    prefix="$"
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="💳 Ventas Efectivo"
                    value={summary.cashSales || 0}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider />

            {/* Desglose de ventas por método */}
            <Descriptions title="Desglose de Ventas por Método de Pago" column={2} bordered size="small">
              <Descriptions.Item label="💵 Efectivo">
                <Text strong>${(summary.cashSales || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="💳 Tarjeta">
                <Text strong>${(summary.cardSales || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="📱 Transferencia">
                <Text strong>${(summary.transferSales || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="📝 Crédito">
                <Text strong>${(summary.creditSales || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="🎁 Otros Ingresos">
                <Text strong>${(summary.totalIncome || 0).toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="💰 Total General">
                <Text strong style={{ color: '#52c41a' }}>${(summary.totalSales || 0).toLocaleString()}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Formulario de cierre */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              date: dayjs(selectedDate),
              openingCash: activeSession?.openingCash || 0
            }}
          >
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={
                    <Space>
                      <CalendarOutlined />
                      <span>Fecha del Cierre</span>
                    </Space>
                  }
                  name="date"
                >
                  <DatePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    disabled
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item
                  label={
                    <Space>
                      <DollarOutlined />
                      <span>Saldo Inicial (Apertura)</span>
                    </Space>
                  }
                  name="openingCash"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                    disabled={!!activeSession} // Disabled if there's an active session
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item
                  label={
                    <Space>
                      <EyeOutlined />
                      <span>Saldo Final Contado</span>
                    </Space>
                  }
                  name="closingCash"
                  rules={[{ required: true, message: 'Ingresa el saldo contado' }]}
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                    placeholder="Dinero contado físicamente"
                    onChange={() => {
                      // Trigger recalculation
                      setTimeout(() => {
                        const values = form.getFieldsValue();
                        const openingCash = values.openingCash || activeSession?.openingCash || 0;
                        const closingCash = values.closingCash || 0;
                        
                        if (summary && closingCash > 0) {
                          const systemCash = openingCash + (summary.cashSales || 0) - (summary.totalExpense || 0) - (summary.totalPayments || 0);
                          const diff = closingCash - systemCash;
                          setCalculatedDiff(diff);
                        }
                      }, 100);
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Cálculo automático del sistema */}
            {summary && (
              <Card 
                title="🧮 Cálculo Automático del Sistema" 
                size="small" 
                style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}
              >
                <Descriptions column={3} size="small">
                  <Descriptions.Item label="Dinero Inicial">
                    ${(activeSession?.openingCash || form.getFieldValue('openingCash') || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="+ Ventas Efectivo">
                    ${(summary.cashSales || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="+ Otros Ingresos">
                    ${(summary.totalIncome || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="- Gastos del Día">
                    ${(summary.totalExpense || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="- Pagos Proveedores">
                    ${(summary.totalPayments || 0).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="= Efectivo Esperado">
                    <Text strong style={{ color: '#1890ff' }}>
                      ${((activeSession?.openingCash || form.getFieldValue('openingCash') || 0) + 
                         (summary.cashSales || 0) + 
                         (summary.totalIncome || 0) - 
                         (summary.totalExpense || 0) - 
                         (summary.totalPayments || 0)).toLocaleString()}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            {/* Indicador de diferencia */}
            {calculatedDiff !== 0 && form.getFieldValue('closingCash') > 0 && (
              <Alert
                message={
                  <Space>
                    {diffStatus.icon}
                    <Text strong>{diffStatus.text}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Text>
                      {calculatedDiff >= 0 ? 'Sobra' : 'Falta'}: ${Math.abs(calculatedDiff).toLocaleString()}
                    </Text>
                    {Math.abs(calculatedDiff) > 10000 && (
                      <div style={{ marginTop: '8px' }}>
                        <Text type="warning">
                          ⚠️ Se recomienda revisar el conteo y las transacciones del día
                        </Text>
                      </div>
                    )}
                  </div>
                }
                type={diffStatus.status as any}
                showIcon={false}
                style={{ marginBottom: '20px' }}
              />
            )}

            <Form.Item
              label={
                <Space>
                  <InfoCircleOutlined />
                  <span>Observaciones (Opcional)</span>
                </Space>
              }
              name="notes"
            >
              <TextArea
                rows={3}
                placeholder="Cualquier observación sobre el cierre del día..."
              />
            </Form.Item>

            {/* Botones de acción */}
            <Row gutter={16}>
              <Col span={12}>
                <Button
                  type="default"
                  icon={<FilePdfOutlined />}
                  loading={generating}
                  onClick={handleGeneratePDF}
                  block
                  title="Completa el cierre de caja primero para poder ver el reporte PDF"
                >
                  Ver Reporte PDF Detallado
                </Button>
                <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '4px', textAlign: 'center' }}>
                  💡 Disponible después de completar el cierre
                </Text>
              </Col>
              <Col span={12}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                  disabled={!summary || summary.totalSales === 0}
                  block
                  size="large"
                >
                  {loading ? 'Guardando...' : 'Completar Cierre de Caja'}
                </Button>
              </Col>
            </Row>

            {summary && summary.totalSales === 0 && (
              <Alert
                message="No hay ventas registradas para este día"
                type="warning"
                showIcon
                style={{ marginTop: '16px' }}
              />
            )}
          </Form>
        </div>
      )}
    </Modal>
  );
};

export default DetailedCashClosingModal;