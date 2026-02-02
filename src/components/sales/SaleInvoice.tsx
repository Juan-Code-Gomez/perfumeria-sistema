import React from 'react';
import type { CompanyConfig } from '../../features/company-config/companyConfigSlice';
import dayjs from 'dayjs';
import './SaleInvoice.css';

interface SaleInvoiceProps {
  sale: any;
  companyConfig: CompanyConfig;
}

const SaleInvoice = React.forwardRef<HTMLDivElement, SaleInvoiceProps>(
  ({ sale, companyConfig }, ref) => {
    const calculateSubtotal = () => {
      return sale.details?.reduce((sum: number, detail: any) => 
        sum + (detail.quantity * detail.unitPrice), 0) || 0;
    };

    const calculateDiscount = () => {
      return sale.discountAmount || 0;
    };

    const calculateTax = () => {
      const subtotal = calculateSubtotal();
      const discount = calculateDiscount();
      const taxRate = companyConfig.taxRate || 0;
      return ((subtotal - discount) * taxRate) / 100;
    };

    const getPaymentStatus = () => {
      if (sale.paymentStatus === 'PAGADO') {
        return { text: 'PAGADO', color: '#52c41a', bgColor: '#f6ffed' };
      } else if (sale.paymentStatus === 'PENDIENTE') {
        return { text: 'PENDIENTE', color: '#faad14', bgColor: '#fffbe6' };
      } else if (sale.paymentStatus === 'PARCIAL') {
        return { text: 'ABONADO', color: '#1890ff', bgColor: '#e6f7ff' };
      }
      return { text: 'DESCONOCIDO', color: '#d9d9d9', bgColor: '#fafafa' };
    };

    const status = getPaymentStatus();

    return (
      <div ref={ref} className="sale-invoice">
        {/* Header */}
        <div className="invoice-header">
          <div className="company-info">
            {companyConfig.logo && companyConfig.printLogo && (
              <img src={companyConfig.logo} alt="Logo" className="company-logo" />
            )}
            <div className="company-details">
              <h1>{companyConfig.companyName}</h1>
              {companyConfig.nit && <p><strong>NIT:</strong> {companyConfig.nit}</p>}
              {companyConfig.address && <p><strong>Dirección:</strong> {companyConfig.address}</p>}
              {companyConfig.phone && <p><strong>Teléfono:</strong> {companyConfig.phone}</p>}
              {companyConfig.email && <p><strong>Email:</strong> {companyConfig.email}</p>}
            </div>
          </div>
          
          <div className="invoice-info">
            <h2>FACTURA DE VENTA</h2>
            <div className="invoice-number">#{sale.id}</div>
            <p><strong>Fecha:</strong> {dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}</p>
            <div 
              className="payment-status-badge"
              style={{ 
                backgroundColor: status.bgColor, 
                color: status.color,
                border: `1px solid ${status.color}`
              }}
            >
              {status.text}
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="customer-section">
          <h3>Información del Cliente</h3>
          <div className="customer-details">
            <p><strong>Cliente:</strong> {sale.client?.name || 'Cliente Ocasional'}</p>
            {sale.client?.nit && <p><strong>NIT:</strong> {sale.client.nit}</p>}
            {sale.client?.phone && <p><strong>Teléfono:</strong> {sale.client.phone}</p>}
            {sale.client?.address && <p><strong>Dirección:</strong> {sale.client.address}</p>}
          </div>
          {sale.user && (
            <p><strong>Atendido por:</strong> {sale.user.name}</p>
          )}
          {sale.cashSession && (
            <p><strong>Sesión de Caja:</strong> #{sale.cashSession.id}</p>
          )}
        </div>

        {/* Products Table */}
        <div className="products-section">
          <h3>Detalle de Productos</h3>
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>Cant.</th>
                <th style={{ width: '45%' }}>Producto</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Precio Unit.</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Descuento</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.details?.map((detail: any, index: number) => (
                <tr key={index}>
                  <td>{detail.quantity}</td>
                  <td>{detail.product?.name || `Producto #${detail.productId}`}</td>
                  <td style={{ textAlign: 'right' }}>
                    ${detail.unitPrice.toLocaleString('es-CO')}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {detail.discount > 0 ? `$${detail.discount.toLocaleString('es-CO')}` : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <strong>${((detail.quantity * detail.unitPrice) - (detail.discount || 0)).toLocaleString('es-CO')}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="totals-section">
          <div className="totals-row">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toLocaleString('es-CO')}</span>
          </div>
          {calculateDiscount() > 0 && (
            <div className="totals-row">
              <span>Descuento:</span>
              <span>-${calculateDiscount().toLocaleString('es-CO')}</span>
            </div>
          )}
          {companyConfig.taxRate && companyConfig.taxRate > 0 && (
            <div className="totals-row">
              <span>IVA ({companyConfig.taxRate}%):</span>
              <span>${calculateTax().toLocaleString('es-CO')}</span>
            </div>
          )}
          <div className="totals-row total">
            <span>TOTAL:</span>
            <span>${sale.totalAmount.toLocaleString('es-CO')}</span>
          </div>

          {/* Payment Info */}
          {sale.paymentStatus !== 'PENDIENTE' && (
            <>
              <div className="totals-row">
                <span>Pagado:</span>
                <span>${(sale.amountPaid || 0).toLocaleString('es-CO')}</span>
              </div>
              {sale.paymentStatus === 'PARCIAL' && (
                <div className="totals-row pending">
                  <span>Pendiente:</span>
                  <span>${((sale.totalAmount || 0) - (sale.amountPaid || 0)).toLocaleString('es-CO')}</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Method */}
        {sale.paymentMethod && (
          <div className="payment-method-section">
            <p><strong>Método de Pago:</strong> {sale.paymentMethod}</p>
          </div>
        )}

        {/* Notes */}
        {sale.notes && (
          <div className="notes-section">
            <p><strong>Observaciones:</strong></p>
            <p>{sale.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="invoice-footer">
          {companyConfig.invoiceFooter && <p>{companyConfig.invoiceFooter}</p>}
          <p className="thank-you">¡Gracias por su compra!</p>
          <p className="generated-date">
            Documento generado el {dayjs().format('DD/MM/YYYY HH:mm')}
          </p>
        </div>
      </div>
    );
  }
);

SaleInvoice.displayName = 'SaleInvoice';

export default SaleInvoice;
