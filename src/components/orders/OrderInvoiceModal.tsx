import React from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import OrderInvoice from './OrderInvoice';
import { useInvoicePrint } from '../../hooks/useInvoicePrint';
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
  
  const { printRef, printInvoice } = useInvoicePrint({
    onAfterPrint: () => {
      // Opcional: cerrar el modal después de imprimir
      // onClose();
    }
  });

  if (!order) {
    console.log('Order es null, no se renderiza el modal');
    return null;
  }

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <span>Pedido #{order?.orderNumber || ''}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20 }}
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
          padding: '16px',
          maxHeight: '70vh',
          overflowY: 'auto',
          backgroundColor: '#f0f0f0'
        }
      }}
    >
      <div ref={printRef} data-print-content style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#f0f0f0'
      }}>
        <OrderInvoice order={order} companyConfig={companyConfig} />
      </div>
      
      <div className="no-print" style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          padding: '8px',
          background: '#fff7e6',
          borderRadius: '6px',
          border: '1px solid #ffd591'
        }}>
          💡 Para guardar como PDF: haz clic en "Imprimir" y luego selecciona "Guardar como PDF" en las opciones
        </div>
      </div>
    </Modal>
  );
};

export default OrderInvoiceModal;
