import React, { useRef } from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
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
    console.log('componentRef.current:', componentRef.current);
    console.log('reactToPrintFn:', reactToPrintFn);
    if (reactToPrintFn) {
      reactToPrintFn();
    } else {
      console.error('reactToPrintFn no está definido');
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
          icon={<PrinterOutlined />}
        >
          Imprimir
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
