import React from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import SaleInvoice from './SaleInvoice';
import { useInvoicePrint } from '../../hooks/useInvoicePrint';
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
  const { printRef, printInvoice } = useInvoicePrint({
    onAfterPrint: () => {
      // Opcional: cerrar el modal después de imprimir
      // onClose();
    }
  });

  if (!sale) {
    console.log('Sale es null, no se renderiza el modal');
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <span>Factura de Venta #{sale?.id || ''}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20, maxWidth: '900px' }}
      centered
      footer={[
        <Button key="close" onClick={onClose} icon={<CloseOutlined />}>
          Cerrar
        </Button>,
        <Button
          key="print"
          type="primary"
          onClick={printInvoice}
          icon={<PrinterOutlined />}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Imprimir
        </Button>,
      ]}
      styles={{
        body: {
          padding: '8px',
          maxHeight: '75vh',
          overflowY: 'auto',
          backgroundColor: '#f5f5f5'
        }
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '8px',
        backgroundColor: '#f5f5f5'
      }}>
        <div ref={printRef} style={{ width: '100%', maxWidth: '21cm', background: 'white' }}>
          <SaleInvoice sale={sale} companyConfig={companyConfig} />
        </div>
      </div>
      
      <div className="no-print" style={{ marginTop: 10, textAlign: 'center' }}>
        <div style={{ 
          fontSize: '11px', 
          color: '#666',
          padding: '6px',
          background: '#e6f7ff',
          borderRadius: '4px',
          border: '1px solid #91d5ff'
        }}>
          📱 <strong>Móvil:</strong> Haz clic en "Imprimir" → Selecciona "Guardar como PDF"
        </div>
      </div>
    </Modal>
  );
};

export default SaleInvoiceModal;
