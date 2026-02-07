import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { PrinterOutlined, CloseOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import SaleInvoice from './SaleInvoice';
import type { CompanyConfig } from '../../features/company-config/companyConfigSlice';

interface SaleInvoiceModalProps {
  visible: boolean;
  sale: any;
  companyConfig: CompanyConfig;
  onClose: () => void;
}

const SaleInvoiceModal: React.FC<SaleInvoiceModalProps> = ({
  visible,
  sale,
  companyConfig,
  onClose,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsMobile(mobile);
      setIsIOS(iOS);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const reactToPrintFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Venta-${sale?.id || 'documento'}`,
    pageStyle: `
      @page {
        size: letter;
        margin: 0;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* Ocultar todo excepto el contenido a imprimir */
        body > *:not([data-print-content]) {
          display: none !important;
        }
        /* Ocultar modales, sidebars, overlays */
        .ant-modal-mask,
        .ant-modal-wrap,
        .ant-drawer,
        .ant-layout-sider,
        header,
        nav,
        aside,
        footer {
          display: none !important;
        }
        /* Mostrar solo el contenido de la factura */
        [data-print-content] {
          display: block !important;
          position: relative !important;
          left: 0 !important;
          top: 0 !important;
          margin: 0 !important;
        }
      }
    `,  });

  const handlePrintClick = () => {
    console.log('Botón imprimir factura clickeado');
    console.log('isMobile:', isMobile, 'isIOS:', isIOS);
    
    // En móvil (especialmente iOS/Safari), usar window.open para evitar bloqueo
    if (isMobile || isIOS) {
      handleMobilePrint();
    } else {
      // En desktop, usar react-to-print normal
      if (reactToPrintFn) {
        reactToPrintFn();
      } else {
        console.error('reactToPrintFn no está definido');
      }
    }
  };

  const handleMobilePrint = () => {
    if (!componentRef.current) return;
    
    try {
      // Obtener el HTML del componente
      const printContent = componentRef.current.innerHTML;
      
      // Crear una nueva ventana con el contenido
      const printWindow = window.open('', '', 'width=800,height=600');
      
      if (!printWindow) {
        message.error('Por favor permite las ventanas emergentes para imprimir');
        return;
      }

      // Escribir el HTML completo con estilos
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura de Venta #${sale?.id || ''}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              @media print {
                @page {
                  size: letter;
                  margin: 0;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              @media screen {
                body {
                  background-color: #f0f0f0;
                  padding: 20px;
                }
              }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      // Mensaje de ayuda para iOS
      if (isIOS) {
        message.success('✅ Factura abierta. Usa el botón de compartir de Safari para imprimir o guardar como PDF', 4);
      } else {
        message.success('✅ Factura abierta. Usa el menú del navegador para imprimir o guardar', 3);
      }
      
    } catch (error) {
      console.error('Error al abrir factura:', error);
      message.error('Error al abrir la factura para imprimir');
    }
  };

  if (!sale) {
    console.log('Sale es null, no se renderiza el modal');
    return null;
  }

  return (
    <Modal
      title={`Factura de Venta #${sale?.id || ''}`}
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Cerrar
        </Button>,
        <Button
          key="print"
          type="primary"
          onClick={handlePrintClick}
          icon={isMobile ? <ShareAltOutlined /> : <PrinterOutlined />}
        >
          {isMobile ? 'Ver e Imprimir' : 'Imprimir'}
        </Button>,
      ]}
    >
      <div style={{ 
        maxHeight: 'calc(100vh - 200px)', 
        overflowY: 'auto',
        backgroundColor: '#f0f0f0',
        padding: '20px',
        display: 'flex',
        justifyContent: 'center',
      }}
      data-print-content
      >
        <SaleInvoice ref={componentRef} sale={sale} companyConfig={companyConfig} />
      </div>
    </Modal>
  );
};

export default SaleInvoiceModal;
