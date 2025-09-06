import React, { useEffect, useState } from 'react';
import { Alert, Button, Modal, Typography, Space, Tag } from 'antd';
import {
  WarningOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface CashClosingAlert {
  type: 'pending' | 'missing' | 'large_difference' | 'daily_reminder';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  actionRequired: boolean;
  data?: any;
}

interface CashClosingAlertsProps {
  lastClosing?: { date: string; difference: number };
  currentSales?: number;
  onCreateClosing?: () => void;
}

const CashClosingAlerts: React.FC<CashClosingAlertsProps> = ({
  lastClosing,
  currentSales = 0,
  onCreateClosing,
}) => {
  const [alerts, setAlerts] = useState<CashClosingAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const generateAlerts = () => {
      const newAlerts: CashClosingAlert[] = [];
      const now = dayjs();
      const today = now.format('YYYY-MM-DD');
      const yesterday = now.subtract(1, 'day').format('YYYY-MM-DD');

      // 1. Verificar si falta cierre de ayer
      if (!lastClosing || lastClosing.date < yesterday) {
        newAlerts.push({
          type: 'missing',
          title: 'Cierre de caja pendiente',
          message: `No se ha registrado el cierre de caja del ${yesterday}`,
          severity: 'error',
          actionRequired: true,
          data: { missingDate: yesterday }
        });
      }

      // 2. Verificar si hay diferencia significativa en el último cierre
      if (lastClosing && Math.abs(lastClosing.difference) > 10000) {
        newAlerts.push({
          type: 'large_difference',
          title: 'Diferencia significativa detectada',
          message: `El último cierre tuvo una diferencia de $${lastClosing.difference.toLocaleString()}`,
          severity: 'warning',
          actionRequired: false,
          data: { difference: lastClosing.difference, date: lastClosing.date }
        });
      }

      // 3. Recordatorio diario (después de las 6 PM y si hay ventas)
      if (now.hour() >= 18 && currentSales > 0 && lastClosing?.date && lastClosing.date < today) {
        newAlerts.push({
          type: 'daily_reminder',
          title: 'Hora de cerrar caja',
          message: `Se recomienda hacer el cierre de caja del día. Ventas registradas: $${currentSales.toLocaleString()}`,
          severity: 'info',
          actionRequired: true,
          data: { sales: currentSales }
        });
      }

      // 4. Alerta si han pasado más de 3 días sin cierre
      if (lastClosing && dayjs().diff(dayjs(lastClosing.date), 'day') > 3) {
        newAlerts.push({
          type: 'pending',
          title: 'Múltiples cierres pendientes',
          message: `Han pasado ${dayjs().diff(dayjs(lastClosing.date), 'day')} días desde el último cierre`,
          severity: 'error',
          actionRequired: true,
          data: { daysPending: dayjs().diff(dayjs(lastClosing.date), 'day') }
        });
      }

      setAlerts(newAlerts);
    };

    generateAlerts();
    
    // Actualizar alertas cada 30 minutos
    const interval = setInterval(generateAlerts, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastClosing, currentSales]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'missing':
      case 'pending':
        return <ExclamationCircleOutlined />;
      case 'large_difference':
        return <DollarOutlined />;
      case 'daily_reminder':
        return <ClockCircleOutlined />;
      default:
        return <WarningOutlined />;
    }
  };

  const handleAlertAction = (alert: CashClosingAlert) => {
    if (alert.type === 'daily_reminder' || alert.type === 'missing' || alert.type === 'pending') {
      onCreateClosing?.();
    } else if (alert.type === 'large_difference') {
      setShowDetails(true);
    }
  };

  const getCriticalAlerts = () => alerts.filter(a => a.severity === 'error');
  const getWarningAlerts = () => alerts.filter(a => a.severity === 'warning');
  const getInfoAlerts = () => alerts.filter(a => a.severity === 'info');

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Title level={4}>🚨 Alertas de Cierre de Caja</Title>
      
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Alertas críticas */}
        {getCriticalAlerts().map((alert, index) => (
          <Alert
            key={`critical-${index}`}
            message={alert.title}
            description={
              <div>
                <Text>{alert.message}</Text>
                {alert.actionRequired && (
                  <div className="mt-2">
                    <Button 
                      type="primary" 
                      danger
                      size="small"
                      onClick={() => handleAlertAction(alert)}
                    >
                      Realizar Cierre Ahora
                    </Button>
                  </div>
                )}
              </div>
            }
            type="error"
            icon={getAlertIcon(alert.type)}
            showIcon
            closable
          />
        ))}

        {/* Alertas de advertencia */}
        {getWarningAlerts().map((alert, index) => (
          <Alert
            key={`warning-${index}`}
            message={alert.title}
            description={
              <div>
                <Text>{alert.message}</Text>
                <div className="mt-2">
                  <Button 
                    type="default" 
                    size="small"
                    onClick={() => handleAlertAction(alert)}
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            }
            type="warning"
            icon={getAlertIcon(alert.type)}
            showIcon
            closable
          />
        ))}

        {/* Alertas informativas */}
        {getInfoAlerts().map((alert, index) => (
          <Alert
            key={`info-${index}`}
            message={alert.title}
            description={
              <div>
                <Text>{alert.message}</Text>
                {alert.actionRequired && (
                  <div className="mt-2">
                    <Button 
                      type="primary"
                      size="small"
                      onClick={() => handleAlertAction(alert)}
                    >
                      Realizar Cierre
                    </Button>
                  </div>
                )}
              </div>
            }
            type="info"
            icon={getAlertIcon(alert.type)}
            showIcon
            closable
          />
        ))}
      </Space>

      {/* Modal de detalles para diferencias grandes */}
      <Modal
        title="🔍 Análisis de Diferencia Significativa"
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)}>
            Cerrar
          </Button>
        ]}
      >
        {lastClosing && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>Fecha del cierre: </Text>
                <Tag color="blue">{dayjs(lastClosing.date).format('DD/MM/YYYY')}</Tag>
              </div>
              
              <div>
                <Text strong>Diferencia detectada: </Text>
                <Tag color={lastClosing.difference > 0 ? 'green' : 'red'}>
                  ${lastClosing.difference.toLocaleString()}
                  {lastClosing.difference > 0 ? ' (Sobra)' : ' (Falta)'}
                </Tag>
              </div>

              <Alert
                message="Recomendaciones"
                description={
                  <ul>
                    <li>Verificar el conteo físico del efectivo</li>
                    <li>Revisar si hay gastos no registrados</li>
                    <li>Confirmar que todas las ventas estén registradas</li>
                    <li>Validar pagos a proveedores del día</li>
                    <li>Considerar implementar doble conteo</li>
                  </ul>
                }
                type="info"
                showIcon
              />
            </Space>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashClosingAlerts;
