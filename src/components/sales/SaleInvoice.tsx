import React from 'react';
import type { CompanyConfig } from '../../features/company-config/companyConfigSlice';
import dayjs from 'dayjs';

interface SaleInvoiceProps {
  sale: any;
  companyConfig: CompanyConfig;
}

const SaleInvoice = React.forwardRef<HTMLDivElement, SaleInvoiceProps>(
  ({ sale, companyConfig }, ref) => {
    // Debug: verificar datos de la venta
    console.log('SaleInvoice - sale completa:', sale);
    console.log('SaleInvoice - sale.notes:', sale.notes);
    
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
      statusPaid: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
      },
      statusPending: {
        backgroundColor: '#fff3cd',
        color: '#856404',
        border: '1px solid #ffeaa7',
      },
      statusPartial: {
        backgroundColor: '#d1ecf1',
        color: '#0c5460',
        border: '1px solid #bee5eb',
      },
    };

    const formatCurrency = (value: number) => {
      return `$${value.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`;
    };

    const getPaymentStatusStyle = () => {
      const isPaid = sale.isPaid || sale.paymentStatus === 'PAGADO';
      const paidAmount = sale.paidAmount || sale.amountPaid || 0;
      const totalAmount = sale.totalAmount || 0;
      
      if (isPaid || paidAmount >= totalAmount) {
        return { ...styles.statusBadge, ...styles.statusPaid, label: 'Pagado' };
      } else if (paidAmount > 0) {
        return { ...styles.statusBadge, ...styles.statusPartial, label: 'Abonado' };
      } else {
        return { ...styles.statusBadge, ...styles.statusPending, label: 'Pendiente' };
      }
    };

    const statusStyle = getPaymentStatusStyle();

    // Calculate totals
    const calculateSubtotal = () => {
      return sale.details?.reduce((sum: number, detail: any) => 
        sum + (detail.quantity * detail.unitPrice), 0) || 0;
    };

    const calculateDiscount = () => {
      return sale.discountAmount || 0;
    };

    const paidAmount = sale.paidAmount || sale.amountPaid || 0;
    const balance = sale.totalAmount - paidAmount;

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
        <div style={styles.invoiceTitle}>Factura de Venta</div>

        {/* Info Section */}
        <div style={styles.infoSection}>
          {/* Sale Info */}
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Información de la Venta</div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>No. Venta:</span>
              <span style={styles.infoValue}>#{sale.id}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Fecha:</span>
              <span style={styles.infoValue}>
                {dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Estado:</span>
              <span style={styles.infoValue}>
                <span style={statusStyle}>
                  {statusStyle.label}
                </span>
              </span>
            </div>
            {sale.user && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Atendido por:</span>
                <span style={styles.infoValue}>{sale.user.name}</span>
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div style={styles.infoBox}>
            <div style={styles.infoTitle}>Información del Cliente</div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Cliente:</span>
              <span style={styles.infoValue}>
                {sale.client?.name || 'Cliente Ocasional'}
              </span>
            </div>
            {sale.client?.nit && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>NIT:</span>
                <span style={styles.infoValue}>{sale.client.nit}</span>
              </div>
            )}
            {sale.client?.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Teléfono:</span>
                <span style={styles.infoValue}>{sale.client.phone}</span>
              </div>
            )}
            {sale.client?.address && (
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Dirección:</span>
                <span style={styles.infoValue}>{sale.client.address}</span>
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
            {sale.details?.map((detail: any, index: number) => (
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
                  <strong>{formatCurrency(detail.quantity * detail.unitPrice)}</strong>
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
              <span style={styles.totalValue}>{formatCurrency(calculateSubtotal())}</span>
            </div>
            {calculateDiscount() > 0 && (
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Descuento:</span>
                <span style={styles.totalValue}>-{formatCurrency(calculateDiscount())}</span>
              </div>
            )}
            <div style={styles.grandTotal}>
              <span>TOTAL:</span>
              <span>{formatCurrency(sale.totalAmount)}</span>
            </div>
            {paidAmount > 0 && (
              <div style={{ ...styles.totalRow, marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ccc' }}>
                <span style={styles.totalLabel}>Pagado:</span>
                <span style={styles.totalValue}>{formatCurrency(paidAmount)}</span>
              </div>
            )}
            {balance > 0 && paidAmount > 0 && (
              <div style={styles.totalRow}>
                <span style={{ ...styles.totalLabel, color: '#dc3545' }}>Saldo Pendiente:</span>
                <span style={{ ...styles.totalValue, color: '#dc3545', fontWeight: 'bold' }}>
                  {formatCurrency(balance)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        {sale.paymentMethod && (
          <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '10pt', color: '#555' }}>Método de Pago: </span>
            <span style={{ fontSize: '10pt' }}>{sale.paymentMethod}</span>
          </div>
        )}

        {/* Notes */}
        {sale.notes && sale.notes.trim() !== '' && (
          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fffbe6', border: '1px solid #ffe58f', borderRadius: '4px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '10pt', color: '#d48806' }}>📝 Observaciones:</div>
            <div style={{ fontSize: '10pt', color: '#333' }}>{sale.notes}</div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={{ fontWeight: 'bold', fontSize: '10pt', marginBottom: '8px' }}>
            {companyConfig.invoiceFooter || 'Gracias por su preferencia'}
          </p>
          <p style={{ fontSize: '8pt', marginTop: '5px' }}>
            Este documento es una factura de venta
          </p>
          <p style={{ fontSize: '8pt', color: '#999', marginTop: '10px' }}>
            Documento generado el {dayjs().format('DD/MM/YYYY HH:mm')}
          </p>
        </div>
      </div>
    );
  }
);

SaleInvoice.displayName = 'SaleInvoice';

export default SaleInvoice;
