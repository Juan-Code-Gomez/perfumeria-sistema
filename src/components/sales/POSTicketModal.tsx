// src/components/sales/POSTicketModal.tsx
import React from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import POSTicketSale from './POSTicketSale';
import { usePOSTicketPrint } from '../../hooks/usePOSTicketPrint';

interface POSTicketModalProps {
  open: boolean;
  onClose: () => void;
  sale: any;
}

const POSTicketModal: React.FC<POSTicketModalProps> = ({ open, onClose, sale }) => {
  const { printRef, printTicket } = usePOSTicketPrint({
    onAfterPrint: () => {
      onClose();
    }
  });

  if (!sale) return null;

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <span>Imprimir Ticket POS - Venta #{sale.id}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={400}
      centered
      footer={[
        <Button key="cancel" icon={<CloseOutlined />} onClick={onClose}>
          Cerrar
        </Button>,
        <Button 
          key="print" 
          type="primary" 
          icon={<PrinterOutlined />} 
          onClick={printTicket}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          Imprimir Ticket
        </Button>,
      ]}
      styles={{
        body: {
          padding: '16px',
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      <div ref={printRef}>
        <POSTicketSale sale={sale} />
      </div>
      
      <div className="no-print" style={{ marginTop: 16, textAlign: 'center' }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#666',
          padding: '8px',
          background: '#f8f9fa',
          borderRadius: '6px'
        }}>
          💡 Este ticket está optimizado para impresoras térmicas de 80mm
        </div>
      </div>
    </Modal>
  );
};

export default POSTicketModal;
