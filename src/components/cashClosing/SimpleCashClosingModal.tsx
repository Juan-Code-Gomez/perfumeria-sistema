import React, { useState } from 'react';
import {
  Modal,
  Steps,
  Button,
  Card,
  Row,
  Col,
  Statistic,
  InputNumber,
  Input,
  Space,
  Typography,
  Alert,
  Divider,
  Spin,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  FilePdfOutlined,
  EyeOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface SimpleCashClosingModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  summary: any;
  loading?: boolean;
  selectedDate: string;
}

const SimpleCashClosingModal: React.FC<SimpleCashClosingModalProps> = ({
  visible,
  onClose,
  onSubmit,
  summary,
  loading,
  selectedDate
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    openingCash: 0,
    closingCash: 0,
    notes: ''
  });
  const [generating, setGenerating] = useState(false);

  // Cálculos automáticos
  const expectedCash = summary ? 
    (formData.openingCash || 0) + 
    (summary.cashSales || 0) + 
    (summary.totalIncome || 0) - 
    (summary.totalExpense || 0) - 
    (summary.totalPayments || 0) : 0;

  const difference = (formData.closingCash || 0) - expectedCash;

  const getDifferenceStatus = () => {
    const abs = Math.abs(difference);
    if (abs === 0) return { status: 'success', icon: <CheckCircleOutlined />, text: 'Perfecto - Caja Cuadrada' };
    if (abs <= 5000) return { status: 'warning', icon: <InfoCircleOutlined />, text: 'Diferencia Menor' };
    return { status: 'error', icon: <WarningOutlined />, text: 'Diferencia Significativa' };
  };

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await onSubmit({
        date: selectedDate,
        openingCash: formData.openingCash,
        closingCash: formData.closingCash,
        notes: formData.notes
      });
      setCurrentStep(0);
      setFormData({ openingCash: 0, closingCash: 0, notes: '' });
      onClose();
    } catch (error) {
      console.error('Error al crear cierre:', error);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      // Descargar PDF del cierre
      const response = await fetch(`/api/cash-closing/report/pdf/${selectedDate}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `cierre-caja-${selectedDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGenerating(false);
    }
  };

  const steps = [
    {
      title: 'Dinero Inicial',
      content: (
        <Card>
          <Title level={4}>💰 ¿Con cuánto dinero abriste la caja hoy?</Title>
          <Text type="secondary">
            Introduce la cantidad exacta de dinero con la que iniciaste el día
          </Text>
          <div style={{ margin: '20px 0' }}>
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              value={formData.openingCash}
              onChange={(value) => setFormData({ ...formData, openingCash: value || 0 })}
            />
          </div>
          {formData.openingCash > 0 && (
            <Alert
              message={`Dinero inicial registrado: $${formData.openingCash.toLocaleString()}`}
              type="success"
              showIcon
            />
          )}
        </Card>
      )
    },
    {
      title: 'Conteo Final',
      content: (
        <Card>
          <Title level={4}>🧮 ¿Cuánto dinero hay en la caja ahora?</Title>
          <Text type="secondary">
            Cuenta todo el efectivo que tienes en la caja en este momento
          </Text>
          
          {summary && (
            <div style={{ margin: '20px 0' }}>
              <Alert
                message="💡 Ayuda para el conteo"
                description={
                  <div>
                    <Text>Según las ventas del día, deberías tener aproximadamente:</Text>
                    <br />
                    <Text strong>${expectedCash.toLocaleString()}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      (Inicial: ${(formData.openingCash || 0).toLocaleString()} + 
                      Ventas efectivo: ${(summary.cashSales || 0).toLocaleString()} - 
                      Gastos: ${(summary.totalExpense || 0).toLocaleString()})
                    </Text>
                  </div>
                }
                type="info"
                showIcon
              />
            </div>
          )}

          <div style={{ margin: '20px 0' }}>
            <InputNumber
              size="large"
              style={{ width: '100%' }}
              placeholder="0"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              value={formData.closingCash}
              onChange={(value) => setFormData({ ...formData, closingCash: value || 0 })}
            />
          </div>

          {formData.closingCash > 0 && (
            <Alert
              message={
                <div>
                  <Space>
                    {getDifferenceStatus().icon}
                    <Text strong>{getDifferenceStatus().text}</Text>
                  </Space>
                  <br />
                  <Text>
                    Diferencia: {difference >= 0 ? 'Sobra' : 'Falta'} ${Math.abs(difference).toLocaleString()}
                  </Text>
                </div>
              }
              type={getDifferenceStatus().status as any}
              showIcon={false}
            />
          )}
        </Card>
      )
    },
    {
      title: 'Confirmación',
      content: (
        <Card>
          <Title level={4}>✅ Resumen del Cierre</Title>
          
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Dinero Inicial"
                  value={formData.openingCash}
                  prefix="$"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Dinero Final"
                  value={formData.closingCash}
                  prefix="$"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title="Diferencia"
                  value={Math.abs(difference)}
                  prefix={difference >= 0 ? '+$' : '-$'}
                  valueStyle={{ color: difference === 0 ? '#52c41a' : difference > 0 ? '#1890ff' : '#ff4d4f' }}
                />
              </Card>
            </Col>
          </Row>

          {summary && (
            <>
              <Divider>Resumen de Ventas</Divider>
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary">Total Ventas</Text>
                  <br />
                  <Text strong>${(summary.totalSales || 0).toLocaleString()}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Efectivo</Text>
                  <br />
                  <Text strong>${(summary.cashSales || 0).toLocaleString()}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Tarjeta</Text>
                  <br />
                  <Text strong>${(summary.cardSales || 0).toLocaleString()}</Text>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Gastos</Text>
                  <br />
                  <Text strong>${(summary.totalExpense || 0).toLocaleString()}</Text>
                </Col>
              </Row>
            </>
          )}

          <Divider>Notas Adicionales (Opcional)</Divider>
          <TextArea
            rows={3}
            placeholder="Agrega cualquier observación sobre el cierre de caja..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />

          {Math.abs(difference) > 10000 && (
            <Alert
              message="⚠️ Diferencia Significativa Detectada"
              description="Se recomienda revisar el conteo y las transacciones del día antes de confirmar el cierre."
              type="warning"
              showIcon
              style={{ marginTop: '16px' }}
            />
          )}
        </Card>
      )
    }
  ];

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            🏪 Cierre de Caja Fácil
          </Title>
          <Text type="secondary">
            Fecha: {new Date(selectedDate).toLocaleDateString('es-ES')}
          </Text>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <br />
          <Text>Cargando datos del día...</Text>
        </div>
      ) : (
        <>
          <Steps current={currentStep} style={{ marginBottom: '30px' }}>
            <Steps.Step title="Dinero Inicial" icon={<DollarOutlined />} />
            <Steps.Step title="Conteo Final" icon={<EyeOutlined />} />
            <Steps.Step title="Confirmación" icon={<CheckCircleOutlined />} />
          </Steps>

          <div style={{ minHeight: '400px', marginBottom: '20px' }}>
            {steps[currentStep].content}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Space size="middle">
              {currentStep > 0 && (
                <Button onClick={handlePrev}>
                  Atrás
                </Button>
              )}
              
              {currentStep === 2 && (
                <Button
                  type="default"
                  icon={<FilePdfOutlined />}
                  loading={generating}
                  onClick={handleGeneratePDF}
                >
                  Ver Reporte PDF
                </Button>
              )}

              {currentStep < 2 ? (
                <Button
                  type="primary"
                  onClick={handleNext}
                  disabled={
                    (currentStep === 0 && formData.openingCash <= 0) ||
                    (currentStep === 1 && formData.closingCash < 0)
                  }
                >
                  Siguiente
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={handleFinish}
                  loading={loading}
                  size="large"
                >
                  🎉 Completar Cierre
                </Button>
              )}
            </Space>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SimpleCashClosingModal;