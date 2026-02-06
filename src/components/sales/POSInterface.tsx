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
  DatePicker,
  Switch,
  Alert,
} from 'antd';
import {
  DeleteOutlined,
  DollarOutlined,
  SearchOutlined,
  ClearOutlined,
  PrinterOutlined,
  UserOutlined,
  CreditCardOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../store';
import { createSale } from '../../features/sales/salesSlice';
import { fetchCompanyConfig } from '../../features/company-config/companyConfigSlice';
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
import { usePOSConfiguration } from '../../hooks/usePOSConfiguration';

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
  const { config: companyConfig } = useAppSelector((state) => state.companyConfig);
  const searchInputRef = useRef<any>(null);

  // Hook de configuración del POS
  const { config: posConfig, refetch: refetchConfig } = usePOSConfiguration();
  
  // Cargar configuración de empresa al montar
  useEffect(() => {
    if (!companyConfig) {
      dispatch(fetchCompanyConfig());
    }
  }, [companyConfig, dispatch]);
  
  // Debug: mostrar la configuración actual
  useEffect(() => {
    console.log('POS Config loaded:', posConfig);
    console.log('Edit cost enabled:', posConfig.editCostEnabled);
    console.log('Allow manual sale date:', posConfig.allowManualSaleDate);
  }, [posConfig]);

  // Estados para fecha manual
  const [useManualDate, setUseManualDate] = useState(false);
  const [manualSaleDate, setManualSaleDate] = useState<Dayjs | null>(null);

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

  // Estado de loading para prevenir múltiples clics
  const [isProcessing, setIsProcessing] = useState(false);

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
  const notes = persistentState.notes || '';

  // Setters para campos específicos usando el hook de persistencia
  const setSelectedClient = (client: Client | null) => updateField('selectedClient', client);
  const setCustomerName = (name: string) => updateField('customerName', name);
  const setPaymentMethod = (method: string) => updateField('paymentMethod', method);
  const setAmountReceived = (amount: number) => updateField('amountReceived', amount);
  const setGeneralDiscountType = (type: 'percentage' | 'fixed') => updateField('generalDiscountType', type);
  const setGeneralDiscountValue = (value: number) => updateField('generalDiscountValue', value);
  const setNotes = (value: string) => updateField('notes', value);
  
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

  // Actualizar costo de compra (solo si está habilitado)
  const updatePurchasePrice = (key: string, newCost: number) => {
    const currentItem = items.find(item => item.key === key);
    if (!currentItem) return;

    // Verificar si la función está habilitada
    if (!posConfig.editCostEnabled) {
      message.warning('La edición de costos no está habilitada para este usuario');
      return;
    }

    // No permitir costos negativos
    if (newCost < 0) {
      message.warning('El costo no puede ser negativo');
      return;
    }

    // Recalcular ganancia y margen
    const profit = currentItem.unitPrice - newCost;
    const profitMargin = newCost > 0 ? (profit / newCost) * 100 : 0;

    updatePersistentItem(key, {
      purchasePrice: newCost,
      profit,
      profitMargin,
    });

    message.success(`Costo actualizado para ${currentItem.product.name}`);
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

    // Prevenir múltiples clics
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Determinar la fecha a usar
      const saleDate = (useManualDate && manualSaleDate) 
        ? manualSaleDate.format('YYYY-MM-DD')
        : new Date().toISOString();

      const saleData = {
        date: saleDate,
        clientId: selectedClient?.id || undefined,
        customerName: selectedClient?.name || customerName,
        subtotalAmount: totals.subtotal,
        discountType: generalDiscountType,
        discountValue: generalDiscountValue,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        paidAmount: finalTotal,
        isPaid: true,
        paymentMethod: payments.map(p => p.method).join(', '), // Para compatibilidad
        notes: notes || undefined, // Agregar observaciones
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
    } finally {
      // Asegurar que siempre se deshabilite el loading
      setIsProcessing(false);
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

    // Prevenir múltiples clics
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      // Para ventas a crédito, el monto pagado es 0 y no está pagada
      const isCredit = paymentMethod === 'Crédito';
      
      // Determinar la fecha a usar
      const saleDate = (useManualDate && manualSaleDate) 
        ? manualSaleDate.format('YYYY-MM-DD')
        : new Date().toISOString();
      
      const saleData = {
        date: saleDate,
        clientId: selectedClient?.id || undefined, // Solo enviar si existe y no es null
        customerName: selectedClient?.name || customerName,
        subtotalAmount: totals.subtotal,
        discountType: generalDiscountType,
        discountValue: generalDiscountValue,
        discountAmount: discountAmount,
        totalAmount: finalTotal,
        paidAmount: isCredit ? 0 : finalTotal, // Si es crédito, monto pagado = 0
        isPaid: !isCredit, // Si es crédito, no está pagada
        paymentMethod,
        notes: notes || undefined, // Agregar observaciones
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
    } finally {
      // Asegurar que siempre se deshabilite el loading
      setIsProcessing(false);
    }
  };

  // Columnas de la tabla - Responsive
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  
  const columns = [
    {
      title: 'Producto',
      dataIndex: 'product',
      key: 'product',
      width: isMobile ? 140 : undefined,
      render: (product: Product) => (
          <div>
            <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
              {product.name}
            </Text>
            {product.category && !isMobile && (
              <div style={{ marginTop: 4 }}>
                <Tag color="blue" style={{ fontSize: '11px' }}>{product.category.name}</Tag>
                {(product.salesType === 'INSUMO' || product.salesType === 'COMBO') && (
                  <Tag color="orange" style={{ fontSize: '10px' }}>
                    {product.salesType === 'INSUMO' ? '🔧 Insumo' : '📦 Combo'}
                  </Tag>
                )}
              </div>
            )}
            {isMobile && (product.salesType === 'INSUMO' || product.salesType === 'COMBO') && (
              <Tag color="orange" style={{ fontSize: '9px', marginTop: '2px' }}>
                {product.salesType === 'INSUMO' ? '🔧' : '📦'}
              </Tag>
            )}
          </div>
      ),
    },
    {
      title: 'Cant.',
      dataIndex: 'quantity',
      key: 'quantity',
      width: isMobile ? 70 : 90,
      render: (quantity: number, record: POSItem) => (
        <InputNumber
          min={1}
          value={quantity}
          onChange={(value) => updateQuantity(record.key, value || 1)}
          size={isMobile ? 'small' : 'middle'}
          style={{ width: isMobile ? '55px' : '70px' }}
        />
      ),
    },
    // Columna de costo (solo visible si está habilitada Y no es móvil)
    ...(!isMobile && posConfig.editCostEnabled ? [{
      title: 'Costo',
      dataIndex: 'purchasePrice',
      key: 'purchasePrice',
      width: isTablet ? 100 : 110,
      render: (cost: number, record: POSItem) => {
        const isInsumoOrCombo = record.product.salesType === 'INSUMO' || record.product.salesType === 'COMBO';
        
        if (isInsumoOrCombo) {
          return (
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>N/A</Text>
            </div>
          );
        }

        return (
          <div>
            <InputNumber
              prefix="$"
              value={cost}
              onChange={(value) => updatePurchasePrice(record.key, value || 0)}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
              size={isTablet ? 'small' : 'middle'}
              style={{ width: isTablet ? '85px' : '95px' }}
              min={0}
            />
            <div>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                Margen: {record.profitMargin.toFixed(1)}%
              </Text>
            </div>
          </div>
        );
      },
    }] : []),
    {
      title: isMobile ? 'Precio' : 'Precio Unit.',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: isMobile ? 100 : 130,
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
              size={isMobile ? 'small' : 'middle'}
              style={{ width: isMobile ? '85px' : '110px' }}
              disabled={isInsumoOrCombo}
            />
            {isInsumoOrCombo && (
              <div>
                <Text type="secondary" style={{ fontSize: '10px' }}>
                  Sin costo
                </Text>
              </div>
            )}
            {!isMobile && !isInsumoOrCombo && price !== record.suggestedPrice && (
              <div>
                <Text type="secondary" style={{ fontSize: '10px' }}>
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
      width: isMobile ? 80 : 100,
      render: (price: number) => (
        <Text strong style={{ fontSize: isMobile ? '13px' : '14px' }}>
          ${price.toLocaleString()}
        </Text>
      ),
    },
    // Columna de ganancia (oculta en móvil)
    ...(!isMobile ? [{
      title: 'Ganancia',
      dataIndex: 'profit',
      key: 'profit',
      width: isTablet ? 100 : 120,
      render: (profit: number, record: POSItem) => (
        <div>
          <Text 
            strong 
            style={{ 
              color: profit > 0 ? '#52c41a' : '#ff4d4f',
              fontSize: isTablet ? '13px' : '14px'
            }}
          >
            ${(profit * record.quantity).toLocaleString()}
          </Text>
          <div>
            <Text 
              style={{ 
                fontSize: '10px', 
                color: record.profitMargin > 50 ? '#52c41a' : 
                       record.profitMargin > 20 ? '#faad14' : '#ff4d4f' 
              }}
            >
              {record.profitMargin.toFixed(1)}%
            </Text>
          </div>
        </div>
      ),
    }] : []),
    {
      title: isMobile ? '' : 'Acciones',
      key: 'actions',
      width: isMobile ? 50 : 70,
      fixed: isMobile ? ('right' as const) : undefined,
      render: (_: any, record: POSItem) => (
        <Button
          type="text"
          danger
          size={isMobile ? 'small' : 'middle'}
          icon={<DeleteOutlined style={{ fontSize: isMobile ? '16px' : '14px' }} />}
          onClick={() => removeItem(record.key)}
        />
      ),
    },
  ];

  return (
    <div style={{ 
      height: '100vh', 
      padding: window.innerWidth < 768 ? '8px' : '16px' 
    }}>
      <Row gutter={window.innerWidth < 768 ? [8, 8] : [16, 16]} style={{ height: '100%' }}>
        {/* Columna izquierda - Búsqueda y productos */}
        <Col xs={24} lg={16} style={{ 
          marginBottom: window.innerWidth < 768 ? '8px' : '0' 
        }}>
          <Card 
            title={
              <Space size={window.innerWidth < 768 ? 'small' : 'middle'}>
                <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                  🛒 Punto de Venta
                </span>
                {items.length > 0 && (
                  <Tag color="green" style={{ fontSize: window.innerWidth < 768 ? '10px' : '11px' }}>
                    💾 {items.length} productos
                  </Tag>
                )}
              </Space>
            } 
            style={{ 
              height: window.innerWidth < 768 ? 'auto' : '100%' 
            }}
            extra={
              <Space size="small">
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    size="small"
                    onClick={async () => {
                      await refetchConfig();
                      console.log('Config refrescada:', posConfig);
                    }}
                  >
                    🔄
                  </Button>
                )}
                <Button 
                  size={window.innerWidth < 768 ? 'small' : 'middle'}
                  icon={<ClearOutlined />} 
                  onClick={clearCart}
                  disabled={items.length === 0}
                >
                  {window.innerWidth < 768 ? '' : 'Limpiar'}
                </Button>
              </Space>
            }
          >
            {/* Búsqueda de productos */}
            <div style={{ marginBottom: 16 }}>
              <Input
                ref={searchInputRef}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
                placeholder={window.innerWidth < 768 ? 'Buscar producto...' : 'Buscar producto (nombre, código)...'}
                prefix={<SearchOutlined />}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus={window.innerWidth >= 768}
              />
              
              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <Card 
                  size="small" 
                  style={{ 
                    marginTop: 8, 
                    maxHeight: window.innerWidth < 768 ? 150 : 200, 
                    overflowY: 'auto',
                    border: '1px solid #d9d9d9'
                  }}
                >
                  {searchResults.map(product => (
                    <div 
                      key={product.id}
                      style={{ 
                        padding: window.innerWidth < 768 ? '6px 8px' : '8px 12px', 
                        cursor: 'pointer',
                        borderBottom: '1px solid #f0f0f0'
                      }}
                      onClick={() => addToCart(product)}
                    >
                      <Row justify="space-between" align="middle" gutter={[8, 0]}>
                        <Col xs={18} sm={20}>
                          <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>
                            {product.name}
                          </Text>
                          <div>
                            <Tag color="blue" style={{ fontSize: window.innerWidth < 768 ? '10px' : '12px', marginTop: '4px' }}>
                              {product.category?.name}
                            </Tag>
                            <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                              Stock: {product.stock} {product.unit?.name}
                            </Text>
                          </div>
                        </Col>
                        <Col xs={6} sm={4} style={{ textAlign: 'right' }}>
                          <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>
                            ${product.salePrice.toLocaleString()}
                          </Text>
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
              size={window.innerWidth < 768 ? 'small' : 'middle'}
              scroll={{ 
                x: window.innerWidth < 768 ? 600 : undefined,
                y: window.innerWidth < 768 ? 'calc(50vh - 200px)' : 'calc(100vh - 300px)' 
              }}
              locale={{ emptyText: 'Carrito vacío - Busque productos arriba' }}
            />
          </Card>
        </Col>

        {/* Columna derecha - Resumen y checkout */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <span style={{ fontSize: window.innerWidth < 768 ? '14px' : '16px' }}>
                💰 Resumen
              </span>
            }
            style={{ 
              height: window.innerWidth < 768 ? 'auto' : '100%' 
            }}
          >
            {/* Cliente */}
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Cliente:</Text>
              <div style={{ marginTop: 4 }}>
                <ClientSelector
                  onSelectClient={setSelectedClient}
                  value={selectedClient}
                  placeholder={
                    paymentMethod === 'Crédito' 
                      ? (window.innerWidth < 768 ? 'Cliente requerido' : 'Seleccione un cliente registrado (requerido)')
                      : (window.innerWidth < 768 ? 'Buscar cliente' : 'Buscar cliente o dejar vacío para cliente ocasional')
                  }
                  allowClear={paymentMethod !== 'Crédito'}
                />
              </div>
              
              {/* Campo para cliente ocasional solo si NO es crédito y NO hay cliente seleccionado */}
              {!selectedClient && paymentMethod !== 'Crédito' && (
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={window.innerWidth < 768 ? 'Nombre del cliente' : 'Nombre del cliente ocasional'}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
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

            {/* Fecha Manual (solo si está habilitado) */}
            {posConfig.allowManualSaleDate && (
              <>
                <Divider />
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text strong>
                      <CalendarOutlined /> Fecha de Venta:
                    </Text>
                    <Switch
                      checked={useManualDate}
                      onChange={(checked) => {
                        setUseManualDate(checked);
                        if (!checked) {
                          setManualSaleDate(null);
                        }
                      }}
                      checkedChildren="Manual"
                      unCheckedChildren="Hoy"
                      size="small"
                    />
                  </div>

                  {useManualDate && (
                    <>
                      <DatePicker
                        value={manualSaleDate}
                        onChange={setManualSaleDate}
                        format="DD/MM/YYYY"
                        placeholder="Seleccionar fecha"
                        style={{ width: '100%' }}
                        disabledDate={(current) => {
                          // No permitir fechas futuras
                          return current && current > dayjs().endOf('day');
                        }}
                      />
                      <Alert
                        message="Modo fecha manual activado para migración de datos históricos"
                        type="warning"
                        showIcon
                        style={{ marginTop: 8, fontSize: '12px' }}
                      />
                    </>
                  )}

                  {!useManualDate && (
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        📅 Fecha actual: {dayjs().format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  )}
                </div>
              </>
            )}

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

            <Divider style={{ margin: window.innerWidth < 768 ? '12px 0' : '16px 0' }} />

            {/* Descuento */}
            <div style={{ marginBottom: window.innerWidth < 768 ? 12 : 16 }}>
              <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Descuento:</Text>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Select
                  value={generalDiscountType}
                  onChange={setGeneralDiscountType}
                  style={{ width: window.innerWidth < 768 ? 80 : 120 }}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                >
                  <Option value="percentage">%</Option>
                  <Option value="fixed">$</Option>
                </Select>
                <InputNumber
                  value={generalDiscountValue}
                  onChange={(value) => setGeneralDiscountValue(value || 0)}
                  style={{ flex: 1 }}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                  min={0}
                  max={generalDiscountType === 'percentage' ? 100 : totals.subtotal}
                  placeholder={generalDiscountType === 'percentage' ? '0' : '0'}
                  formatter={(value) => generalDiscountType === 'fixed' ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : `${value}`}
                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
                />
              </div>
              {discountAmount > 0 && (
                <div style={{ marginTop: 4, textAlign: 'right' }}>
                  <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                    Descuento aplicado: ${discountAmount.toLocaleString()}
                  </Text>
                </div>
              )}
            </div>

            <Divider style={{ margin: window.innerWidth < 768 ? '12px 0' : '16px 0' }} />

            {/* Total final */}
            <Row justify="space-between" style={{ marginBottom: window.innerWidth < 768 ? 16 : 20 }}>
              <Title level={window.innerWidth < 768 ? 4 : 3} style={{ margin: 0 }}>TOTAL:</Title>
              <Title level={window.innerWidth < 768 ? 4 : 3} style={{ margin: 0, color: '#1890ff' }}>
                ${finalTotal.toLocaleString()}
              </Title>
            </Row>

            {/* Observaciones */}
            <div style={{ marginBottom: window.innerWidth < 768 ? 12 : 16 }}>
              <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Observaciones:</Text>
              <Input.TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar observaciones o notas de la venta (opcional)"
                rows={2}
                maxLength={500}
                showCount
                style={{ marginTop: 4 }}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
              />
            </div>

            {/* Observaciones */}
            <div style={{ marginBottom: window.innerWidth < 768 ? 12 : 16 }}>
              <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Observaciones:</Text>
              <Input.TextArea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales de la venta (opcional)"
                style={{ marginTop: 4 }}
                rows={2}
                maxLength={500}
                showCount
              />
            </div>

            {/* Método de pago */}
            <div style={{ marginBottom: window.innerWidth < 768 ? 12 : 16 }}>
              <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Método de Pago:</Text>
              <Select
                value={paymentMethod}
                onChange={setPaymentMethod}
                style={{ width: '100%', marginTop: 4 }}
                size={window.innerWidth < 768 ? 'middle' : 'large'}
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
              <div style={{ marginBottom: window.innerWidth < 768 ? 12 : 16 }}>
                <Text strong style={{ fontSize: window.innerWidth < 768 ? '13px' : '14px' }}>Monto Recibido:</Text>
                <InputNumber
                  prefix="$"
                  value={amountReceived}
                  onChange={(value) => setAmountReceived(value || 0)}
                  style={{ width: '100%', marginTop: 4 }}
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}                  parser={(value) => parseFloat(value!.replace(/\$\s?|(,*)/g, '')) || 0}
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
              <div style={{ 
                marginBottom: window.innerWidth < 768 ? 12 : 16, 
                padding: window.innerWidth < 768 ? 8 : 12, 
                background: '#fff7e6', 
                border: '1px solid #ffd666', 
                borderRadius: 6 
              }}>
                <Text strong style={{ color: '#d48806', fontSize: window.innerWidth < 768 ? '12px' : '14px' }}>
                  ⚠️ Venta a Crédito
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                  {selectedClient?.name ? 
                    `${selectedClient.name} deberá pagar ${finalTotal.toLocaleString()}` :
                    'Debe seleccionar un cliente registrado'
                  }
                </Text>
                {!selectedClient?.name && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="danger" style={{ fontSize: window.innerWidth < 768 ? '11px' : '12px' }}>
                      ⚠️ Las ventas a crédito requieren un cliente registrado en el sistema
                    </Text>
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <Space direction="vertical" style={{ width: '100%' }} size={window.innerWidth < 768 ? 'middle' : 'large'}>
              <Button
                type="primary"
                size={window.innerWidth < 768 ? 'middle' : 'large'}
                block
                icon={<DollarOutlined />}
                onClick={processSale}
                loading={isProcessing}
                disabled={
                  items.length === 0 || 
                  isProcessing ||
                  (paymentMethod === 'Crédito' && !selectedClient?.name) || // Solo cliente registrado para crédito
                  (paymentMethod === 'Efectivo' && amountReceived < finalTotal) ||
                  (useManualDate && !manualSaleDate) // Validar fecha manual si está activada
                }
                style={{ 
                  height: window.innerWidth < 768 ? '44px' : '50px', 
                  fontSize: window.innerWidth < 768 ? '14px' : '16px', 
                  fontWeight: 'bold' 
                }}
              >
                {paymentMethod === 'Crédito' ? (window.innerWidth < 768 ? 'VENTA A CRÉDITO' : 'REGISTRAR VENTA A CRÉDITO') : 'PROCESAR VENTA'}
              </Button>

              {/* Botón para pagos múltiples */}
              {paymentMethod !== 'Crédito' && (
                <Button
                  type="default"
                  size={window.innerWidth < 768 ? 'middle' : 'large'}
                  block
                  icon={<CreditCardOutlined />}
                  onClick={() => setShowMultiplePaymentModal(true)}
                  disabled={items.length === 0 || isProcessing}
                  style={{ 
                    height: window.innerWidth < 768 ? '40px' : '40px', 
                    fontSize: window.innerWidth < 768 ? '13px' : '14px' 
                  }}
                >
                  💳 PAGOS MÚLTIPLES
                </Button>
              )}
              
              <Button 
                block 
                size={window.innerWidth < 768 ? 'middle' : 'large'}
                icon={<ClearOutlined />}
                onClick={clearCart}
                disabled={items.length === 0 || isProcessing}
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
              companyConfig={companyConfig || undefined}
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
              companyConfig={companyConfig || undefined}
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
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default POSInterface;
