// src/pages/print/SalePrintPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import { PrinterOutlined, ArrowLeftOutlined, ShareAltOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { getSaleById } from '../../services/salesService';
import { fetchCompanyConfig } from '../../features/company-config/companyConfigSlice';
import SaleInvoice from '../../components/sales/SaleInvoice';

const SalePrintPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [loading, setLoading] = useState(true);
  const [sale, setSale] = useState<any>(null);
  const { config: companyConfig } = useAppSelector((state) => state.companyConfig);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!id) {
          message.error('ID de venta no válido');
          navigate('/sales');
          return;
        }

        // Cargar configuración de la compañía
        if (!companyConfig) {
          await dispatch(fetchCompanyConfig()).unwrap();
        }

        // Cargar la venta
        const saleData = await getSaleById(Number(id));
        setSale(saleData);
      } catch (error) {
        console.error('Error cargando datos:', error);
        message.error('Error al cargar la factura');
        navigate('/sales');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, dispatch, navigate, companyConfig]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Factura de Venta #${sale?.id}`,
          text: `Factura de venta - Cliente: ${sale?.customerName || 'N/A'} - Total: $${sale?.totalAmount?.toLocaleString()}`,
          url: window.location.href,
        });
        message.success('Compartido exitosamente');
      } catch (error) {
        console.log('Error al compartir:', error);
      }
    }
  };

  const handleBack = () => {
    navigate('/sales');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f0f0'
      }}>
        <Spin size="large" tip="Cargando factura..." />
      </div>
    );
  }

  if (!sale || !companyConfig) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#f0f0f0',
        gap: '16px'
      }}>
        <div>No se pudo cargar la factura</div>
        <Button onClick={handleBack}>Volver</Button>
      </div>
    );
  }

  return (
    <>
      {/* Barra de acciones - solo visible en pantalla, no en impresión */}
      <div className="no-print" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={handleBack}
        >
          Volver
        </Button>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {'share' in navigator && (
            <Button 
              icon={<ShareAltOutlined />} 
              onClick={handleShare}
            >
              Compartir
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<PrinterOutlined />} 
            onClick={handlePrint}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
          >
            Imprimir / Guardar PDF
          </Button>
        </div>
      </div>

      {/* Contenido de la factura */}
      <div 
        data-print-content
        style={{
          marginTop: '60px',
          padding: '20px',
          background: '#f0f0f0',
          minHeight: 'calc(100vh - 60px)',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <SaleInvoice sale={sale} companyConfig={companyConfig} />
      </div>

      {/* Tip para el usuario */}
      <div className="no-print" style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#fffbe6',
        border: '1px solid #ffe58f',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        maxWidth: '90%',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        💡 <strong>Tip:</strong> Para guardar como PDF, presiona "Imprimir" y selecciona "Guardar como PDF" en las opciones
      </div>
    </>
  );
};

export default SalePrintPage;
