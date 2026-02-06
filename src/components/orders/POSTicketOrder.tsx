// src/components/orders/POSTicketOrder.tsx
import { forwardRef } from 'react';
import dayjs from 'dayjs';

interface CompanyConfig {
  companyName: string;
  nit?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  posReceiptHeader?: string;
  posReceiptFooter?: string;
  showLogo?: boolean;
  showNIT?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  ticketWidth?: string;
  fontSize?: string;
  includeVendor?: boolean;
}

interface POSTicketOrderProps {
  order: {
    id: number;
    orderNumber: string;
    orderDate: string;
    customerName?: string;
    status: string;
    totalAmount: number;
    notes?: string;
    client?: {
      name: string;
      phone?: string;
    };
    createdBy?: {
      name: string;
    };
    details: Array<{
      product: {
        name: string;
        sku?: string;
      };
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }>;
  };
  companyConfig?: CompanyConfig;
}

const POSTicketOrder = forwardRef<HTMLDivElement, POSTicketOrderProps>(({ order, companyConfig }, ref) => {
  // Usar configuración proporcionada o valores por defecto
  const company = companyConfig || {
    companyName: 'Mi Empresa',
    address: 'Dirección de la empresa',
    phone: '+57 300 000 0000',
    email: 'info@empresa.com',
  };

  // Determinar tamaño de ticket y fuente
  const ticketWidth = company.ticketWidth || '80mm';
  const fontSizeBase = company.fontSize === 'small' ? '10px' : 
                       company.fontSize === 'large' ? '14px' : '12px';

  const styles = {
    ticket: {
      width: ticketWidth,
      minHeight: 'auto',
      fontFamily: 'Courier New, monospace',
      fontSize: fontSizeBase,
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
    orderInfo: {
      marginBottom: '15px',
      fontSize: '11px',
    },
    infoRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
    },
    separator: {
      borderTop: '1px dashed #000',
      margin: '10px 0',
    },
    itemsTable: {
      width: '100%',
      marginBottom: '10px',
    },
    itemRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '8px',
      fontSize: '11px',
    },
    itemDetails: {
      flex: 1,
      paddingRight: '10px',
    },
    itemName: {
      fontWeight: 'bold',
      marginBottom: '3px',
    },
    itemPrice: {
      textAlign: 'right' as const,
      minWidth: '70px',
    },
    totals: {
      marginTop: '10px',
      paddingTop: '10px',
      borderTop: '2px solid #000',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '5px',
      fontSize: '12px',
    },
    grandTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '8px',
      paddingTop: '8px',
      borderTop: '1px dashed #000',
      fontSize: '14px',
      fontWeight: 'bold',
    },
    footer: {
      textAlign: 'center' as const,
      marginTop: '15px',
      paddingTop: '10px',
      borderTop: '1px dashed #000',
      fontSize: '10px',
    },
    statusBadge: {
      textAlign: 'center' as const,
      padding: '5px',
      margin: '10px 0',
      fontWeight: 'bold',
      fontSize: '12px',
    },
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'PENDIENTE';
      case 'APPROVED':
        return 'APROBADO';
      case 'CANCELLED':
        return 'CANCELADO';
      default:
        return status;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { ...styles.statusBadge, backgroundColor: '#fff3cd', color: '#856404' };
      case 'APPROVED':
        return { ...styles.statusBadge, backgroundColor: '#d4edda', color: '#155724' };
      case 'CANCELLED':
        return { ...styles.statusBadge, backgroundColor: '#f8d7da', color: '#721c24' };
      default:
        return styles.statusBadge;
    }
  };

  return (
    <div ref={ref} style={styles.ticket}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.companyName}>{company.companyName}</div>
        {company.showNIT !== false && company.nit && (
          <div style={styles.companyInfo}>NIT: {company.nit}</div>
        )}
        {company.showAddress !== false && company.address && (
          <div style={styles.companyInfo}>{company.address}</div>
        )}
        {company.showPhone !== false && company.phone && (
          <div style={styles.companyInfo}>Tel: {company.phone}</div>
        )}
        {company.showEmail !== false && company.email && (
          <div style={styles.companyInfo}>{company.email}</div>
        )}
      </div>

      {/* Título del documento */}
      <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
        PEDIDO DE BODEGA
      </div>

      {/* Estado del pedido */}
      <div style={getStatusStyle(order.status)}>
        {getStatusLabel(order.status)}
      </div>

      {/* Información del pedido */}
      <div style={styles.orderInfo}>
        <div style={styles.infoRow}>
          <span>No. Pedido:</span>
          <strong>{order.orderNumber}</strong>
        </div>
        <div style={styles.infoRow}>
          <span>Fecha:</span>
          <span>{dayjs(order.orderDate).format('DD/MM/YYYY HH:mm')}</span>
        </div>
        <div style={styles.infoRow}>
          <span>Cliente:</span>
          <span>{order.customerName || order.client?.name || 'Sin cliente'}</span>
        </div>
        {order.client?.phone && (
          <div style={styles.infoRow}>
            <span>Teléfono:</span>
            <span>{order.client.phone}</span>
          </div>
        )}
        {company.includeVendor !== false && order.createdBy && (
          <div style={styles.infoRow}>
            <span>Creado por:</span>
            <span>{order.createdBy.name}</span>
          </div>
        )}
      </div>

      <div style={styles.separator}></div>

      {/* Detalles de productos */}
      <div style={styles.itemsTable}>
        {order.details.map((item, index) => (
          <div key={index} style={styles.itemRow}>
            <div style={styles.itemDetails}>
              <div style={styles.itemName}>{item.product.name}</div>
              {item.product.sku && (
                <div style={{ fontSize: '9px', color: '#666' }}>SKU: {item.product.sku}</div>
              )}
              <div style={{ fontSize: '10px' }}>
                {item.quantity} x ${item.unitPrice.toLocaleString('es-CO')}
              </div>
            </div>
            <div style={styles.itemPrice}>
              <strong>${item.totalPrice.toLocaleString('es-CO')}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Totales */}
      <div style={styles.totals}>
        <div style={styles.grandTotal}>
          <span>TOTAL:</span>
          <span>${order.totalAmount.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Observaciones */}
      {order.notes && (
        <>
          <div style={styles.separator}></div>
          <div style={{ fontSize: '10px', marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Observaciones:</div>
            <div>{order.notes}</div>
          </div>
        </>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {company.posReceiptFooter ? (
          <div>{company.posReceiptFooter}</div>
        ) : (
          <div>Gracias por su preferencia</div>
        )}
        <div style={{ marginTop: '5px', fontSize: '9px' }}>
          Impreso: {dayjs().format('DD/MM/YYYY HH:mm')}
        </div>
      </div>
    </div>
  );
});

POSTicketOrder.displayName = 'POSTicketOrder';

export default POSTicketOrder;
