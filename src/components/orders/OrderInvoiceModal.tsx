import React, { useRef, useState, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { PrinterOutlined, CloseOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useReactToPrint } from 'react-to-print';
import OrderInvoice from './OrderInvoice';
import type { CompanyConfig } from '../../features/company-config/companyConfigSlice';

interface OrderInvoiceModalProps {
  visible: boolean;
  order: any;
  companyConfig: CompanyConfig;
  onClose: () => void;
}

const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({
  visible,
  order,
  companyConfig,
  onClose,
}) => {
  console.log('OrderInvoiceModal renderizado - visible:', visible, 'order:', order);
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
    documentTitle: `Pedido-${order?.orderNumber || 'documento'}`,
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
    `,
  });

  const handlePrintClick = () => {
    console.log('Botón imprimir clickeado');
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
      // Guardar elementos que vamos a ocultar
      const modalMask = document.querySelector('.ant-modal-mask') as HTMLElement;
      const modalWrap = document.querySelector('.ant-modal-wrap') as HTMLElement;
      const layout = document.querySelector('.ant-layout') as HTMLElement;
      const body = document.body;
      
      // Guardar scroll actual
      const scrollY = window.scrollY;
      
      // Preparar para impresión: ocultar todo excepto la factura
      const originalBodyStyle = body.style.cssText;
      body.style.cssText = 'margin: 0; padding: 0;';
      
      if (modalMask) modalMask.style.display = 'none';
      if (modalWrap) modalWrap.style.display = 'none';
      if (layout) layout.style.display = 'none';
      
      // Crear un contenedor temporal para la factura
      const printContainer = document.createElement('div');
      printContainer.id = 'mobile-print-container';
      printContainer.innerHTML = componentRef.current.innerHTML;
      printContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 999999;
        overflow: auto;
        padding: 20px;
      `;
      
      body.appendChild(printContainer);
      
      // Función de limpieza
      let cleanedUp = false;
      const cleanup = () => {
        if (cleanedUp) return;
        cleanedUp = true;
        
        if (printContainer && printContainer.parentNode) {
          printContainer.parentNode.removeChild(printContainer);
        }
        if (modalMask) modalMask.style.display = '';
        if (modalWrap) modalWrap.style.display = '';
        if (layout) layout.style.display = '';
        body.style.cssText = originalBodyStyle;
        window.scrollTo(0, scrollY);
      };
      
      // Esperar un momento para que se renderice
      setTimeout(() => {
        // Invocar la impresión del navegador
        window.print();
        
        // En Safari iOS, el evento afterprint no siempre funciona
        // Usar múltiples estrategias de limpieza
        window.addEventListener('afterprint', cleanup, { once: true });
        
        // Limpieza automática después de 2 segundos (tiempo para que el diálogo de impresión aparezca)
        setTimeout(cleanup, 2000);
        
        // Mensaje de ayuda
        if (isIOS) {
          message.info('📄 Selecciona tu impresora o "Guardar como PDF"', 3);
        }
      }, 300);
      
    } catch (error) {
      console.error('Error al preparar impresión:', error);
      message.error('Error al preparar la impresión');
    }
  };

  if (!order) {
    console.log('Order es null, no se renderiza el modal');
    return null;
  }

  return (
    <Modal
      title={`Pedido ${order?.orderNumber || ''}`}
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
        <OrderInvoice ref={componentRef} order={order} companyConfig={companyConfig} />
      </div>
    </Modal>
  );
};

export default OrderInvoiceModal;
