// src/components/sales/POSTicketSale.tsx
import React from 'react';
import dayjs from 'dayjs';
import { COMPANY_INFO } from '../../config/companyInfo';

interface POSTicketSaleProps {
  sale: any;
}

const POSTicketSale: React.FC<POSTicketSaleProps> = ({ sale }) => {
  if (!sale) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div 
      className="ticket-container"
      style={{
        width: '80mm',
        maxWidth: '80mm',
        margin: '0 auto',
        padding: '8px',
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        lineHeight: '1.2',
        color: '#000',
        background: '#fff'
      }}
    >
      {/* Header con logo y info de empresa */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 'bold', 
          marginBottom: '4px',
          letterSpacing: '1px'
        }}>
          MILAN FRAGANCIAS
        </div>
        <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
          {COMPANY_INFO.address}<br />
          {COMPANY_INFO.phone}<br />
          {COMPANY_INFO.email}<br />
          {COMPANY_INFO.website}
        </div>
      </div>

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px dashed #000', 
        margin: '8px 0',
        width: '100%'
      }} />

      {/* Información de la venta */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ textAlign: 'center', fontWeight: 'bold' }}>
          FACTURA DE VENTA
        </div>
        <div style={{ fontSize: '11px', marginTop: '4px' }}>
          <div>No. Venta: {sale.id}</div>
          <div>Fecha: {dayjs(sale.date).format('DD/MM/YYYY HH:mm')}</div>
          <div>Cliente: {sale.customerName || 'Cliente Ocasional'}</div>
          <div>Vendedor: Sistema POS</div>
        </div>
      </div>

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px dashed #000', 
        margin: '8px 0'
      }} />

      {/* Header de productos */}
      <div style={{ 
        fontSize: '11px',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: '1px solid #000',
        paddingBottom: '2px',
        marginBottom: '4px'
      }}>
        <span style={{ width: '45%' }}>PRODUCTO</span>
        <span style={{ width: '15%', textAlign: 'center' }}>CANT</span>
        <span style={{ width: '20%', textAlign: 'right' }}>PRECIO</span>
        <span style={{ width: '20%', textAlign: 'right' }}>TOTAL</span>
      </div>

      {/* Productos */}
      <div style={{ marginBottom: '8px' }}>
        {sale.details?.map((item: any, index: number) => (
          <div key={index}>
            {/* Nombre del producto */}
            <div style={{ 
              fontSize: '10px',
              fontWeight: 'bold',
              marginBottom: '2px',
              wordWrap: 'break-word'
            }}>
              {item.product?.name || 'Producto'}
            </div>
            {/* Detalles del producto */}
            <div style={{ 
              fontSize: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ width: '45%' }}>
                {item.product?.category?.name && (
                  <span style={{ color: '#666' }}>({item.product.category.name})</span>
                )}
              </span>
              <span style={{ width: '15%', textAlign: 'center' }}>
                {item.quantity}
              </span>
              <span style={{ width: '20%', textAlign: 'right' }}>
                {formatCurrency(item.unitPrice)}
              </span>
              <span style={{ width: '20%', textAlign: 'right', fontWeight: 'bold' }}>
                {formatCurrency(item.totalPrice)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px dashed #000', 
        margin: '8px 0'
      }} />

      {/* Subtotal y total */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '2px'
        }}>
          <span>Subtotal:</span>
          <span>{formatCurrency(sale.totalAmount)}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: 'bold',
          borderTop: '1px solid #000',
          paddingTop: '4px'
        }}>
          <span>TOTAL:</span>
          <span>{formatCurrency(sale.totalAmount)}</span>
        </div>
      </div>

      {/* Información de pago */}
      <div style={{ fontSize: '11px', marginBottom: '8px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          marginBottom: '2px'
        }}>
          <span>Método de Pago:</span>
          <span style={{ fontWeight: 'bold' }}>{sale.paymentMethod}</span>
        </div>
        {sale.paymentMethod === 'Efectivo' && sale.cashReceived && (
          <>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between'
            }}>
              <span>Recibido:</span>
              <span>{formatCurrency(sale.cashReceived)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontWeight: 'bold'
            }}>
              <span>Cambio:</span>
              <span>{formatCurrency(sale.cashReceived - sale.totalAmount)}</span>
            </div>
          </>
        )}
      </div>

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px dashed #000', 
        margin: '8px 0'
      }} />

      {/* Mensaje de agradecimiento */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '10px',
        marginBottom: '8px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          ¡GRACIAS POR SU COMPRA!
        </div>
        <div style={{ lineHeight: '1.3' }}>
          Conserve este ticket como<br />
          comprobante de su compra
        </div>
      </div>

      {/* Footer con información adicional */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '9px',
        color: '#666',
        marginTop: '8px'
      }}>
        <div>Sistema POS - Milán Fragancias</div>
        <div>{dayjs().format('DD/MM/YYYY HH:mm:ss')}</div>
      </div>
    </div>
  );
};

export default POSTicketSale;
