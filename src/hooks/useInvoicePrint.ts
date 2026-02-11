// src/hooks/useInvoicePrint.ts
import { useCallback, useRef } from 'react';

interface InvoicePrintOptions {
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
}

/**
 * Hook SIMPLIFICADO para impresión de facturas
 * Compatible con iOS, Android y Desktop
 * Ejecuta window.print() INMEDIATAMENTE para evitar bloqueos de iOS
 */
export const useInvoicePrint = (options: InvoicePrintOptions = {}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const printInvoice = useCallback(() => {
    if (!printRef.current) {
      return;
    }
    
    try {
      // Agregar clase de impresión al contenedor ANTES de imprimir
      printRef.current.classList.add('printing');
      
      // Ejecutar impresión INMEDIATAMENTE (sin delay)
      // Esto es crítico para iOS - debe ser síncrono
      window.print();
      
      // Remover clase después de imprimir
      // Usamos un evento nativo del navegador para saber cuándo terminó
      const afterPrint = () => {
        printRef.current?.classList.remove('printing');
        options.onAfterPrint?.();
        window.removeEventListener('afterprint', afterPrint);
      };
      
      window.addEventListener('afterprint', afterPrint);
      
    } catch (error) {
      console.error('Error durante la impresión:', error);
      printRef.current?.classList.remove('printing');
      options.onPrintError?.(error as Error);
    }
  }, [options]);

  return {
    printRef,
    printInvoice,
  };
};
