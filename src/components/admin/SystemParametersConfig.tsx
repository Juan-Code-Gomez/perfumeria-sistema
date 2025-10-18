// src/components/admin/SystemParametersConfig.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Switch,
  List,
  Typography,
  Space,
  Button,
  message,
  Spin,
  Alert,
  Divider,
  Tag,
  Row,
  Col
} from 'antd';
import {
  SettingOutlined,
  ReloadOutlined,
  SecurityScanOutlined,
  DollarOutlined,
  ShopOutlined
} from '@ant-design/icons';
import systemParametersService from '../../services/systemParametersService';
import type { SystemParameter } from '../../services/systemParametersService';

const { Title, Text } = Typography;

interface CategoryConfig {
  key: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    key: 'pos',
    title: 'Punto de Venta',
    icon: <ShopOutlined />,
    color: 'blue',
    description: 'Configuraciones relacionadas con el sistema de ventas'
  },
  {
    key: 'pricing',
    title: 'Precios',
    icon: <DollarOutlined />,
    color: 'green',
    description: 'Configuraciones de precios y márgenes'
  },
  {
    key: 'security',
    title: 'Seguridad',
    icon: <SecurityScanOutlined />,
    color: 'red',
    description: 'Configuraciones de auditoría y seguridad'
  }
];

const SystemParametersConfig: React.FC = () => {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar parámetros al montar el componente
  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      setError(null);
      const allParams = await systemParametersService.getAllParameters();
      setParameters(allParams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      message.error('Error al cargar parámetros del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = async (parameterKey: string, newValue: boolean) => {
    try {
      setSaving(parameterKey);
      await systemParametersService.updateParameter(parameterKey, {
        parameterValue: newValue
      });

      // Actualizar el estado local
      setParameters(prev => 
        prev.map(param => 
          param.parameterKey === parameterKey 
            ? { ...param, parameterValue: newValue }
            : param
        )
      );

      message.success(`Parámetro ${parameterKey} actualizado correctamente`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      message.error(`Error al actualizar parámetro: ${errorMessage}`);
    } finally {
      setSaving(null);
    }
  };

  const renderParametersByCategory = (categoryKey: string) => {
    const categoryParams = parameters.filter(param => param.category === categoryKey);
    
    if (categoryParams.length === 0) {
      return (
        <Text type="secondary">No hay parámetros configurados para esta categoría</Text>
      );
    }

    return (
      <List
        size="small"
        dataSource={categoryParams}
        renderItem={(param) => (
          <List.Item
            actions={[
              <Switch
                key="switch"
                checked={param.parameterValue}
                loading={saving === param.parameterKey}
                onChange={(checked) => handleParameterChange(param.parameterKey, checked)}
                checkedChildren="SI"
                unCheckedChildren="NO"
              />
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{param.parameterKey.replace(/_/g, ' ').toUpperCase()}</Text>
                  <Tag color={param.parameterValue ? 'success' : 'default'}>
                    {param.parameterValue ? 'Activado' : 'Desactivado'}
                  </Tag>
                </Space>
              }
              description={param.description}
            />
          </List.Item>
        )}
      />
    );
  };

  const getEnabledCount = (categoryKey: string) => {
    return parameters.filter(param => 
      param.category === categoryKey && param.parameterValue
    ).length;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text>Cargando configuración del sistema...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error al cargar configuración"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchParameters}>
            Reintentar
          </Button>
        }
      />
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Space align="center">
          <SettingOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <Title level={2} style={{ margin: 0 }}>
            Configuración del Sistema
          </Title>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchParameters}
            type="default"
          >
            Actualizar
          </Button>
        </Space>
        <Text type="secondary">
          Gestiona los parámetros y funcionalidades del sistema de perfumería
        </Text>
      </div>

      <Row gutter={[16, 16]}>
        {CATEGORIES.map(category => {
          const enabledCount = getEnabledCount(category.key);
          const totalCount = parameters.filter(p => p.category === category.key).length;

          return (
            <Col span={24} key={category.key}>
              <Card
                title={
                  <Space>
                    <span style={{ color: category.color }}>{category.icon}</span>
                    <span>{category.title}</span>
                    <Tag color={category.color} style={{ marginLeft: 8 }}>
                      {enabledCount}/{totalCount} activos
                    </Tag>
                  </Space>
                }
                size="small"
                style={{ 
                  borderLeft: `4px solid ${category.color === 'blue' ? '#1890ff' : 
                                           category.color === 'green' ? '#52c41a' : '#ff4d4f'}` 
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">{category.description}</Text>
                </div>
                {renderParametersByCategory(category.key)}
              </Card>
            </Col>
          );
        })}
      </Row>

      {parameters.length === 0 && (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <SettingOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
            <Title level={4} style={{ color: '#999', marginTop: 16 }}>
              No hay parámetros configurados
            </Title>
            <Text type="secondary">
              Los parámetros del sistema se inicializarán automáticamente
            </Text>
          </div>
        </Card>
      )}

      <Divider />
      
      <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
        <Space>
          <Text strong style={{ color: '#389e0d' }}>💡 Información importante:</Text>
        </Space>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            • Los cambios se aplican inmediatamente en todo el sistema<br />
            • La funcionalidad "Editar Costo en POS" permite modificar costos durante la venta<br />
            • Los parámetros de auditoría registran todos los cambios importantes
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default SystemParametersConfig;