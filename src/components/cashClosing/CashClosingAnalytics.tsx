import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Alert, Typography } from 'antd';
import {
  RiseOutlined,
  FallOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface CashClosing {
  id: number;
  date: string;
  difference: number;
  totalSales: number;
  systemCash: number;
  closingCash: number;
}

interface CashClosingAnalyticsProps {
  closings: CashClosing[];
}

const CashClosingAnalytics: React.FC<CashClosingAnalyticsProps> = ({ closings }) => {
  if (!closings || closings.length === 0) {
    return (
      <Alert
        message="No hay datos suficientes para mostrar análisis"
        type="info"
        showIcon
      />
    );
  }

  // Análisis de precisión
  const totalClosings = closings.length;
  const perfectClosings = closings.filter(c => c.difference === 0).length;
  const minorDifferences = closings.filter(c => Math.abs(c.difference) <= 5000 && c.difference !== 0).length;
  const majorDifferences = closings.filter(c => Math.abs(c.difference) > 5000).length;

  const accuracyRate = (perfectClosings / totalClosings) * 100;
  const acceptableRate = ((perfectClosings + minorDifferences) / totalClosings) * 100;

  // Tendencias de diferencias
  const avgDifference = closings.reduce((sum, c) => sum + Math.abs(c.difference), 0) / totalClosings;
  const maxDifference = Math.max(...closings.map(c => Math.abs(c.difference)));
  const totalShortage = closings.filter(c => c.difference < 0).reduce((sum, c) => sum + Math.abs(c.difference), 0);
  const totalSurplus = closings.filter(c => c.difference > 0).reduce((sum, c) => sum + c.difference, 0);

  // Análisis por períodos (últimos 7 días vs anteriores)
  const recent = closings.slice(0, 7);
  const older = closings.slice(7);
  
  const recentAccuracy = recent.length > 0 ? (recent.filter(c => c.difference === 0).length / recent.length) * 100 : 0;
  const olderAccuracy = older.length > 0 ? (older.filter(c => c.difference === 0).length / older.length) * 100 : 0;

  const getAccuracyColor = (rate: number) => {
    if (rate >= 80) return '#52c41a';
    if (rate >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <RiseOutlined style={{ color: '#52c41a' }} />;
    if (current < previous) return <FallOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  };

  return (
    <div>
      <Title level={4} className="mb-4">📈 Análisis de Cierres de Caja</Title>
      
      {/* Métricas principales */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Precisión General"
              value={accuracyRate}
              suffix="%"
              valueStyle={{ color: getAccuracyColor(accuracyRate) }}
              prefix={accuracyRate >= 80 ? <CheckCircleOutlined /> : <WarningOutlined />}
            />
            <Progress 
              percent={accuracyRate} 
              strokeColor={getAccuracyColor(accuracyRate)}
              size="small"
              showInfo={false}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Cierres Aceptables"
              value={acceptableRate}
              suffix="%"
              valueStyle={{ color: getAccuracyColor(acceptableRate) }}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Incluye diferencias ≤ $5,000
            </Text>
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Diferencia Promedio"
              value={avgDifference}
              prefix="$"
              precision={0}
              valueStyle={{ color: avgDifference <= 2000 ? '#52c41a' : avgDifference <= 5000 ? '#faad14' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        
        <Col span={6}>
          <Card>
            <Statistic
              title="Mayor Diferencia"
              value={maxDifference}
              prefix="$"
              precision={0}
              valueStyle={{ color: maxDifference <= 5000 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Distribución de precisión */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={12}>
          <Card title="📊 Distribución de Precisión" size="small">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>🎯 Cierres Perfectos</span>
                <Tag color="green">{perfectClosings} de {totalClosings}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <span>⚠️ Diferencias Menores (≤$5,000)</span>
                <Tag color="orange">{minorDifferences} de {totalClosings}</Tag>
              </div>
              <div className="flex justify-between items-center">
                <span>🚨 Diferencias Mayores (&gt;$5,000)</span>
                <Tag color="red">{majorDifferences} de {totalClosings}</Tag>
              </div>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="💰 Balance de Diferencias" size="small">
            <div className="space-y-3">
              <Statistic
                title="Total Faltante"
                value={totalShortage}
                prefix="$"
                valueStyle={{ color: '#ff4d4f', fontSize: '16px' }}
              />
              <Statistic
                title="Total Sobrante"
                value={totalSurplus}
                prefix="$"
                valueStyle={{ color: '#52c41a', fontSize: '16px' }}
              />
              <div className="mt-2">
                <Text strong>
                  Balance Neto: $
                  <span style={{ color: totalSurplus >= totalShortage ? '#52c41a' : '#ff4d4f' }}>
                    {(totalSurplus - totalShortage).toLocaleString()}
                  </span>
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tendencias */}
      {older.length > 0 && (
        <Row gutter={16}>
          <Col span={24}>
            <Card title="📈 Tendencias de Mejora" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="text-center">
                    <Text strong>Últimos 7 días</Text>
                    <div className="text-2xl font-bold" style={{ color: getAccuracyColor(recentAccuracy) }}>
                      {recentAccuracy.toFixed(1)}%
                      {getTrendIcon(recentAccuracy, olderAccuracy)}
                    </div>
                    <Text type="secondary">de precisión</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="text-center">
                    <Text strong>Período anterior</Text>
                    <div className="text-2xl font-bold" style={{ color: getAccuracyColor(olderAccuracy) }}>
                      {olderAccuracy.toFixed(1)}%
                    </div>
                    <Text type="secondary">de precisión</Text>
                  </div>
                </Col>
              </Row>
              
              {recentAccuracy > olderAccuracy && (
                <Alert
                  message="¡Mejora detectada!"
                  description="La precisión de los cierres ha mejorado en el período reciente."
                  type="success"
                  showIcon
                  className="mt-4"
                />
              )}
              
              {recentAccuracy < olderAccuracy && (
                <Alert
                  message="Atención requerida"
                  description="La precisión ha disminuido recientemente. Considera revisar los procesos de conteo."
                  type="warning"
                  showIcon
                  className="mt-4"
                />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Recomendaciones */}
      <Row gutter={16} className="mt-4">
        <Col span={24}>
          <Card title="💡 Recomendaciones" size="small">
            {accuracyRate < 70 && (
              <Alert
                message="Precisión baja detectada"
                description="Considera implementar doble conteo, capacitación adicional o revisión de procesos."
                type="error"
                showIcon
                className="mb-2"
              />
            )}
            
            {avgDifference > 5000 && (
              <Alert
                message="Diferencias altas"
                description="La diferencia promedio es alta. Revisa los procedimientos de manejo de efectivo."
                type="warning"
                showIcon
                className="mb-2"
              />
            )}
            
            {accuracyRate >= 80 && avgDifference <= 2000 && (
              <Alert
                message="Excelente desempeño"
                description="Los cierres de caja muestran alta precisión y control adecuado."
                type="success"
                showIcon
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CashClosingAnalytics;
