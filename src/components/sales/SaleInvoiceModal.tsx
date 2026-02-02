import React, { useRef } from 'react';
import { Modal, Button } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
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

  const reactToPrintFn = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Factura-Venta-${sale?.id || 'documento'}`,
  });

  const handlePrintClick = () => {
    console.log('Botón imprimir factura clickeado');
    console.log('componentRef.current:', componentRef.current);
    if (reactToPrintFn) {
      reactToPrintFn();
    } else {
      console.error('reactToPrintFn no está definido');
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
      }}>
        <SaleInvoice ref={componentRef} sale={sale} companyConfig={companyConfig} />
      </div>
    </Modal>
  );
};

export default SaleInvoiceModal;
