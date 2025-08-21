// src/components/sales/POSInterface.tsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Button,
  Table,
  Typography,
  Space,
  InputNumber,
  message,
  Select,
  Tag,
  Divider,
} from 'antd';
import {
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '../../store';
import { createSale } from '../../features/sales/salesSlice';
import debounce from 'lodash.debounce';
import * as productService from '../../services/productService';
import type { Product } from '../../features/products/types';

const { Title, Text } = Typography;
const { Option } = Select;

interface POSItem {
  key: string;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice: number;
  suggestedPrice: number;
  purchasePrice: number;
  totalPrice: number;
  profit: number;
  profitMargin: number;
}

interface Props {
  onSaleCompleted?: () => void;
}

const POSInterface: React.FC<Props> = ({ onSaleCompleted }) => {
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<any>(null);

  // Estados principales
  const [items, setItems] = useState<POSItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<{ id: number | null; name: string } | null>(null);
  
  // Estados para el checkout
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [customerName, setCustomerName] = useState('Cliente Ocasional');

  // Búsqueda con debounce
  const debouncedSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length < 2) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await productService.getProducts({ 
          search: term, 
          page: 1, 
          pageSize: 10 
        });
        setSearchResults(response.data?.items || []);
      } catch (error) {
        console.error('Error buscando productos:', error);
        setSearchResults([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Limpiar cliente cuando cambia el método de pago a no-crédito
  useEffect(() => {
    if (paymentMethod !== 'Crédito' && selectedClient) {
      // Si cambió de crédito a otro método, mantener el cliente pero permitir modificar
      // No limpiar automáticamente para mejor UX
    }
  }, [paymentMethod]);

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      updateQuantity(existingItem.key, existingItem.quantity + 1);
    } else {
      // Agregar nuevo item
      const key = Date.now().toString();
      const quantity = 1;
      const unitPrice = product.salePrice;
      const totalPrice = quantity * unitPrice;
      const profit = unitPrice - product.purchasePrice;
      const profitMargin = product.purchasePrice > 0 ? (profit / product.purchasePrice) * 100 : 0;

      const newItem: POSItem = {
        key,
        productId: product.id,
        product,
        quantity,
        unitPrice,
        suggestedPrice: product.salePrice,
        purchasePrice: product.purchasePrice,
        totalPrice,
        profit,
        profitMargin,
      };

      setItems(prev => [...prev, newItem]);
    }

    // Limpiar búsqueda
    setSearchTerm('');
    setSearchResults([]);
    
    // Enfocar en el input de búsqueda
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Actualizar cantidad
  const updateQuantity = (key: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(key);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.key === key) {
        const totalPrice = newQuantity * item.unitPrice;
        return {
          ...item,
          quantity: newQuantity,
          totalPrice,
        };
      }
      return item;
    }));
  };

  // Actualizar precio unitario
  const updateUnitPrice = (key: string, newPrice: number) => {
    setItems(prev => prev.map(item => {
      if (item.key === key) {
        const totalPrice = item.quantity * newPrice;
        const profit = newPrice - item.purchasePrice;
        const profitMargin = item.purchasePrice > 0 ? (profit / item.purchasePrice) * 100 : 0;
        
        return {
          ...item,
          unitPrice: newPrice,
          totalPrice,
          profit,
          profitMargin,
        };
      }
      return item;
    }));
  };

  // Remover item
  const removeItem = (key: string) => {
    setItems(prev => prev.filter(item => item.key !== key));
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    setSelectedClient(null);
    setCustomerName('Cliente Ocasional');
    setAmountReceived(0);
  };

  // Calcular totales
  const totals = {
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    totalProfit: items.reduce((sum, item) => sum + (item.profit * item.quantity), 0),
    totalCost: items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  const overallMargin = totals.totalCost > 0 ? (totals.totalProfit / totals.totalCost) * 100 : 0;
  const change = amountReceived - totals.subtotal;

  // Procesar venta
  const processSale = async () => {
    if (items.length === 0) {
      message.error('Agregue productos al carrito');
      return;
    }

    // Validar cliente para ventas a crédito
    if (paymentMethod === 'Crédito') {
      if (!selectedClient?.name) {
        message.error('Las ventas a crédito requieren seleccionar un cliente registrado del sistema');
        return;
      }
    }

    if (paymentMethod === 'Efectivo' && amountReceived < totals.subtotal) {
      message.error('El monto recibido es insuficiente');
      return;
    }

    try {
      // Para ventas a crédito, el monto pagado es 0 y no está pagada
      const isCredit = paymentMethod === 'Crédito';
      
      const saleData = {
        date: new Date().toISOString(),
        clientId: selectedClient?.id || undefined, // Solo enviar si existe y no es null
        customerName: selectedClient?.name || customerName,
        totalAmount: totals.subtotal,
        paidAmount: isCredit ? 0 : totals.subtotal, // Si es crédito, monto pagado = 0
        isPaid: !isCredit, // Si es crédito, no está pagada
        paymentMethod,
        details: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          purchasePrice: item.purchasePrice,
          suggestedPrice: item.suggestedPrice,
        })),
      };

      console.log('Creando venta con datos:', saleData);
      
      const result = await dispatch(createSale(saleData)).unwrap();
      
      console.log('Venta creada exitosamente:', result);
      
      if (isCredit) {
        message.success(`¡Venta a crédito registrada! Pendiente: $${totals.subtotal.toLocaleString()}`);
      } else {
        message.success('¡Venta procesada exitosamente!');
      }
      
      // Limpiar carrito
      clearCart();
      
      // Callback opcional
      onSaleCompleted?.();
      
    } catch (error: any) {
      console.error('Error procesando venta:', error);
      
      // Manejar diferentes tipos de errores
      if (error?.response?.data?.message) {
        message.error(`Error: ${error.response.data.message}`);
      } else if (error?.message) {
        message.error(`Error: ${error.message}`);
      } else if (typeof error === 'string') {
        message.error(`Error: ${error}`);
      } else {
        message.error('Error al procesar la venta');
      }
    }
  };

  // Columnas de la tabla
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      render: (product: Product) => (
          <div>
            <Text strong>{product.name}</Text>
            {product.category && (
              <div>
                <Tag color="blue">{product.category.name}</Tag>
              </div>
            )}
          </div>
      ),
    },
    {
      title: 'Cant.',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      render: (quantity: number, record: POSItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.key, value || 1)}
          style={{ width: '60px' }}
        />
      ),
    },
    {
      title: 'Precio Unit.',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      render: (price: number, record: POSItem) => (
        <div>
          <InputNumber
            prefix="$"
            value={price}
            onChange={(value) => updateUnitPrice(record.key, value || 0)}
            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
            style={{ width: '100px' }}
          />
          {price !== record.suggestedPrice && (
            <div>
              <Text type="secondary" style={{ fontSize: '11px' }}>
                Sugerido: ${record.suggestedPrice.toLocaleString()}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 100,
      render: (price: number) => (
        <Text strong>${price.toLocaleString()}</Text>
      ),
    },
    {
      title: 'Ganancia',
      dataIndex: 'profit',
      key: 'profit',
      width: 120,
      render: (profit: number, record: POSItem) => (
        <div>
          <Text 
            strong 
            style={{ color: profit > 0 ? '#52c41a' : '#ff4d4f' }}
          >
            ${(profit * record.quantity).toLocaleString()}
          </Text>
          <div>
            <Text 
              style={{ 
                fontSize: '11px', 
                color: record.profitMargin > 50 ? '#52c41a' : 
                       record.profitMargin > 20 ? '#faad14' : '#ff4d4f' 
              }}
            >
              {record.profitMargin.toFixed(1)}%
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 60,
      render: (_: any, record: POSItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ height: '100vh', padding: '16px' }}>
      <Row gutter={16} style={{ height: '100%' }}>
        {/* Columna izquierda - Búsqueda y productos */}
        <Col span={16}>
          <Card 
            title="🛒 Punto de Venta" 
            style={{ height: '100%' }}
            extra={
              <Space>
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={clearCart}
                  disabled={items.length === 0}
                >
                  Limpiar
                </Button>
              </Space>
            }
          >
            {/* Búsqueda de productos */}
            <div style={{ marginBottom: 16 }}>
              <Input
                ref={searchInputRef}
                size="large"
                placeholder="Buscar producto (nombre, código)..."
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              
              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <Card 
                  size="small" 
                  style={{ 
                    marginTop: 8, 
                    maxHeight: 200, 
                    overflowY: 'auto',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  {searchResults.map(product => (
                    <div 
                      key={product.id}
                      style={{ 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong>{product.name}</Text>
                          <div>
                            <Tag color="blue">
                              {product.category?.name}
                            </Tag>
                            <Text type="secondary">
                              Stock: {product.stock} {product.unit?.name}
                            </Text>
                          </div>
                        </Col>
                        <Col>
                          <Text strong>${product.salePrice.toLocaleString()}</Text>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </Card>
              )}
            </div>

            {/* Tabla de productos */}
            <Table
              dataSource={items}
              columns={columns}
              pagination={false}
              size="small"
              scroll={{ y: 'calc(100vh - 300px)' }}
              locale={{ emptyText: 'Carrito vacío - Busque productos arriba' }}
            />
          </Card>
        </Col>

        {/* Columna derecha - Resumen y checkout */}
        <Col span={8}>
          <Card title="💰 Resumen" style={{ height: '100%' }}>
            {/* Cliente */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Cliente:</Text>
              <Select
                placeholder={paymentMethod === 'Crédito' ? 'Seleccione un cliente registrado (requerido)' : 'Cliente ocasional'}
                allowClear={paymentMethod !== 'Crédito'} // No permitir limpiar si es crédito
                style={{ width: '100%', marginTop: 4 }}
                value={selectedClient?.name}
                onChange={(value) => {
                  if (value) {
                    // Por ahora, no asignamos ID hasta integrar con API de clientes
                    setSelectedClient({ id: null, name: value });
                  } else {
                    setSelectedClient(null);
                  }
                }}
              >
                <Option value="Cliente Frecuente 1">Cliente Frecuente 1</Option>
                <Option value="Cliente Frecuente 2">Cliente Frecuente 2</Option>
                <Option value="Cliente VIP">Cliente VIP</Option>
              </Select>
              
              {/* Solo mostrar campo de texto si NO es venta a crédito */}
              {!selectedClient && paymentMethod !== 'Crédito' && (
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente ocasional"
                  style={{ marginTop: 8 }}
                />
              )}

              {/* Mensaje informativo para crédito */}
              {paymentMethod === 'Crédito' && !selectedClient && (
                <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    💡 Para ventas a crédito debe seleccionar un cliente registrado del desplegable
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            {/* Totales */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row justify="space-between">
                <Text>Items ({totals.itemCount}):</Text>
                <Text>${totals.subtotal.toLocaleString()}</Text>
              </Row>
              
              <Row justify="space-between">
                <Text>Costo Total:</Text>
                <Text type="secondary">${totals.totalCost.toLocaleString()}</Text>
              </Row>
              
              <Row justify="space-between">
                <Text strong style={{ color: '#52c41a' }}>Ganancia:</Text>
                <Text strong style={{ color: '#52c41a' }}>
                  ${totals.totalProfit.toLocaleString()}
                </Text>
              </Row>
              
              <Row justify="space-between">
                <Text strong>Margen:</Text>
                <Text strong style={{ 
                  color: overallMargin > 50 ? '#52c41a' : 
                         overallMargin > 20 ? '#faad14' : '#ff4d4f' 
                }}>
                  {overallMargin.toFixed(1)}%
                </Text>
              </Row>
            </Space>

            <Divider />

            {/* Total final */}
            <Row justify="space-between" style={{ marginBottom: 20 }}>
              <Title level={3} style={{ margin: 0 }}>TOTAL:</Title>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                ${totals.subtotal.toLocaleString()}
              </Title>
            </Row>

            {/* Método de pago */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Método de Pago:</Text>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                style={{ width: '100%', marginTop: 4 }}
                size="large"
              >
                <Option value="Efectivo">💵 Efectivo</Option>
                <Option value="Tarjeta">💳 Tarjeta</Option>
                <Option value="Transferencia">🏦 Transferencia</Option>
                <Option value="Crédito">📋 A Crédito</Option>
                <Option value="Otro">📱 Otro</Option>
              </Select>
            </div>

            {/* Monto recibido (solo para efectivo) */}
            {paymentMethod === 'Efectivo' && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Monto Recibido:</Text>
                <InputNumber
                  prefix="$"
                  value={amountReceived}
                  onChange={(value) => setAmountReceived(value || 0)}
                  style={{ width: '100%', marginTop: 4 }}
                  size="large"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
                
                {amountReceived > 0 && change >= 0 && (
                  <div style={{ marginTop: 8 }}>
                    <Text strong style={{ color: '#52c41a' }}>
                      Cambio: ${change.toLocaleString()}
                    </Text>
                  </div>
                )}
              </div>
            )}

            {/* Información de crédito */}
            {paymentMethod === 'Crédito' && (
              <div style={{ marginBottom: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd666', borderRadius: 6 }}>
                <Text strong style={{ color: '#d48806' }}>⚠️ Venta a Crédito</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {selectedClient?.name ? 
                    `${selectedClient.name} deberá pagar ${totals.subtotal.toLocaleString()}` :
                    'Debe seleccionar un cliente registrado'
                  }
                </Text>
                {!selectedClient?.name && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="danger" style={{ fontSize: '12px' }}>
                      ⚠️ Las ventas a crédito requieren un cliente registrado en el sistema
                    </Text>
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Button
                type="primary"
                size="large"
                block
                icon={<DollarOutlined />}
                onClick={processSale}
                disabled={
                  items.length === 0 || 
                  (paymentMethod === 'Crédito' && !selectedClient?.name) || // Solo cliente registrado para crédito
                  (paymentMethod === 'Efectivo' && amountReceived < totals.subtotal)
                }
                style={{ height: '50px', fontSize: '16px', fontWeight: 'bold' }}
              >
                {paymentMethod === 'Crédito' ? 'REGISTRAR VENTA A CRÉDITO' : 'PROCESAR VENTA'}
              </Button>
              
              <Button 
                block 
                icon={<ClearOutlined />}
                onClick={clearCart}
                disabled={items.length === 0}
                danger
              >
                Limpiar Carrito
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default POSInterface;
