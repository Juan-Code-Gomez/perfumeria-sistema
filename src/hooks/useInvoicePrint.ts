// src/hooks/useInvoicePrint.ts
import { useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { message } from 'antd';

interface InvoicePrintOptions {
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
}

export const useInvoicePrint = (options: InvoicePrintOptions = {}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Factura-${Date.now()}`,
    onAfterPrint: () => {
      message.success('Factura enviada a impresión correctamente');
      options.onAfterPrint?.();
    },
    onPrintError: (errorLocation, error) => {
      message.error('Error al imprimir la factura');
      console.error('Error de impresión:', errorLocation, error);
      options.onPrintError?.(new Error(`Error en ${errorLocation}: ${error.message}`));
    },
    pageStyle: `
      @page {
        size: letter;
        margin: 0;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      
      @media print {
        /* Ocultar todo excepto el contenido a imprimir */
        body > * {
          display: none !important;
        }
        
        .ant-layout,
        .ant-layout-sider,
        .ant-layout-header,
        .ant-modal-mask,
        .ant-modal-wrap,
        .ant-drawer,
        .ant-modal-header,
        .ant-modal-footer {
          display: none !important;
        }
        
        /* Mostrar solo el contenido de la factura */
        [data-print-content] {
          display: block !important;
          position: relative !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      
        body {
          margin: 0;
          padding: 0;
          color: black;
          background: white;
        }
        
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        .no-print {
          display: none !important;
        }
      }
    `,
  });

  const printInvoice = useCallback(() => {
    if (!printRef.current) {
      message.error('Error: Factura no está lista para imprimir');
      return;
    }
    
    // Mostrar información útil al usuario
    message.info({
      content: 'Preparando factura para impresión. Para guardar como PDF, selecciona "Guardar como PDF" en las opciones.',
      duration: 4,
    });
    
    // Ejecutar la impresión
    handlePrint();
  }, [handlePrint]);

  return {
    printRef,
    printInvoice,
  };
};
