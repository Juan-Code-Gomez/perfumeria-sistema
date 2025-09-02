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
  Modal,
} from 'antd';
import {
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
  ClearOutlined,
  PrinterOutlined,
  UserOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import { useAppDispatch } from '../../store';
import { createSale } from '../../features/sales/salesSlice';
import debounce from 'lodash.debounce';
import * as productService from '../../services/productService';
import type { Product } from '../../features/products/types';
import POSTicket from '../pos/POSTicket';
import { usePOSPrint } from '../../hooks/usePOSPrint';
import ClientSelector from '../clients/ClientSelector';
import type { Client } from '../../features/clients/types';
import MultiplePaymentModal from './MultiplePaymentModal';
import type { PaymentMethod } from './MultiplePaymentModal';
import { usePOSPersistence } from '../../hooks/usePOSPersistence';

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

  // Hook de persistencia del carrito
  const {
    state: persistentState,
    updateField,
    clearCart: clearPersistentCart,
    addItem: addPersistentItem,
    updateItem: updatePersistentItem,
    removeItem: removePersistentItem,
  } = usePOSPersistence();

  // Estados que NO necesitan persistir (búsqueda y UI)
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  // Estados para pagos múltiples
  const [showMultiplePaymentModal, setShowMultiplePaymentModal] = useState(false);

  // Estados para impresión
  const [lastSale, setLastSale] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Extraer valores del estado persistente para fácil acceso
  const items = persistentState.items;
  const selectedClient = persistentState.selectedClient;
  const customerName = persistentState.customerName;
  const paymentMethod = persistentState.paymentMethod;
  const amountReceived = persistentState.amountReceived;
  const generalDiscountType = persistentState.generalDiscountType;
  const generalDiscountValue = persistentState.generalDiscountValue;

  // Setters para campos específicos usando el hook de persistencia
  const setSelectedClient = (client: Client | null) => updateField('selectedClient', client);
  const setCustomerName = (name: string) => updateField('customerName', name);
  const setPaymentMethod = (method: string) => updateField('paymentMethod', method);
  const setAmountReceived = (amount: number) => updateField('amountReceived', amount);
  const setGeneralDiscountType = (type: 'percentage' | 'fixed') => updateField('generalDiscountType', type);
  const setGeneralDiscountValue = (value: number) => updateField('generalDiscountValue', value);
  
  // Hook de impresión
  const { printRef, printTicket } = usePOSPrint({
    onAfterPrint: () => {
      setShowPrintModal(false);
      setLastSale(null);
    }
  });

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
    // Verificar el tipo de producto
    if (product.salesType === 'INSUMO' || product.salesType === 'COMBO') {
      message.info(`${product.name} agregado como ${product.salesType.toLowerCase()} - No se cobrará`);
    }

    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Si ya existe, aumentar cantidad
      updateQuantity(existingItem.key, existingItem.quantity + 1);
    } else {
      // Agregar nuevo item
      const key = Date.now().toString();
      const quantity = 1;
      
      // Para INSUMOS y COMBOS, el precio de venta es 0
      const unitPrice = (product.salesType === 'INSUMO' || product.salesType === 'COMBO') 
        ? 0 
        : product.salePrice;
      
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

      addPersistentItem(newItem);
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
      removePersistentItem(key);
      return;
    }

    const currentItem = items.find(item => item.key === key);
    if (currentItem) {
      const totalPrice = newQuantity * currentItem.unitPrice;
      updatePersistentItem(key, {
        quantity: newQuantity,
        totalPrice,
      });
    }
  };

  // Actualizar precio unitario
  const updateUnitPrice = (key: string, newPrice: number) => {
    const currentItem = items.find(item => item.key === key);
    if (!currentItem) return;

    // No permitir cambiar precio de insumos y combos
    if (currentItem.product.salesType === 'INSUMO' || currentItem.product.salesType === 'COMBO') {
      message.warning(`No se puede cambiar el precio de ${currentItem.product.salesType.toLowerCase()}s`);
      return;
    }
    
    const totalPrice = currentItem.quantity * newPrice;
    const profit = newPrice - currentItem.purchasePrice;
    const profitMargin = currentItem.purchasePrice > 0 ? (profit / currentItem.purchasePrice) * 100 : 0;
    
    updatePersistentItem(key, {
      unitPrice: newPrice,
      totalPrice,
      profit,
      profitMargin,
    });
  };

  // Remover item
  const removeItem = (key: string) => {
    removePersistentItem(key);
  };

  // Limpiar carrito (función local que usa el hook)
  const clearCart = () => {
    clearPersistentCart();
  };

  // Calcular totales
  const totals = {
    subtotal: items.reduce((sum, item) => sum + item.totalPrice, 0),
    totalProfit: items.reduce((sum, item) => sum + (item.profit * item.quantity), 0),
    totalCost: items.reduce((sum, item) => sum + (item.purchasePrice * item.quantity), 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  };

  // Calcular descuento general
  const discountAmount = generalDiscountType === 'percentage' 
    ? (totals.subtotal * (generalDiscountValue || 0) / 100)
    : (generalDiscountValue || 0);

  // Total final con descuento
  const finalTotal = Math.max(0, totals.subtotal - discountAmount);

  const overallMargin = totals.totalCost > 0 ? (totals.totalProfit / totals.totalCost) * 100 : 0;
  const change = amountReceived - finalTotal;

  // Procesar venta con múltiples métodos de pago
  const processSaleWithMultiplePayments = async (payments: PaymentMethod[]) => {
    if (items.length === 0) {
      message.error('Agregue productos al carrito');
      return;
    }

    try {
      const saleData = {
        date: new Date().toISOString(),
        clientId: selectedClient?.id || undefined,
        customerName: selectedClient?.name || customerName,
        totalAmount: finalTotal,
        paidAmount: finalTotal,
        isPaid: true,
        paymentMethod: payments.map(p => p.method).join(', '), // Para compatibilidad
        payments: payments.map(p => ({
          amount: p.amount,
          method: p.method,
          note: p.note,
        })),
        details: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          purchasePrice: item.purchasePrice,
          suggestedPrice: item.suggestedPrice,
        })),
      };

      console.log('Creando venta con múltiples pagos:', saleData);
      
      const result = await dispatch(createSale(saleData)).unwrap();
      
      console.log('Venta creada exitosamente:', result);
      
      // Preparar datos para impresión
      const saleForPrint = {
        id: result.id || Date.now(),
        date: saleData.date,
        customerName: saleData.customerName,
        totalAmount: saleData.totalAmount,
        paidAmount: saleData.paidAmount,
        paymentMethod: saleData.paymentMethod,
        payments: payments, // Incluir los pagos múltiples
        details: items.map(item => ({
          product: {
            name: item.product.name,
            category: item.product.category,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };
      
      message.success('¡Venta procesada exitosamente con múltiples métodos de pago!');

      // Configurar para impresión
      setLastSale(saleForPrint);
      setShowPrintModal(true);

      // Limpiar carrito
      clearCart();
      setShowMultiplePaymentModal(false);

      // Callback externo
      if (onSaleCompleted) {
        onSaleCompleted();
      }

    } catch (error) {
      console.error('Error procesando venta:', error);
      message.error('Error al procesar la venta');
    }
  };

  // Procesar venta (método original actualizado)
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

    if (paymentMethod === 'Efectivo' && amountReceived < finalTotal) {
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
        totalAmount: finalTotal,
        paidAmount: isCredit ? 0 : finalTotal, // Si es crédito, monto pagado = 0
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
      
      // Preparar datos para impresión
      const saleForPrint = {
        id: result.id || Date.now(),
        date: saleData.date,
        customerName: saleData.customerName,
        totalAmount: saleData.totalAmount,
        paidAmount: saleData.paidAmount,
        paymentMethod: saleData.paymentMethod,
        details: items.map(item => ({
          product: {
            name: item.product.name,
            category: item.product.category,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
      };
      
      if (isCredit) {
        message.success(`¡Venta a crédito registrada! Pendiente: $${finalTotal.toLocaleString()}`);
      } else {
        message.success('¡Venta procesada exitosamente!');
      }

      // Configurar para impresión
      setLastSale(saleForPrint);
      setShowPrintModal(true);
      
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
              <div style={{ marginTop: 4 }}>
                <Tag color="blue">{product.category.name}</Tag>
                {(product.salesType === 'INSUMO' || product.salesType === 'COMBO') && (
                  <Tag color="orange">
                    {product.salesType === 'INSUMO' ? '🔧 Insumo' : '📦 Combo'}
                  </Tag>
                )}
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
      render: (price: number, record: POSItem) => {
        const isInsumoOrCombo = record.product.salesType === 'INSUMO' || record.product.salesType === 'COMBO';
        
        return (
          <div>
            <InputNumber
              prefix="$"
              value={price}
              onChange={(value) => updateUnitPrice(record.key, value || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              style={{ width: '100px' }}
              disabled={isInsumoOrCombo}
            />
            {isInsumoOrCombo && (
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Sin costo
                </Text>
              </div>
            )}
            {!isInsumoOrCombo && price !== record.suggestedPrice && (
              <div>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                  Sugerido: ${record.suggestedPrice.toLocaleString()}
                </Text>
              </div>
            )}
          </div>
        );
      },
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
            title={
              <Space>
                <span>🛒 Punto de Venta</span>
                {items.length > 0 && (
                  <Tag color="green" style={{ fontSize: '11px' }}>
                    💾 {items.length} productos guardados
                  </Tag>
                )}
              </Space>
            } 
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
              <div style={{ marginTop: 4 }}>
                <ClientSelector
                  onSelectClient={setSelectedClient}
                  value={selectedClient}
                  placeholder={
                    paymentMethod === 'Crédito' 
                      ? 'Seleccione un cliente registrado (requerido)' 
                      : 'Buscar cliente o dejar vacío para cliente ocasional'
                  }
                  allowClear={paymentMethod !== 'Crédito'}
                />
              </div>
              
              {/* Campo para cliente ocasional solo si NO es crédito y NO hay cliente seleccionado */}
              {!selectedClient && paymentMethod !== 'Crédito' && (
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente ocasional"
                  style={{ marginTop: 8 }}
                  prefix={<UserOutlined />}
                />
              )}

              {/* Mensaje informativo para crédito */}
              {paymentMethod === 'Crédito' && !selectedClient && (
                <div style={{ marginTop: 8, padding: 8, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    💡 Para ventas a crédito debe seleccionar un cliente registrado
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            {/* Totales */}
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Row justify="space-between">
                <Text>Subtotal ({totals.itemCount}):</Text>
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

            {/* Descuento */}
            <div style={{ marginBottom: 16 }}>
              <Text strong>Descuento:</Text>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Select
                  value={generalDiscountType}
                  onChange={setGeneralDiscountType}
                  style={{ width: 120 }}
                  size="small"
                >
                  <Option value="percentage">%</Option>
                  <Option value="fixed">$</Option>
                </Select>
                <InputNumber
                  value={generalDiscountValue}
                  onChange={(value) => setGeneralDiscountValue(value || 0)}
                  style={{ flex: 1 }}
                  size="small"
                  min={0}
                  max={generalDiscountType === 'percentage' ? 100 : totals.subtotal}
                  placeholder={generalDiscountType === 'percentage' ? '0' : '0'}
                  formatter={(value) => generalDiscountType === 'fixed' ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : `${value}`}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </div>
              {discountAmount > 0 && (
                <div style={{ marginTop: 4, textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Descuento aplicado: ${discountAmount.toLocaleString()}
                  </Text>
                </div>
              )}
            </div>

            <Divider />

            {/* Total final */}
            <Row justify="space-between" style={{ marginBottom: 20 }}>
              <Title level={3} style={{ margin: 0 }}>TOTAL:</Title>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                ${finalTotal.toLocaleString()}
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
                    `${selectedClient.name} deberá pagar ${finalTotal.toLocaleString()}` :
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
                  (paymentMethod === 'Efectivo' && amountReceived < finalTotal)
                }
                style={{ height: '50px', fontSize: '16px', fontWeight: 'bold' }}
              >
                {paymentMethod === 'Crédito' ? 'REGISTRAR VENTA A CRÉDITO' : 'PROCESAR VENTA'}
              </Button>

              {/* Botón para pagos múltiples */}
              {paymentMethod !== 'Crédito' && (
                <Button
                  type="default"
                  size="large"
                  block
                  icon={<CreditCardOutlined />}
                  onClick={() => setShowMultiplePaymentModal(true)}
                  disabled={items.length === 0}
                  style={{ height: '40px', fontSize: '14px' }}
                >
                  💳 PAGOS MÚLTIPLES
                </Button>
              )}
              
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

      {/* Modal de impresión */}
      <Modal
        title="Imprimir Ticket"
        open={showPrintModal}
        onCancel={() => setShowPrintModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowPrintModal(false)}>
            Cerrar
          </Button>,
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
            onClick={printTicket}
          >
            Imprimir Ticket
          </Button>,
        ]}
        width={400}
        centered
      >
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p>¿Desea imprimir el ticket de la venta?</p>
        </div>
        
        {/* Vista previa del ticket (oculta) */}
        <div style={{ display: 'none' }}>
          {lastSale && (
            <POSTicket 
              ref={printRef}
              sale={lastSale}
              change={paymentMethod === 'Efectivo' ? change : 0}
            />
          )}
        </div>
        
        {/* Vista previa visible para el usuario */}
        {lastSale && (
          <div style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: '6px',
            padding: '16px',
            backgroundColor: '#fafafa',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <POSTicket 
              sale={lastSale}
              change={paymentMethod === 'Efectivo' ? change : 0}
            />
          </div>
        )}
      </Modal>

      {/* Modal de pagos múltiples */}
      <MultiplePaymentModal
        visible={showMultiplePaymentModal}
        totalAmount={finalTotal}
        onConfirm={processSaleWithMultiplePayments}
        onCancel={() => setShowMultiplePaymentModal(false)}
      />
    </div>
  );
};

export default POSInterface;
