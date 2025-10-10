// src/components/products/BarcodeScanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Alert,
  Spin,
  Row,
  Col,
  Tag,
  message,
  Divider
} from 'antd';
import {
  ScanOutlined,
  CameraOutlined,
  BarcodeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';
import { getProductByBarcode, validateBarcodeFormat } from '../../services/productService';
import type { Product } from '../../services/productService';

const { Text, Title } = Typography;

interface BarcodeScannerProps {
  visible: boolean;
  onCancel: () => void;
  onProductFound: (product: Product) => void;
  title?: string;
  mode?: 'sale' | 'inventory' | 'general';
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  visible,
  onCancel,
  onProductFound,
  title = 'Escanear Código de Barras',
  mode = 'general'
}) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanBuffer, setScanBuffer] = useState('');
  const inputRef = useRef<any>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Resetear estado cuando el modal se abre/cierra
  useEffect(() => {
    if (visible) {
      setBarcode('');
      setFoundProduct(null);
      setError(null);
      setIsScanning(true);
      setScanBuffer('');
      
      // Enfocar el input automáticamente
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      setIsScanning(false);
      setScanBuffer('');
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    }
  }, [visible]);

  // Escuchar eventos de teclado para detectar escáneres USB
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Evitar procesamiento si el usuario está escribiendo en un input
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' && target !== inputRef.current?.input) {
        return;
      }

      // Si es Enter, procesar el código escaneado
      if (event.key === 'Enter' && scanBuffer.length > 0) {
        event.preventDefault();
        setBarcode(scanBuffer);
        handleBarcodeInput(scanBuffer);
        setScanBuffer('');
        return;
      }

      // Si es un carácter alfanumérico, agregarlo al buffer
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        event.preventDefault();
        setScanBuffer(prev => prev + event.key);
        
        // Auto-limpiar el buffer después de 500ms sin entrada (típico de escáneres)
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        
        scanTimeoutRef.current = setTimeout(() => {
          setScanBuffer('');
        }, 500);
      }
    };

    // Agregar event listener
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [visible, scanBuffer]);

  // Mostrar el buffer de escaneo en tiempo real
  useEffect(() => {
    if (scanBuffer.length > 0) {
      setBarcode(scanBuffer);
    }
  }, [scanBuffer]);

  // Función para manejar el escaneo/entrada de código
  const handleBarcodeInput = async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setFoundProduct(null);

    try {
      // Validar formato
      if (!validateBarcodeFormat(code)) {
        setError('Formato de código de barras no válido');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando producto con código:', code);
      
      const product = await getProductByBarcode(code);
      
      if (product) {
        setFoundProduct(product);
        setScanHistory(prev => [code, ...prev.slice(0, 4)]); // Mantener últimos 5
        message.success(`Producto encontrado: ${product.name}`);
      } else {
        setError('Producto no encontrado con este código');
      }
    } catch (err: any) {
      console.error('Error buscando producto:', err);
      setError('Error al buscar el producto');
    } finally {
      setLoading(false);
    }
  };

  // Manejar enter en el input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeInput(barcode);
    }
  };

  // Manejar la confirmación del producto encontrado
  const handleConfirmProduct = () => {
    if (foundProduct) {
      onProductFound(foundProduct);
      onCancel();
    }
  };

  // Limpiar y escanear otro
  const handleScanAnother = () => {
    setBarcode('');
    setFoundProduct(null);
    setError(null);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'sale': return <ShoppingCartOutlined />;
      case 'inventory': return <ScanOutlined />;
      default: return <BarcodeOutlined />;
    }
  };

  const getModeColor = () => {
    switch (mode) {
      case 'sale': return '#52c41a';
      case 'inventory': return '#1890ff';
      default: return '#722ed1';
    }
  };

  return (
    <Modal
      title={
        <Space>
          {getModeIcon()}
          {title}
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        foundProduct && (
          <Button
            key="confirm"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleConfirmProduct}
            style={{ backgroundColor: getModeColor() }}
          >
            {mode === 'sale' ? 'Agregar a Venta' : 'Confirmar'}
          </Button>
        ),
        foundProduct && (
          <Button
            key="another"
            onClick={handleScanAnother}
            icon={<ScanOutlined />}
          >
            Escanear Otro
          </Button>
        ),
      ].filter(Boolean)}
      width={600}
      centered
    >
      <div style={{ padding: '20px 0' }}>
        {/* CSS para animación */}
        <style>{`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}</style>

        {/* Input para código de barras */}
        <Card 
          size="small" 
          style={{ 
            marginBottom: 16, 
            border: `2px solid ${getModeColor()}`,
            backgroundColor: isScanning ? '#f0f9ff' : 'white'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <ScanOutlined 
              style={{ 
                fontSize: '32px', 
                color: getModeColor(),
                animation: isScanning ? 'pulse 2s infinite' : 'none'
              }} 
            />
            <div style={{ marginTop: 8 }}>
              <Text strong>
                {isScanning ? 'Listo para escanear...' : 'Escaneé el código o ingréselo manualmente'}
              </Text>
              {scanBuffer.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Escaneando: <Text code>{scanBuffer}</Text>
                  </Text>
                </div>
              )}
            </div>
          </div>
          
          <Input
            ref={inputRef}
            size="large"
            placeholder="Código de barras..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyPress={handleKeyPress}
            prefix={<BarcodeOutlined />}
            suffix={
              <Button 
                type="primary" 
                size="small"
                onClick={() => handleBarcodeInput(barcode)}
                loading={loading}
                disabled={!barcode.trim()}
                style={{ backgroundColor: getModeColor() }}
              >
                Buscar
              </Button>
            }
            style={{ marginBottom: 8 }}
          />
          
          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            <Space size="large">
              <span><ScanOutlined /> Escáner USB activo</span>
              <span><CameraOutlined /> Entrada manual disponible</span>
            </Space>
            {isScanning && (
              <div style={{ marginTop: 4, color: getModeColor() }}>
                <Text style={{ fontSize: '11px' }}>
                  🔴 Apunte el escáner al código de barras
                </Text>
              </div>
            )}
          </div>
        </Card>

        {/* Estado de carga */}
        {loading && (
          <Card size="small" style={{ textAlign: 'center', marginBottom: 16 }}>
            <Spin size="large" />
            <div style={{ marginTop: 8 }}>
              <Text>Buscando producto...</Text>
            </div>
          </Card>
        )}

        {/* Error */}
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            icon={<CloseCircleOutlined />}
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Producto encontrado */}
        {foundProduct && (
          <Card 
            size="small" 
            style={{ 
              marginBottom: 16, 
              border: '2px solid #52c41a',
              backgroundColor: '#f6ffed'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '18px', marginRight: 8 }} />
              <Text strong style={{ color: '#52c41a' }}>¡Producto Encontrado!</Text>
            </div>
            
            <Row gutter={16}>
              <Col span={16}>
                <div>
                  <Title level={5} style={{ margin: 0, marginBottom: 4 }}>
                    {foundProduct.name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Código: {foundProduct.barcode}
                  </Text>
                </div>
                
                <Space wrap style={{ marginTop: 8 }}>
                  <Tag color="blue">
                    {foundProduct.category?.name || 'Sin categoría'}
                  </Tag>
                  <Tag color="green">
                    Stock: {foundProduct.stock} {foundProduct.unit?.name}
                  </Tag>
                  <Tag color="orange">
                    ${foundProduct.salePrice?.toLocaleString()}
                  </Tag>
                </Space>
              </Col>
              
              <Col span={8}>
                {foundProduct.imageUrl && (
                  <img
                    src={foundProduct.imageUrl}
                    alt={foundProduct.name}
                    style={{
                      width: '100%',
                      maxHeight: '80px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid #d9d9d9'
                    }}
                  />
                )}
              </Col>
            </Row>

            {foundProduct.description && (
              <div style={{ marginTop: 8, padding: '8px', backgroundColor: '#fff', borderRadius: '4px' }}>
                <Text style={{ fontSize: '12px' }}>{foundProduct.description}</Text>
              </div>
            )}
          </Card>
        )}

        {/* Historial de escaneos */}
        {scanHistory.length > 0 && (
          <Card size="small" title="Últimos códigos escaneados">
            <Space wrap>
              {scanHistory.map((code, index) => (
                <Tag 
                  key={index} 
                  color={index === 0 ? 'green' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setBarcode(code)}
                >
                  {code}
                </Tag>
              ))}
            </Space>
          </Card>
        )}

        {/* Ayuda */}
        <Divider />
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#666' }}>
          <Space direction="vertical" size={4}>
            <div>
              <BarcodeOutlined /> Acerque el escáner al código de barras
            </div>
            <div>
              <CameraOutlined /> O ingrese el código manualmente
            </div>
            <div>
              ⌨️ Los escáneres USB funcionan automáticamente
            </div>
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default BarcodeScanner;