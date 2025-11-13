import React, { useState } from 'react';
import {
  Modal,
  Descriptions,
  Button,
  Space,
  Divider,
  Tag,
  message,
} from 'antd';
import {
  FilePdfOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

interface CashClosingDetailViewModalProps {
  visible: boolean;
  onClose: () => void;
  closing: any; // El registro de cierre de caja
}

const CashClosingDetailViewModal: React.FC<CashClosingDetailViewModalProps> = ({
  visible,
  onClose,
  closing,
}) => {
  const [generating, setGenerating] = useState(false);

  const handleGeneratePDF = async () => {
    try {
      setGenerating(true);
      
      const date = dayjs(closing.date).format('YYYY-MM-DD');
      
      // Usar axios para descargar el PDF
      const response = await api.get(`/cash-closing/report/pdf/${date}`, {
        responseType: 'blob',
      });
      
      // Crear un blob desde la respuesta
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cierre-caja-detallado-${date}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      message.error('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setGenerating(false);
    }
  };

  if (!closing) {
    return null;
  }

  const getDifferenceStatus = () => {
    const diff = closing.difference || 0;
    const abs = Math.abs(diff);
    
    if (abs === 0) {
      return { 
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />, 
        text: 'Caja Cuadrada', 
        color: 'success' 
      };
    }
    if (abs <= 5000) {
      return { 
        icon: <InfoCircleOutlined style={{ color: '#faad14' }} />, 
        text: 'Diferencia Menor', 
        color: 'warning' 
      };
    }
    return { 
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />, 
      text: 'Diferencia Significativa', 
      color: 'error' 
    };
  };

  const diffStatus = getDifferenceStatus();

  return (
    <Modal
      title={
        <Space>
          <CalendarOutlined />
          <span>Detalle del Cierre de Caja - {dayjs(closing.date).format('DD/MM/YYYY')}</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="close" onClick={onClose}>
          Cerrar
        </Button>,
        <Button
          key="pdf"
          type="primary"
          icon={<FilePdfOutlined />}
          loading={generating}
          onClick={handleGeneratePDF}
        >
          Descargar PDF Detallado
        </Button>,
      ]}
    >
      <div>
        {/* Estado de la diferencia */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Tag color={diffStatus.color} style={{ fontSize: '16px', padding: '8px 16px' }}>
            {diffStatus.icon} {diffStatus.text}
          </Tag>
        </div>

        <Divider orientation="left">💰 Información del Cierre</Divider>
        
        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="📅 Fecha">
            {dayjs(closing.date).format('DD/MM/YYYY')}
          </Descriptions.Item>
          
          <Descriptions.Item label="👤 Registrado por">
            {closing.createdBy?.name || 'Sistema'}
          </Descriptions.Item>

          <Descriptions.Item label="💵 Saldo Inicial">
            <strong>${(closing.openingCash || 0).toLocaleString()}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="💰 Saldo Final Contado">
            <strong>${(closing.closingCash || 0).toLocaleString()}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="🖥️ Saldo Sistema">
            <strong>${(closing.systemCash || 0).toLocaleString()}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="⚖️ Diferencia">
            <Tag color={closing.difference === 0 ? 'success' : closing.difference > 0 ? 'warning' : 'error'}>
              <strong>
                {closing.difference === 0
                  ? 'Cuadrada'
                  : closing.difference > 0
                  ? `+$${Math.abs(closing.difference).toLocaleString()}`
                  : `-$${Math.abs(closing.difference).toLocaleString()}`}
              </strong>
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">📊 Resumen de Ventas</Divider>

        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="💰 Total Ventas">
            <strong style={{ color: '#52c41a' }}>${(closing.totalSales || 0).toLocaleString()}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="💵 Ventas Efectivo">
            ${(closing.cashSales || 0).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="💳 Ventas Tarjeta">
            ${(closing.cardSales || 0).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="📱 Ventas Transferencia">
            ${(closing.transferSales || 0).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="📝 Ventas Crédito">
            ${(closing.creditSales || 0).toLocaleString()}
          </Descriptions.Item>

          <Descriptions.Item label="🎁 Otros Ingresos">
            ${(closing.totalIncome || 0).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">💸 Gastos y Pagos</Divider>

        <Descriptions bordered column={2} size="middle">
          <Descriptions.Item label="💸 Total Gastos">
            <strong style={{ color: '#ff4d4f' }}>${(closing.totalExpense || 0).toLocaleString()}</strong>
          </Descriptions.Item>

          <Descriptions.Item label="🏪 Pagos Proveedores">
            ${(closing.totalPayments || 0).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>

        {closing.notes && (
          <>
            <Divider orientation="left">📝 Observaciones</Divider>
            <p style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              {closing.notes}
            </p>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CashClosingDetailViewModal;
