// src/components/orders/POSTicketOrderModal.tsx
import React, { useEffect } from 'react';
import { Modal, Button, Space } from 'antd';
import { PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import POSTicketOrder from './POSTicketOrder';
import { usePOSTicketPrint } from '../../hooks/usePOSTicketPrint';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchCompanyConfig } from '../../features/company-config/companyConfigSlice';

interface POSTicketOrderModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const POSTicketOrderModal: React.FC<POSTicketOrderModalProps> = ({ open, onClose, order }) => {
  const dispatch = useAppDispatch();
  const { config } = useAppSelector((state) => state.companyConfig);
  
  const { printRef, printTicket } = usePOSTicketPrint({
    onAfterPrint: () => {
      onClose();
    }
  });

  // Cargar configuración al montar el componente
  useEffect(() => {
    if (open && !config) {
      dispatch(fetchCompanyConfig());
    }
  }, [open, config, dispatch]);

  if (!order) return null;

  return (
    <Modal
      title={
        <Space>
          <PrinterOutlined />
          <span>Imprimir Ticket POS - Pedido {order.orderNumber}</span>
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
      <div ref={printRef} data-print-content>
        <POSTicketOrder 
          order={order} 
          companyConfig={config || undefined}
        />
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

export default POSTicketOrderModal;
