// src/components/products/BarcodeGenerator.tsx
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Spin,
  List,
  Tag,
  Progress,
  message,
  Popconfirm
} from 'antd';
import {
  BarcodeOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { generateBarcode, generateBarcodesBulk } from '../../services/productService';
import type { Product } from '../../services/productService';

const { Text, Title } = Typography;

interface BarcodeGeneratorProps {
  visible: boolean;
  onCancel: () => void;
  product?: Product | null;
  onGenerated?: (product: Product) => void;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  visible,
  onCancel,
  product,
  onGenerated
}) => {
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);

  // Generar código para un producto específico
  const handleGenerateBarcode = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const updatedProduct = await generateBarcode(product.id);
      message.success(`Código generado: ${updatedProduct.barcode}`);
      
      if (onGenerated) {
        onGenerated(updatedProduct);
      }
      
      onCancel();
    } catch (error: any) {
      message.error(error.message || 'Error al generar código de barras');
    } finally {
      setLoading(false);
    }
  };

  // Generar códigos masivamente
  const handleBulkGenerate = async () => {
    setBulkLoading(true);
    try {
      const result = await generateBarcodesBulk();
      setBulkResults(result);
      
      if (result.successful > 0) {
        message.success(`${result.successful} códigos generados exitosamente`);
      }
      
      if (result.failed > 0) {
        message.warning(`${result.failed} productos fallaron`);
      }
    } catch (error: any) {
      message.error(error.message || 'Error al generar códigos masivamente');
    } finally {
      setBulkLoading(false);
    }
  };

  const resetBulkResults = () => {
    setBulkResults(null);
  };

  return (
    <Modal
      title={
        <Space>
          <BarcodeOutlined />
          Generador de Códigos de Barras
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cerrar
        </Button>,
        product && !product.barcode && (
          <Button
            key="generate"
            type="primary"
            icon={<BarcodeOutlined />}
            onClick={handleGenerateBarcode}
            loading={loading}
          >
            Generar Código
          </Button>
        ),
      ].filter(Boolean)}
      width={700}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {/* Producto específico */}
        {product && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Title level={5}>Producto Seleccionado</Title>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong>{product.name}</Text>
                <br />
                <Text type="secondary">ID: {product.id}</Text>
              </div>
              <div style={{ textAlign: 'right' }}>
                {product.barcode ? (
                  <div>
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Ya tiene código
                    </Tag>
                    <br />
                    <Text code style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {product.barcode}
                    </Text>
                  </div>
                ) : (
                  <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                    Sin código de barras
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Generación masiva */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <Title level={5} style={{ margin: 0 }}>
                <ThunderboltOutlined /> Generación Masiva
              </Title>
              <Text type="secondary">
                Genera códigos para todos los productos que no tengan
              </Text>
            </div>
            <Popconfirm
              title="¿Generar códigos masivamente?"
              description="Esto generará códigos de barras para todos los productos que no tengan uno."
              onConfirm={handleBulkGenerate}
              okText="Sí, generar"
              cancelText="Cancelar"
            >
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={bulkLoading}
                style={{ backgroundColor: '#722ed1', borderColor: '#722ed1' }}
              >
                Generar Todos
              </Button>
            </Popconfirm>
          </div>

          {bulkLoading && (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <div style={{ marginTop: 12 }}>
                <Text>Generando códigos de barras...</Text>
              </div>
            </div>
          )}

          {bulkResults && (
            <div>
              <Alert
                message={`Proceso completado`}
                description={
                  <div>
                    <div>✅ Exitosos: {bulkResults.successful}</div>
                    <div>❌ Fallidos: {bulkResults.failed}</div>
                    <div>📊 Total procesados: {bulkResults.processed}</div>
                  </div>
                }
                type={bulkResults.failed === 0 ? 'success' : 'warning'}
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  <Button size="small" icon={<ReloadOutlined />} onClick={resetBulkResults}>
                    Limpiar
                  </Button>
                }
              />

              {bulkResults.successful > 0 && (
                <Progress
                  percent={Math.round((bulkResults.successful / bulkResults.processed) * 100)}
                  status={bulkResults.failed === 0 ? 'success' : 'active'}
                  format={(percent) => `${percent}% exitoso`}
                  style={{ marginBottom: 16 }}
                />
              )}

              {bulkResults.results && bulkResults.results.length > 0 && (
                <div>
                  <Text strong>Detalles del proceso:</Text>
                  <List
                    size="small"
                    style={{ maxHeight: '200px', overflow: 'auto', marginTop: 8 }}
                    dataSource={bulkResults.results.slice(0, 10)} // Mostrar solo primeros 10
                    renderItem={(item: any) => (
                      <List.Item style={{ padding: '4px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Text style={{ fontSize: '12px' }}>
                            {item.productName}
                          </Text>
                          {item.success ? (
                            <Tag color="green">
                              {item.barcode}
                            </Tag>
                          ) : (
                            <Tag color="red">
                              Error
                            </Tag>
                          )}
                        </div>
                      </List.Item>
                    )}
                  />
                  {bulkResults.results.length > 10 && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      ... y {bulkResults.results.length - 10} más
                    </Text>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Información sobre códigos de barras */}
        <Card size="small" title="Información sobre Códigos de Barras">
          <Space direction="vertical" size={8}>
            <div>
              <Text strong>Formato utilizado:</Text>
              <br />
              <Text code>77 + ID del producto (5 dígitos) + dígito verificador</Text>
            </div>
            <div>
              <Text strong>Ejemplo:</Text>
              <br />
              <Text>Producto ID 123 → Código: <Text code>77001231</Text></Text>
            </div>
            <div>
              <Text strong>Compatibilidad:</Text>
              <br />
              <Text type="secondary">
                Compatible con escáneres USB estándar y sistemas POS
              </Text>
            </div>
          </Space>
        </Card>
      </div>
    </Modal>
  );
};

export default BarcodeGenerator;