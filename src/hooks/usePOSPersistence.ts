// src/hooks/usePOSPersistence.ts
import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { Product } from '../features/products/types';
import type { Client } from '../features/clients/types';

// Interfaz para el item del carrito persistente
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
  // Campos de descuento
  discountType?: 'percentage' | 'fixed'; // Tipo de descuento
  discountValue?: number; // Valor del descuento (% o monto)
  discountAmount?: number; // Monto final del descuento aplicado
  finalPrice?: number; // Precio final después del descuento
}

// Interfaz para el estado persistente del POS
interface POSPersistentState {
  items: POSItem[];
  selectedClient: Client | null;
  customerName: string;
  paymentMethod: string;
  amountReceived: number;
  lastSaved: string;
  // Descuento general
  generalDiscountType: 'percentage' | 'fixed';
  generalDiscountValue: number;
  // Observaciones
  notes: string;
}

const POS_STORAGE_KEY = 'pos_cart_state';

// Función para obtener el estado inicial desde localStorage
const getInitialState = (): POSPersistentState => {
  try {
    const stored = localStorage.getItem(POS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Verificar que el estado no sea muy antiguo (más de 24 horas)
      const lastSaved = new Date(parsed.lastSaved);
      const now = new Date();
      const hoursDiff = Math.abs(now.getTime() - lastSaved.getTime()) / 36e5;
      
      if (hoursDiff < 24) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn('Error al cargar estado persistente del POS:', error);
  }
  
  // Estado por defecto
  return {
    items: [],
    selectedClient: null,
    customerName: 'Cliente Ocasional',
    paymentMethod: 'Efectivo',
    amountReceived: 0,
    lastSaved: new Date().toISOString(),
    generalDiscountType: 'percentage',
    generalDiscountValue: 0,
    notes: '',
  };
};

// Función para guardar el estado en localStorage
const saveState = (state: POSPersistentState) => {
  try {
    const stateToSave = {
      ...state,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(POS_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('Error al guardar estado persistente del POS:', error);
  }
};

// Hook personalizado para la persistencia del POS
export const usePOSPersistence = () => {
  const [persistentState, setPersistentState] = useState<POSPersistentState>(getInitialState);

  // Función para actualizar un campo específico
  const updateField = <K extends keyof POSPersistentState>(
    field: K,
    value: POSPersistentState[K]
  ) => {
    setPersistentState(prev => {
      const newState = { ...prev, [field]: value };
      saveState(newState);
      return newState;
    });
  };

  // Función para limpiar el carrito (después de una venta exitosa)
  const clearCart = () => {
    const clearedState: POSPersistentState = {
      items: [],
      selectedClient: null,
      customerName: 'Cliente Ocasional',
      paymentMethod: 'Efectivo',
      amountReceived: 0,
      generalDiscountType: 'percentage',
      generalDiscountValue: 0,
      notes: '',
      lastSaved: new Date().toISOString(),
    };
    setPersistentState(clearedState);
    saveState(clearedState);
  };

  // Función para actualizar múltiples campos a la vez
  const updateMultipleFields = (updates: Partial<POSPersistentState>) => {
    setPersistentState(prev => {
      const newState = { ...prev, ...updates };
      saveState(newState);
      return newState;
    });
  };

  // Funciones específicas para items del carrito
  const addItem = (item: POSItem) => {
    updateField('items', [...persistentState.items, item]);
  };

  const updateItem = (key: string, updates: Partial<POSItem>) => {
    const updatedItems = persistentState.items.map(item =>
      item.key === key ? { ...item, ...updates } : item
    );
    updateField('items', updatedItems);
  };

  const removeItem = (key: string) => {
    const filteredItems = persistentState.items.filter(item => item.key !== key);
    updateField('items', filteredItems);
  };

  const setItems = (items: POSItem[]) => {
    updateField('items', items);
  };

  // Efecto para mostrar notificación si se restauró un carrito
  useEffect(() => {
    if (persistentState.items.length > 0) {
      message.info({
        content: `🛒 Carrito restaurado con ${persistentState.items.length} productos`,
        duration: 3,
        key: 'cart-restored',
      });
      console.log(`🛒 Carrito restaurado con ${persistentState.items.length} productos`);
    }
  }, []); // Solo ejecutar una vez al montar

  return {
    // Estado actual
    state: persistentState,
    
    // Funciones para actualizar estado
    updateField,
    updateMultipleFields,
    clearCart,
    
    // Funciones específicas para items
    addItem,
    updateItem,
    removeItem,
    setItems,
    
    // Información útil
    hasItems: persistentState.items.length > 0,
    itemCount: persistentState.items.length,
  };
};

export default usePOSPersistence;
