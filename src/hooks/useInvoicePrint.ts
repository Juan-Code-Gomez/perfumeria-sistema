// src/hooks/useInvoicePrint.ts
import { useCallback, useRef } from 'react';
import { message } from 'antd';

interface InvoicePrintOptions {
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
}

/**
 * Hook SIMPLIFICADO para impresión de facturas
 * Compatible con iOS, Android y Desktop
 * No crea contenedores temporales ni ventanas nuevas
 */
export const useInvoicePrint = (options: InvoicePrintOptions = {}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const printInvoice = useCallback(() => {
    if (!printRef.current) {
      message.error('Error: Factura no está lista para imprimir');
      return;
    }
    
    try {
      // Agregar clase de impresión al contenedor
      printRef.current.classList.add('printing');
      
      // Ejecutar impresión directamente
      window.print();
      
      // Remover clase después de imprimir
      setTimeout(() => {
        printRef.current?.classList.remove('printing');
        options.onAfterPrint?.();
      }, 100);
      
    } catch (error) {
      console.error('Error durante la impresión:', error);
      message.error('Error al imprimir la factura');
      printRef.current?.classList.remove('printing');
      options.onPrintError?.(error as Error);
    }
  }, [options]);

  return {
    printRef,
    printInvoice,
  };
};
