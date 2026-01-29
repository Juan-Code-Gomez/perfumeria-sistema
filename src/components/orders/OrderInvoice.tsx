import React from 'react';
import type { CompanyConfig } from '../../features/company-config/companyConfigSlice';
import dayjs from 'dayjs';

interface OrderInvoiceProps {
  order: any;
  companyConfig: CompanyConfig;
}

const OrderInvoice = React.forwardRef<HTMLDivElement, OrderInvoiceProps>(
  ({ order, companyConfig }, ref) => {
    const styles = {
      page: {
        width: '21cm',
        minHeight: '27.9cm',
        padding: '2cm',
        margin: '0 auto',
        background: '#fff',
        boxSizing: 'border-box' as const,
        fontFamily: 'Arial, sans-serif',
        fontSize: '11pt',
        color: '#000',
      },
      header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #333',
      },
      logoSection: {
        flex: '0 0 200px',
      },
      logo: {
        maxWidth: '180px',
        maxHeight: '80px',
        objectFit: 'contain' as const,
      },
      companyInfo: {
        flex: '1',
        textAlign: 'right' as const,
        paddingLeft: '20px',
      },
      companyName: {
        fontSize: '18pt',
        fontWeight: 'bold',
        marginBottom: '8px',
        textTransform: 'uppercase' as const,
      },
      companyDetail: {
        fontSize: '10pt',
        marginBottom: '4px',
        color: '#333',
      },
      invoiceTitle: {
        textAlign: 'center' as const,
        fontSize: '20pt',
        fontWeight: 'bold',
        marginBottom: '25px',
        color: '#333',
        textTransform: 'uppercase' as const,
      },
      infoSection: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        marginBottom: '30px',
      },
      infoBox: {
        border: '1px solid #ddd',
        padding: '15px',
        borderRadius: '4px',
        backgroundColor: '#f9f9f9',
      },
      infoTitle: {
        fontSize: '11pt',
        fontWeight: 'bold',
        marginBottom: '10px',
        color: '#333',
        borderBottom: '1px solid #ccc',
        paddingBottom: '5px',
      },
      infoRow: {
        display: 'flex',
        marginBottom: '6px',
        fontSize: '10pt',
      },
      infoLabel: {
        fontWeight: 'bold',
        width: '120px',
        color: '#555',
      },
      infoValue: {
        flex: '1',
        color: '#000',
      },
      table: {
        width: '100%',
        borderCollapse: 'collapse' as const,
        marginBottom: '20px',
      },
      tableHeader: {
        backgroundColor: '#333',
        color: '#fff',
      },
      th: {
        padding: '12px 8px',
        textAlign: 'left' as const,
        fontWeight: 'bold',
        fontSize: '10pt',
        borderBottom: '2px solid #333',
      },
      thRight: {
        padding: '12px 8px',
        textAlign: 'right' as const,
        fontWeight: 'bold',
        fontSize: '10pt',
        borderBottom: '2px solid #333',
      },
      thCenter: {
        padding: '12px 8px',
        textAlign: 'center' as const,
        fontWeight: 'bold',
        fontSize: '10pt',
        borderBottom: '2px solid #333',
      },
      td: {
        padding: '10px 8px',
        borderBottom: '1px solid #ddd',
        fontSize: '10pt',
      },
      tdRight: {
        padding: '10px 8px',
        borderBottom: '1px solid #ddd',
        textAlign: 'right' as const,
        fontSize: '10pt',
      },
      tdCenter: {
        padding: '10px 8px',
        borderBottom: '1px solid #ddd',
        textAlign: 'center' as const,
        fontSize: '10pt',
      },
      totalsSection: {
        marginTop: '30px',
        display: 'flex',
        justifyContent: 'flex-end',
      },
      totalsBox: {
        width: '350px',
        border: '2px solid #333',
        padding: '15px',
        backgroundColor: '#f9f9f9',
      },
      totalRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        fontSize: '11pt',
      },
      totalLabel: {
        fontWeight: 'bold',
        color: '#555',
      },
      totalValue: {
        textAlign: 'right' as const,
        minWidth: '120px',
        color: '#000',
      },
      grandTotal: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 0',
        fontSize: '14pt',
        fontWeight: 'bold',
        borderTop: '2px solid #333',
        marginTop: '10px',
        color: '#000',
      },
      footer: {
        marginTop: '50px',
        paddingTop: '20px',
        borderTop: '1px solid #ccc',
        textAlign: 'center' as const,
        fontSize: '9pt',
        color: '#666',
      },
      statusBadge: {
        display: 'inline-block',
        padding: '6px 12px',
        borderRadius: '4px',
        fontSize: '10pt',
        fontWeight: 'bold',
        textTransform: 'uppercase' as const,
      },
      statusPending: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7',
      },
      statusApproved: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
      },
      statusCancelled: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
      },
    };

    const formatCurrency = (value: number) => {
      return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
    };

    const getStatusStyle = (status: string) => {
      switch (status) {
        case 'PENDING':
          return { ...styles.statusBadge, ...styles.statusPending };
        case 'APPROVED':
          return { ...styles.statusBadge, ...styles.statusApproved };
        case 'CANCELLED':
          return { ...styles.statusBadge, ...styles.statusCancelled };
        default:
          return styles.statusBadge;
      }
    };

    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'PENDING':
          return 'Pendiente';
        case 'APPROVED':
          return 'Aprobado';
        case 'CANCELLED':
          return 'Cancelado';
        default:
          return status;
      }
    };

    const subtotal = order.totalAmount || 0;

    return (
      <div ref={ref} style={styles.page}>
        {/* Header */}
        <div style={styles.header}>
          {/* Logo */}
          {companyConfig.showLogo !== false && companyConfig.logo && (
            <div style={styles.logoSection}>
              <img 
                src={companyConfig.logo} 
                alt={companyConfig.companyName}
                style={styles.logo}
              />
            </div>
          )}

          {/* Company Info */}
          <div style={styles.companyInfo}>
            <div style={styles.companyName}>{companyConfig.companyName}</div>
            {companyConfig.showNIT !== false && companyConfig.nit && (
              <div style={styles.companyDetail}>NIT: {companyConfig.nit}</div>
            )}
            {companyConfig.showAddress !== false && companyConfig.address && (
              <div style={styles.companyDetail}>{companyConfig.address}</div>
            )}
            {companyConfig.showPhone !== false && companyConfig.phone && (
              <div style={styles.companyDetail}>Tel: {companyConfig.phone}</div>
            )}
            {companyConfig.showEmail !== false && companyConfig.email && (
              <div style={styles.companyDetail}>{companyConfig.email}</div>
            )}
            {companyConfig.showWebsite !== false && companyConfig.website && (
              <div style={styles.companyDetail}>{companyConfig.website}</div>
            )}
          </div>
        </div>

        {/* Invoice Title */}
        <div style={styles.invoiceTitle}>Pedido</div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Order Info */}
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Información del Pedido</div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>No. Pedido:</span>
              <span style={styles.infoValue}>{order.orderNumber}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Fecha:</span>
              <span style={styles.infoValue}>
                {dayjs(order.orderDate || order.createdAt).format('DD/MM/YYYY HH:mm')}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Estado:</span>
              <span style={styles.infoValue}>
                <span style={getStatusStyle(order.status)}>
                  {getStatusLabel(order.status)}
                </span>
              </span>
            </div>
          </div>

          {/* Customer Info */}
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Información del Cliente</div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Cliente:</span>
              <span style={styles.infoValue}>
                {order.customerName || order.client?.name || 'Cliente Ocasional'}
              </span>
            </div>
            {order.client?.nit && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>NIT:</span>
                <span style={styles.infoValue}>{order.client.nit}</span>
              </div>
            )}
            {order.client?.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Teléfono:</span>
                <span style={styles.infoValue}>{order.client.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Products Table */}
        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={{ ...styles.th, width: '50px' }}>Item</th>
              <th style={styles.th}>Producto</th>
              <th style={{ ...styles.thCenter, width: '80px' }}>Cantidad</th>
              <th style={{ ...styles.thRight, width: '120px' }}>Precio Unit.</th>
              <th style={{ ...styles.thRight, width: '120px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.details?.map((detail: any, index: number) => (
              <tr key={detail.id || index}>
                <td style={styles.tdCenter}>{index + 1}</td>
                <td style={styles.td}>
                  <strong>{detail.product?.name || 'Producto'}</strong>
                  {detail.product?.sku && (
                    <div style={{ fontSize: '9pt', color: '#666', marginTop: '2px' }}>
                      SKU: {detail.product.sku}
                    </div>
                  )}
                </td>
                <td style={styles.tdCenter}>{detail.quantity}</td>
                <td style={styles.tdRight}>{formatCurrency(detail.unitPrice)}</td>
                <td style={styles.tdRight}>
                  <strong>{formatCurrency(detail.totalPrice)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={styles.totalsSection}>
          <div style={styles.totalsBox}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Subtotal:</span>
              <span style={styles.totalValue}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={styles.grandTotal}>
              <span>TOTAL:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {order.notes && (
          <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '10pt' }}>Observaciones:</div>
            <div style={{ fontSize: '10pt', color: '#333' }}>{order.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p>Gracias por su preferencia</p>
          <p style={{ fontSize: '8pt', marginTop: '5px' }}>
            Este documento es un pedido y no constituye una factura de venta
          </p>
        </div>
      </div>
    );
  }
);

OrderInvoice.displayName = 'OrderInvoice';

export default OrderInvoice;
