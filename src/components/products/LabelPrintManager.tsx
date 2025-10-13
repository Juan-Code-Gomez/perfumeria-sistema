// src/components/products/LabelPrintManager.tsx
import React, { useState } from 'react';
import {
  Modal,
  Button,
  Card,
  Typography,
  Space,
  Select,
  InputNumber,
  Row,
  Col,
  Divider,
  Alert,
  Form,
  message,
  Checkbox
} from 'antd';
import {
  PrinterOutlined,
  SettingOutlined,
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { Product } from '../../services/productService';

const { Text } = Typography;
const { Option } = Select;

interface LabelPrintManagerProps {
  visible: boolean;
  onCancel: () => void;
  products: Product[];
  selectedProducts?: Product[];
}

interface LabelConfig {
  size: 'small' | 'medium' | 'large';
  includePrice: boolean;
  includeDescription: boolean;
  includeCategory: boolean;
  includeSupplier: boolean;
  copies: number;
  layout: '1x1' | '2x1' | '3x1' | '2x2';
}

const LABEL_SIZES = {
  small: { width: '50mm', height: '25mm', description: 'Etiqueta pequeña (50x25mm) - Perfumes pequeños' },
  medium: { width: '70mm', height: '35mm', description: 'Etiqueta mediana (70x35mm) - Productos estándar' },
  large: { width: '100mm', height: '50mm', description: 'Etiqueta grande (100x50mm) - Productos grandes/promociones' }
};

const LabelPrintManager: React.FC<LabelPrintManagerProps> = ({
  visible,
  onCancel,
  products,
  selectedProducts
}) => {
  const [config, setConfig] = useState<LabelConfig>({
    size: 'medium',
    includePrice: true,
    includeDescription: true,
    includeCategory: false,
    includeSupplier: false,
    copies: 1,
    layout: '2x1'
  });
  const [previewMode, setPreviewMode] = useState(false);

  const productsToLabel = selectedProducts && selectedProducts.length > 0 ? selectedProducts : products;

  // Generar SVG del código de barras
  const generateBarcodeImage = (code: string) => {
    if (!code) return '';
    
    // Generar SVG simple de código de barras
    const bars = code.split('').map((digit, index) => {
      const pattern = digit === '0' ? '001' : 
                    digit === '1' ? '100' : 
                    digit === '2' ? '010' : 
                    digit === '3' ? '110' : 
                    digit === '4' ? '001' : 
                    digit === '5' ? '101' : 
                    digit === '6' ? '011' : 
                    digit === '7' ? '111' : 
                    digit === '8' ? '000' : '111';
      
      return pattern.split('').map((bar, i) => (
        bar === '1' ? `<rect x="${(index * 15) + i * 2}" y="0" width="2" height="40" fill="black"/>` : ''
      )).join('');
    }).join('');

    return `
      <svg width="120" height="50" xmlns="http://www.w3.org/2000/svg">
        ${bars}
        <text x="60" y="48" text-anchor="middle" font-family="Arial" font-size="8" fill="black">${code}</text>
      </svg>
    `;
  };

  // Generar estilo CSS para etiquetas
  const getLabelStyle = () => {
    const size = LABEL_SIZES[config.size];
    return {
      width: size.width,
      minHeight: size.height,
      border: '1px solid #ddd',
      padding: '3mm',
      margin: '2mm',
      fontSize: config.size === 'small' ? '8px' : config.size === 'medium' ? '10px' : '12px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      backgroundColor: 'white'
    };
  };

  // Renderizar etiqueta individual
  const renderLabel = (product: Product, index: number) => {
    return (
      <div key={`${product.id}-${index}`} style={getLabelStyle()}>
        {/* Nombre del producto */}
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: config.size === 'small' ? '9px' : config.size === 'medium' ? '11px' : '13px',
          marginBottom: '2px',
          lineHeight: '1.1',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: config.size === 'small' ? 1 : 2,
          WebkitBoxOrient: 'vertical' as const
        }}>
          {product.name}
        </div>

        {/* Descripción */}
        {config.includeDescription && product.description && (
          <div style={{ 
            fontSize: config.size === 'small' ? '7px' : '8px',
            color: '#666',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical' as const
          }}>
            {product.description}
          </div>
        )}

        {/* Categoría y Proveedor */}
        {(config.includeCategory || config.includeSupplier) && (
          <div style={{ 
            fontSize: '7px',
            color: '#888',
            marginBottom: '2px'
          }}>
            {config.includeCategory && product.category && `Cat: ${product.category.name}`}
            {config.includeCategory && config.includeSupplier && product.category && product.supplier && ' | '}
            {config.includeSupplier && product.supplier && `Prov: ${product.supplier.name}`}
          </div>
        )}

        {/* Código de barras */}
        {product.barcode && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: 'auto'
          }}>
            <div 
              dangerouslySetInnerHTML={{ __html: generateBarcodeImage(product.barcode) }}
              style={{ marginBottom: '1px' }}
            />
          </div>
        )}

        {/* Precio */}
        {config.includePrice && (
          <div style={{ 
            fontSize: config.size === 'small' ? '10px' : config.size === 'medium' ? '12px' : '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginTop: '2px',
            color: '#d4380d'
          }}>
            ${product.salePrice?.toLocaleString() || 'N/A'}
          </div>
        )}
      </div>
    );
  };

  // Imprimir etiquetas
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      message.error('No se pudo abrir la ventana de impresión');
      return;
    }

    const labels = productsToLabel.flatMap(product => 
      Array(config.copies).fill(null).map((_, index) => renderLabel(product, index))
    );

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Etiquetas de Productos</title>
          <style>
            @page { 
              margin: 5mm;
              size: A4;
            }
            body { 
              margin: 0; 
              font-family: Arial, sans-serif;
              background: white;
            }
            .labels-container {
              display: flex;
              flex-wrap: wrap;
              gap: 0;
              align-items: flex-start;
              align-content: flex-start;
            }
            @media print {
              body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${labels.map(label => `<div>${label.props.children}</div>`).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Descargar como PDF
  const handleDownload = () => {
    message.info('Función de descarga en desarrollo...');
  };

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          Gestor de Etiquetas
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button 
          key="preview" 
          icon={<EyeOutlined />}
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Ocultar Vista Previa' : 'Vista Previa'}
        </Button>,
        <Button 
          key="download" 
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Descargar PDF
        </Button>,
        <Button 
          key="print" 
          type="primary" 
          icon={<PrinterOutlined />}
          onClick={handlePrint}
        >
          Imprimir ({productsToLabel.length * config.copies} etiquetas)
        </Button>
      ]}
    >
      <Row gutter={[16, 16]}>
        {/* Configuración */}
        <Col span={12}>
          <Card title={<Space><SettingOutlined />Configuración</Space>} size="small">
            <Form layout="vertical" size="small">
              <Form.Item label="Tamaño de Etiqueta">
                <Select
                  value={config.size}
                  onChange={(value) => setConfig({...config, size: value})}
                >
                  {Object.entries(LABEL_SIZES).map(([key, size]) => (
                    <Option key={key} value={key}>
                      <div>
                        <Text strong>{size.width} x {size.height}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {size.description}
                        </Text>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item label="Copias por producto">
                <InputNumber
                  min={1}
                  max={10}
                  value={config.copies}
                  onChange={(value) => setConfig({...config, copies: value || 1})}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Divider />

              <Form.Item label="Información a incluir">
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Checkbox
                    checked={config.includePrice}
                    onChange={(e) => setConfig({...config, includePrice: e.target.checked})}
                  >
                    Precio de venta
                  </Checkbox>
                  <Checkbox
                    checked={config.includeDescription}
                    onChange={(e) => setConfig({...config, includeDescription: e.target.checked})}
                  >
                    Descripción
                  </Checkbox>
                  <Checkbox
                    checked={config.includeCategory}
                    onChange={(e) => setConfig({...config, includeCategory: e.target.checked})}
                  >
                    Categoría
                  </Checkbox>
                  <Checkbox
                    checked={config.includeSupplier}
                    onChange={(e) => setConfig({...config, includeSupplier: e.target.checked})}
                  >
                    Proveedor
                  </Checkbox>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Información */}
        <Col span={12}>
          <Card title="Resumen" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message={`${productsToLabel.length} productos seleccionados`}
                description={`Se generarán ${productsToLabel.length * config.copies} etiquetas en total`}
                type="info"
                showIcon
              />
              
              <div>
                <Text strong>Tamaño: </Text>
                <Text>{LABEL_SIZES[config.size].width} x {LABEL_SIZES[config.size].height}</Text>
              </div>
              
              <div>
                <Text strong>Productos sin código: </Text>
                <Text type="warning">
                  {productsToLabel.filter(p => !p.barcode).length}
                </Text>
              </div>

              {productsToLabel.filter(p => !p.barcode).length > 0 && (
                <Alert
                  message="Algunos productos no tienen código de barras"
                  description="Genera códigos antes de imprimir para obtener mejores resultados"
                  type="warning"
                  showIcon
                />
              )}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Vista Previa */}
      {previewMode && (
        <Card 
          title="Vista Previa de Etiquetas" 
          style={{ marginTop: 16 }}
          size="small"
        >
          <div style={{ 
            maxHeight: '400px', 
            overflow: 'auto',
            border: '1px solid #f0f0f0',
            padding: '8px',
            backgroundColor: '#fafafa'
          }}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              {productsToLabel.slice(0, 6).map((product, index) => (
                <div key={product.id} style={{ transform: 'scale(0.8)' }}>
                  {renderLabel(product, index)}
                </div>
              ))}
              {productsToLabel.length > 6 && (
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f5f5f5',
                  transform: 'scale(0.8)',
                  width: LABEL_SIZES[config.size].width,
                  minHeight: LABEL_SIZES[config.size].height,
                  border: '1px solid #ddd',
                  padding: '3mm',
                  margin: '2mm',
                  fontSize: config.size === 'small' ? '8px' : config.size === 'medium' ? '10px' : '12px',
                  fontFamily: 'Arial, sans-serif',
                  flexDirection: 'column' as const
                }}>
                  <Text type="secondary">
                    +{productsToLabel.length - 6} más...
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </Modal>
  );
};

export default LabelPrintManager;