import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Card,
  Button,
  Modal,
  InputNumber,
  Input,
  Alert,
  Statistic,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Divider,
  message,
  Spin,
} from 'antd';
import {
  PlayCircleOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import api from '../../services/api';

const { Text } = Typography;
const { TextArea } = Input;

interface CashSessionManagerProps {
  onSessionChange?: (session: any) => void;
}

export interface CashSessionManagerRef {
  refreshSession: () => Promise<void>;
}

const CashSessionManager = forwardRef<CashSessionManagerRef, CashSessionManagerProps>(({ 
  onSessionChange 
}, ref) => {
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openModalVisible, setOpenModalVisible] = useState(false);
  const [openData, setOpenData] = useState({ openingCash: 0, notes: '' });
  const [sessionStats, setSessionStats] = useState<any>(null);

  // Exponer método para refrescar sesión desde el componente padre
  useImperativeHandle(ref, () => ({
    refreshSession: loadActiveSession
  }));

  // Cargar sesión activa al montar el componente
  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cash-session/active');
      const result = response.data;
      
      if (result.success && result.data) {
        const sessionData = result.data;
        setActiveSession(sessionData.session);
        setSessionStats(sessionData.statistics);
        // Notificar cambio de sesión al padre
        onSessionChange?.(sessionData.session);
      } else {
        setActiveSession(null);
        setSessionStats(null);
        // Notificar que no hay sesión activa
        onSessionChange?.(null);
      }
    } catch (error) {
      console.error('Error loading active session:', error);
      setActiveSession(null);
      setSessionStats(null);
      onSessionChange?.(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCash = async () => {
    try {
      const response = await api.post('/cash-session/open', openData);
      const result = response.data;
      
      if (result.success) {
        message.success(result.message || 'Caja abierta exitosamente');
        setOpenModalVisible(false);
        setOpenData({ openingCash: 0, notes: '' });
        await loadActiveSession(); // Recargar sesión
      } else {
        message.error(result.message || 'Error al abrir caja');
      }
    } catch (error) {
      console.error('Error opening cash:', error);
      message.error('Error al abrir caja');
    }
  };

  // Función handleCloseCash removida - ahora el cierre se maneja desde el modal detallado
  /*
  const handleCloseCash = async () => {
    try {
      const response = await api.post('/cash-session/close', closeData);
      const result = response.data;
      
      if (result.success) {
        message.success(result.message || 'Caja cerrada exitosamente');
        setCloseModalVisible(false);
        setCloseData({ closingCash: 0, notes: '' });
        await loadActiveSession();
        
        if (result.statistics) {
          Modal.success({
            title: '🎉 Caja Cerrada Exitosamente',
            content: (
              <div>
                <p><strong>Duración:</strong> {result.statistics.duration} horas</p>
                <p><strong>Ventas:</strong> ${result.statistics.totalSales?.toLocaleString() || 0}</p>
                <p><strong>Diferencia:</strong> ${result.statistics.difference?.toLocaleString() || 0}</p>
              </div>
            ),
            width: 400
          });
        }
      } else {
        message.error(result.message || 'Error al cerrar caja');
      }
    } catch (error) {
      console.error('Error closing cash:', error);
      message.error('Error al cerrar caja');
    }
  };
  */

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
          <br />
          <Text>Cargando estado de caja...</Text>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <DollarOutlined />
            <span>Control de Caja</span>
          </Space>
        }
      >
        {!activeSession ? (
          // No hay sesión activa - Mostrar botón para abrir caja
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Alert
              message="🔒 Caja Cerrada"
              description="No hay ninguna caja abierta. Ábrela para empezar a registrar ventas."
              type="warning"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <Button
              type="primary"
              size="large"
              icon={<PlayCircleOutlined />}
              onClick={() => setOpenModalVisible(true)}
            >
              Abrir Caja
            </Button>
          </div>
        ) : (
          // Hay sesión activa - Mostrar información y botón cerrar
          <div>
            <Row gutter={16} style={{ marginBottom: '20px' }}>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Turno #"
                    value={activeSession.sessionNumber}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Dinero Inicial"
                    value={activeSession.openingCash}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Statistic
                    title="Duración"
                    value={formatDuration(sessionStats?.duration || 0)}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" style={{ textAlign: 'center' }}>
                  <Tag color="green" style={{ fontSize: '14px', padding: '4px 12px' }}>
                    <CheckCircleOutlined /> ACTIVA
                  </Tag>
                </Card>
              </Col>
            </Row>

            {sessionStats && (
              <>
                <Divider>Estado Actual</Divider>
                <Row gutter={16} style={{ marginBottom: '20px' }}>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Ventas Realizadas"
                        value={sessionStats.salesCount}
                        suffix="ventas"
                        prefix={<ShoppingCartOutlined />}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Total Vendido"
                        value={sessionStats.totalSales}
                        prefix="$"
                        valueStyle={{ color: '#52c41a' }}
                      />
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Statistic
                        title="Efectivo Esperado"
                        value={sessionStats.expectedCash}
                        prefix="$"
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Text type="secondary">
                  Abierta por: {activeSession.openedBy?.name || 'Sistema'} • 
                  {new Date(activeSession.openedAt).toLocaleString()}
                </Text>
              </Space>
              <br />
              {/* Botón de cerrar caja removido - ahora el cierre se hace desde el modal detallado */}
              <Text type="secondary" style={{ marginTop: '10px', display: 'block' }}>
                💡 Para cerrar la caja, usa el botón "Hacer Cierre" en la parte superior
              </Text>
            </div>
          </div>
        )}
      </Card>

      {/* Modal Abrir Caja */}
      <Modal
        title="🔓 Abrir Caja"
        visible={openModalVisible}
        onCancel={() => setOpenModalVisible(false)}
        onOk={handleOpenCash}
        okText="Abrir Caja"
        cancelText="Cancelar"
      >
        <div>
          <Text strong>¿Con cuánto dinero inicias la caja?</Text>
          <InputNumber
            size="large"
            style={{ width: '100%', margin: '10px 0' }}
            placeholder="0"
            formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => Number(value!.replace(/\$\s?|(,*)/g, '')) || 0}
            value={openData.openingCash}
            onChange={(value) => setOpenData({ ...openData, openingCash: value || 0 })}
          />
          
          <Text strong>Notas (Opcional):</Text>
          <TextArea
            rows={3}
            placeholder="Observaciones al abrir la caja..."
            value={openData.notes}
            onChange={(e) => setOpenData({ ...openData, notes: e.target.value })}
            style={{ marginTop: '10px' }}
          />
        </div>
      </Modal>

      {/* Modal Cerrar Caja - DESHABILITADO - Ahora se usa el modal detallado */}
      {/* 
      <Modal
        title="🔒 Cerrar Caja"
        visible={closeModalVisible}
        onCancel={() => setCloseModalVisible(false)}
        onOk={handleCloseCash}
        okText="Cerrar Caja"
        cancelText="Cancelar"
        width={600}
      >
        ... contenido del modal ...
      </Modal>
      */}
    </>
  );
});

CashSessionManager.displayName = 'CashSessionManager';

export default CashSessionManager;