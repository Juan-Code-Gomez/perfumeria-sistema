// src/hooks/useInvoicePrint.ts
import { useCallback, useRef } from 'react';
import { message } from 'antd';

interface InvoicePrintOptions {
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
}

/**
 * Hook optimizado para impresión de facturas
 * Funciona tanto en desktop como en móviles (Android/iOS)
 * Usa el API nativo de window.print() para mejor compatibilidad
 */
export const useInvoicePrint = (options: InvoicePrintOptions = {}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const printInvoice = useCallback(() => {
    const contentElement = printRef.current;
    
    if (!contentElement) {
      message.error('Error: Factura no está lista para imprimir');
      return;
    }
    
    try {
      // Mostrar mensaje de preparación
      message.info({
        content: 'Preparando factura para impresión...',
        duration: 2,
      });

      // Clonar el contenido de la factura
      const printContent = contentElement.cloneNode(true) as HTMLElement;
      printContent.style.display = 'block';
      printContent.style.visibility = 'visible';
      
      // Crear contenedor temporal para impresión
      const printContainer = document.createElement('div');
      printContainer.id = 'invoice-print-container';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.width = '100%';
      printContainer.style.height = '100%';
      printContainer.style.zIndex = '9999';
      printContainer.style.background = 'white';
      printContainer.style.overflow = 'auto';
      printContainer.appendChild(printContent);
      
      // Agregar al body
      document.body.appendChild(printContainer);
      
      // Pequeño delay para asegurar que el contenido se renderice
      setTimeout(() => {
        try {
          // Guardar scroll position
          const scrollY = window.scrollY;
          
          // Ejecutar impresión
          window.print();
          
          // Restaurar scroll
          window.scrollTo(0, scrollY);
          
          // Limpiar después de imprimir
          setTimeout(() => {
            if (printContainer.parentNode) {
              document.body.removeChild(printContainer);
            }
            message.success('Factura enviada a impresión');
            options.onAfterPrint?.();
          }, 100);
          
        } catch (error) {
          console.error('Error durante la impresión:', error);
          message.error('Error al imprimir la factura');
          if (printContainer.parentNode) {
            document.body.removeChild(printContainer);
          }
          options.onPrintError?.(error as Error);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error preparando impresión:', error);
      message.error('Error al preparar la factura para impresión');
      options.onPrintError?.(error as Error);
    }
  }, [options]);

  return {
    printRef,
    printInvoice,
  };
};
