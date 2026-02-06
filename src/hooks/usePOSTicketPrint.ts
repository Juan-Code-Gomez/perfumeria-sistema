// src/hooks/usePOSTicketPrint.ts
import { useCallback, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { message } from 'antd';

interface POSTicketPrintOptions {
  onAfterPrint?: () => void;
  onPrintError?: (error: Error) => void;
}

export const usePOSTicketPrint = (options: POSTicketPrintOptions = {}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ticket-Venta-${Date.now()}`,
    onAfterPrint: () => {
      message.success('Ticket POS enviado a impresión correctamente');
      options.onAfterPrint?.();
    },
    onPrintError: (errorLocation, error) => {
      message.error('Error al imprimir el ticket POS');
      console.error('Error de impresión:', errorLocation, error);
      options.onPrintError?.(new Error(`Error en ${errorLocation}: ${error.message}`));
    },
    pageStyle: `
      @page {
        size: 80mm auto;
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
        
        /* Mostrar solo el contenido del ticket */
        [data-print-content] {
          display: block !important;
          position: relative !important;
          width: 80mm !important;
          margin: 0 !important;
          padding: 0 !important;
        }
      
        body {
          margin: 0;
          padding: 0;
          font-family: 'Courier New', monospace !important;
          font-size: 12px;
          line-height: 1.2;
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
        
        /* Optimización para impresoras térmicas */
        .ticket-container {
          width: 80mm;
          max-width: 80mm;
          font-family: 'Courier New', monospace;
        }
      }
    `,
  });

  const printTicket = useCallback(() => {
    if (!printRef.current) {
      message.error('Error: Ticket no está listo para imprimir');
      return;
    }
    
    // Mostrar información útil al usuario
    message.info({
      content: 'Preparando ticket POS para impresión. Si tienes una impresora térmica, selecciónala de la lista.',
      duration: 4,
    });
    
    // Pequeño delay para asegurar que el componente esté renderizado
    setTimeout(() => {
      handlePrint();
    }, 100);
  }, [handlePrint]);

  return {
    printRef,
    printTicket,
  };
};
