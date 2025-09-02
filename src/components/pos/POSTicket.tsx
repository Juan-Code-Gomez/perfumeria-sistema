// src/components/pos/POSTicket.tsx
import { forwardRef } from 'react';
import dayjs from 'dayjs';
import { COMPANY_INFO } from '../../config/companyInfo';

interface POSTicketProps {
  sale: {
    id: number;
    date: string;
    customerName?: string;
    totalAmount: number;
    paidAmount: number;
    paymentMethod: string;
    payments?: Array<{
      method: string;
      amount: number;
      note?: string;
    }>;
    details: Array<{
      product: {
        name: string;
        category?: { name: string };
      };
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  change?: number;
}

const POSTicket = forwardRef<HTMLDivElement, POSTicketProps>(({ sale, change = 0 }, ref) => {
  const ticketWidth = '80mm'; // Ancho estándar de impresoras POS térmicas

  const styles = {
    ticket: {
      width: ticketWidth,
      minHeight: 'auto',
      fontFamily: 'Courier New, monospace',
      fontSize: '12px',
      lineHeight: '1.2',
      color: '#000',
      backgroundColor: '#fff',
      padding: '10px',
      margin: '0 auto',
      boxSizing: 'border-box' as const,
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '15px',
      borderBottom: '1px dashed #000',
      paddingBottom: '10px',
    },
    companyName: {
      fontSize: '16px',
      fontWeight: 'bold',
      marginBottom: '5px',
      textTransform: 'uppercase' as const,
    },
    companyInfo: {
      fontSize: '10px',
      marginBottom: '3px',
    },
    saleInfo: {
      marginBottom: '15px',
      fontSize: '11px',
    },
    itemsHeader: {
      borderTop: '1px dashed #000',
      borderBottom: '1px dashed #000',
      padding: '5px 0',
      marginBottom: '10px',
      fontSize: '11px',
      fontWeight: 'bold',
    },
    item: {
      marginBottom: '8px',
      fontSize: '11px',
    },
    itemName: {
      fontWeight: 'bold',
      marginBottom: '2px',
    },
    itemDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '10px',
    },
    totals: {
      borderTop: '1px dashed #000',
      paddingTop: '10px',
      marginTop: '15px',
    },
    totalLine: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '11px',
    },
    grandTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      fontWeight: 'bold',
      fontSize: '14px',
      borderTop: '1px solid #000',
      paddingTop: '5px',
      marginTop: '10px',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '20px',
      borderTop: '1px dashed #000',
      paddingTop: '10px',
      fontSize: '10px',
    },
    centered: {
      textAlign: 'center' as const,
    },
  };

  const subtotal = sale.details.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <div ref={ref} style={styles.ticket}>
      {/* Header - Información de la empresa */}
      <div style={styles.header}>
        <div style={styles.companyName}>{COMPANY_INFO.name}</div>
        <div style={styles.companyInfo}>{COMPANY_INFO.address}</div>
        <div style={styles.companyInfo}>Tel: {COMPANY_INFO.phone}</div>
        {COMPANY_INFO.email && (
          <div style={styles.companyInfo}>{COMPANY_INFO.email}</div>
        )}
        {COMPANY_INFO.website && (
          <div style={styles.companyInfo}>{COMPANY_INFO.website}</div>
        )}
        {COMPANY_INFO.nit && (
          <div style={styles.companyInfo}>NIT: {COMPANY_INFO.nit}</div>
        )}
      </div>

      {/* Información de la venta */}
      <div style={styles.saleInfo}>
        <div><strong>FACTURA DE VENTA</strong></div>
        <div>No. Venta: {sale.id}</div>
        <div>Fecha: {dayjs(sale.date).format('DD/MM/YYYY HH:mm')}</div>
        <div>Cliente: {sale.customerName || 'Cliente Ocasional'}</div>
        <div>Vendedor: Sistema POS</div>
      </div>

      {/* Header de productos */}
      <div style={styles.itemsHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>PRODUCTO</span>
          <span>TOTAL</span>
        </div>
      </div>

      {/* Lista de productos */}
      {sale.details.map((item, index) => (
        <div key={index} style={styles.item}>
          <div style={styles.itemName}>
            {item.product.name}
            {item.product.category && (
              <span style={{ fontSize: '9px', color: '#666' }}>
                {' '}({item.product.category.name})
              </span>
            )}
          </div>
          <div style={styles.itemDetails}>
            <span>
              {item.quantity} x ${item.unitPrice.toLocaleString('es-CO')}
            </span>
            <span><strong>${item.totalPrice.toLocaleString('es-CO')}</strong></span>
          </div>
        </div>
      ))}

      {/* Totales */}
      <div style={styles.totals}>
        <div style={styles.totalLine}>
          <span>Subtotal:</span>
          <span>${subtotal.toLocaleString('es-CO')}</span>
        </div>
        
        <div style={styles.grandTotal}>
          <span>TOTAL:</span>
          <span>${sale.totalAmount.toLocaleString('es-CO')}</span>
        </div>

        {/* Información de pago */}
        <div style={{ marginTop: '15px', fontSize: '11px' }}>
          {sale.payments && sale.payments.length > 1 ? (
            // Múltiples métodos de pago
            <>
              <div style={{ ...styles.totalLine, fontWeight: 'bold', marginBottom: '8px' }}>
                <span>MÉTODOS DE PAGO:</span>
              </div>
              {sale.payments.map((payment, index) => (
                <div key={index} style={styles.totalLine}>
                  <span>{payment.method}:</span>
                  <span>${payment.amount.toLocaleString('es-CO')}</span>
                </div>
              ))}
              <div style={{ ...styles.totalLine, borderTop: '1px dashed #000', paddingTop: '5px', marginTop: '5px' }}>
                <span>TOTAL PAGADO:</span>
                <span>${sale.paidAmount.toLocaleString('es-CO')}</span>
              </div>
            </>
          ) : (
            // Método de pago único (tradicional)
            <>
              <div style={styles.totalLine}>
                <span>Método de Pago:</span>
                <span>{sale.paymentMethod}</span>
              </div>
              
              {sale.paymentMethod === 'Efectivo' && (
                <>
                  <div style={styles.totalLine}>
                    <span>Recibido:</span>
                    <span>${sale.paidAmount.toLocaleString('es-CO')}</span>
                  </div>
                  {change > 0 && (
                    <div style={styles.totalLine}>
                      <span>Cambio:</span>
                      <span>${change.toLocaleString('es-CO')}</span>
                    </div>
                  )}
                </>
              )}

              {sale.paymentMethod === 'Crédito' && (
                <div style={styles.totalLine}>
                  <span>Estado:</span>
                  <span>PENDIENTE DE PAGO</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={{ marginBottom: '10px' }}>
          <strong>¡GRACIAS POR SU COMPRA!</strong>
        </div>
        <div>
          Conserve este ticket como
        </div>
        <div>
          comprobante de su compra
        </div>
        <div style={{ marginTop: '10px' }}>
          Sistema POS - Milán Fragancias
        </div>
        <div style={{ fontSize: '9px', marginTop: '5px' }}>
          {dayjs().format('DD/MM/YYYY HH:mm:ss')}
        </div>
      </div>
    </div>
  );
});

POSTicket.displayName = 'POSTicket';

export default POSTicket;
