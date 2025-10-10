// src/components/products/QuickBarcodeScanner.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Input,
  Button,
  message,
  Space,
  Spin,
  Typography,
  Tag
} from 'antd';
import {
  ScanOutlined,
  ClearOutlined,
  BarcodeOutlined
} from '@ant-design/icons';
import { getProductByBarcode, validateBarcodeFormat } from '../../services/productService';
import type { Product } from '../../services/productService';

const { Text } = Typography;

interface QuickBarcodeScannerProps {
  onProductFound: (product: Product) => void;
  placeholder?: string;
  size?: 'small' | 'middle' | 'large';
  disabled?: boolean;
  autoFocus?: boolean;
  showHistory?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const QuickBarcodeScanner: React.FC<QuickBarcodeScannerProps> = ({
  onProductFound,
  placeholder = 'Escanear código de barras...',
  size = 'middle',
  disabled = false,
  autoFocus = true,
  showHistory = false,
  className,
  style
}) => {
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastScanned, setLastScanned] = useState<string[]>([]);
  const [scanBuffer, setScanBuffer] = useState('');
  const inputRef = useRef<any>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-focus cuando se monta el componente
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [autoFocus, disabled]);

  // Lógica para detectar escáneres USB
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Solo procesar si el input tiene el foco o no hay elementos focusados
      const activeElement = document.activeElement;
      const inputElement = inputRef.current?.input;
      
      if (activeElement !== inputElement) {
        // Si no es nuestro input, solo procesar si no hay otro input activo
        if (activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA') {
          return;
        }
      }

      // Enter: procesar código escaneado
      if (event.key === 'Enter' && scanBuffer.length >= 6) {
        event.preventDefault();
        const scannedCode = scanBuffer.trim();
        setBarcode(scannedCode);
        handleBarcodeSearch(scannedCode);
        setScanBuffer('');
        return;
      }

      // Caracteres alfanuméricos: agregar al buffer
      if (event.key.length === 1 && /[a-zA-Z0-9]/.test(event.key)) {
        setScanBuffer(prev => prev + event.key);
        
        // Mostrar en el input en tiempo real
        setBarcode(prev => prev + event.key);
        
        // Limpiar buffer después de inactividad
        if (scanTimeoutRef.current) {
          clearTimeout(scanTimeoutRef.current);
        }
        
        scanTimeoutRef.current = setTimeout(() => {
          setScanBuffer('');
        }, 500);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
    };
  }, [disabled, scanBuffer]);

  const handleBarcodeSearch = async (code: string) => {
    if (!code.trim()) return;

    setLoading(true);

    try {
      // Validar formato
      if (!validateBarcodeFormat(code)) {
        message.warning('Formato de código de barras no válido');
        setLoading(false);
        return;
      }

      console.log('🔍 Buscando producto con código:', code);
      
      const product = await getProductByBarcode(code);
      
      if (product) {
        // Producto encontrado
        message.success(`✅ ${product.name} - $${product.salePrice?.toLocaleString()}`);
        
        // Actualizar historial
        setLastScanned(prev => [code, ...prev.slice(0, 4)]);
        
        // Callback con el producto
        onProductFound(product);
        
        // Limpiar y enfocar para siguiente escaneo
        setBarcode('');
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      } else {
        message.error('❌ Producto no encontrado');
        // Mantener el código para que el usuario pueda editarlo
      }
    } catch (error: any) {
      console.error('Error buscando producto:', error);
      message.error('Error al buscar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBarcodeSearch(barcode);
    }
  };

  const handleClear = () => {
    setBarcode('');
    setScanBuffer('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={className} style={style}>
      <Space.Compact style={{ width: '100%' }}>
        <Input
          ref={inputRef}
          size={size}
          placeholder={placeholder}
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          prefix={
            <ScanOutlined 
              style={{ 
                color: loading ? '#1890ff' : '#666',
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} 
            />
          }
          suffix={
            loading ? (
              <Spin size="small" />
            ) : (
              barcode && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                />
              )
            )
          }
        />
        <Button
          size={size}
          type="primary"
          icon={<BarcodeOutlined />}
          onClick={() => handleBarcodeSearch(barcode)}
          loading={loading}
          disabled={disabled || !barcode.trim()}
        >
          Buscar
        </Button>
      </Space.Compact>

      {/* Historial de códigos escaneados */}
      {showHistory && lastScanned.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Últimos escaneados:
          </Text>
          <div style={{ marginTop: 4 }}>
            <Space wrap>
              {lastScanned.map((code, index) => (
                <Tag 
                  key={index}
                  color={index === 0 ? 'green' : 'default'}
                  style={{ cursor: 'pointer', fontSize: '11px' }}
                  onClick={() => setBarcode(code)}
                >
                  {code}
                </Tag>
              ))}
            </Space>
          </div>
        </div>
      )}

      {/* Ayuda rápida */}
      <div style={{ marginTop: 4, fontSize: '11px', color: '#999', textAlign: 'center' }}>
        <Space size="small">
          <span>📱 Escáner USB automático</span>
          <span>⌨️ O ingrese manualmente</span>
        </Space>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QuickBarcodeScanner;