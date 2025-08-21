import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Sale } from '../types/SaleTypes';
import { getLogoOrPlaceholder } from './logoHandler';

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  nit?: string;
}

interface InvoiceData extends Sale {
  companyInfo: CompanyInfo;
  invoiceNumber?: string;
}

export const generateInvoicePDF = async (data: InvoiceData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Colores inspirados en Milan Fragancias - Elegante y limpio
  const primaryBlack: [number, number, number] = [0, 0, 0]; // Negro para líneas y texto principal
  const elegantBlue: [number, number, number] = [25, 45, 85]; // Azul elegante
  const lightGray: [number, number, number] = [248, 249, 250]; // Gris muy claro para fondos sutiles
  const mediumGray: [number, number, number] = [128, 128, 128]; // Gris medio para texto secundario
  const accentColor: [number, number, number] = [220, 53, 69]; // Color de acento (rojo elegante)

  // HEADER minimalista - Solo línea sutil
  doc.setDrawColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setLineWidth(0.5);
  doc.line(0, 35, pageWidth, 35); // Línea inferior del header más delgada
  
  // Logo - Más pequeño y minimalista
  const logoBase64 = await getLogoOrPlaceholder();
  
  if (logoBase64) {
    // Logo real de Milan más pequeño
    doc.addImage(logoBase64, 'PNG', 15, 8, 20, 20);
  } else {
    // Placeholder minimalista
    doc.setDrawColor(elegantBlue[0], elegantBlue[1], elegantBlue[2]);
    doc.setLineWidth(1);
    doc.roundedRect(15, 8, 20, 20, 2, 2, 'S');
    doc.setTextColor(elegantBlue[0], elegantBlue[1], elegantBlue[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MF', 25, 20, { align: 'center' });
  }

  // Nombre de la empresa - Más pequeño
  doc.setTextColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyInfo.name, 40, 17);
  
  // Slogan más discreto
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Fragancias de Lujo', 40, 23);
  
  // Información de contacto más compacta
  doc.setFontSize(7);
  doc.text(`${data.companyInfo.address} | Tel: ${data.companyInfo.phone}`, 40, 28);

  // INFORMACIÓN DE FACTURA - Marco más pequeño y minimalista
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(pageWidth - 60, 8, 50, 20, 2, 2, 'F');
  
  doc.setDrawColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 60, 8, 50, 20, 2, 2, 'S');
  
  doc.setTextColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageWidth - 35, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`#${data.invoiceNumber || data.id}`, pageWidth - 35, 20, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text(`${new Date(data.date).toLocaleDateString('es-CO')}`, pageWidth - 35, 25, { align: 'center' });

  // INFORMACIÓN DEL CLIENTE - Diseño minimalista
  let yPosition = 50;
  
  // Solo una línea separadora muy sutil
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.3);
  doc.line(20, yPosition - 2, pageWidth - 20, yPosition - 2);
  
  doc.setTextColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 20, yPosition + 5);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.customerName || 'Cliente ocasional'}`, 40, yPosition + 5);

  // INFORMACIÓN DE PAGO - Compacta en el lado derecho
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Pago:', pageWidth - 80, yPosition + 5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${data.paymentMethod}`, pageWidth - 55, yPosition + 5);
  
  // Estado de pago minimalista
  if (data.isPaid) {
    doc.setTextColor(40, 167, 69);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PAGADO', pageWidth - 25, yPosition + 5);
  } else {
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PENDIENTE', pageWidth - 25, yPosition + 5);
  }

  // TABLA DE PRODUCTOS minimalista
  yPosition = 70;
  
  const tableData = data.details?.map((detail, index) => [
    index + 1,
    detail.product?.name || 'Producto',
    detail.quantity,
    `$${detail.unitPrice?.toLocaleString() || '0'}`,
    `$${(detail.totalPrice || 0).toLocaleString()}`
  ]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    styles: {
      fontSize: 8,
      textColor: primaryBlack,
      cellPadding: 4,
      lineColor: primaryBlack,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: primaryBlack,
      fontStyle: 'bold',
      fontSize: 9,
      lineColor: primaryBlack,
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 90 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 20, right: 20 },
    tableLineColor: [200, 200, 200],
    tableLineWidth: 0.3,
  });

  // TOTALES minimalistas
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Marco muy sutil para totales
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(pageWidth - 90, finalY - 5, 70, 25, 2, 2, 'F');
  
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.roundedRect(pageWidth - 90, finalY - 5, 70, 25, 2, 2, 'S');

  // Totales con fuente más pequeña
  doc.setTextColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  let totalY = finalY + 2;
  doc.text('Subtotal:', pageWidth - 85, totalY);
  doc.text(`$${(data.totalAmount || 0).toLocaleString()}`, pageWidth - 30, totalY, { align: 'right' });
  
  // Total principal más compacto
  totalY += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 85, totalY);
  doc.text(`$${(data.totalAmount || 0).toLocaleString()}`, pageWidth - 30, totalY, { align: 'right' });

  // Pagos parciales compactos
  if (!data.isPaid && data.paidAmount && data.paidAmount > 0) {
    totalY += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(40, 167, 69);
    doc.text('Pagado:', pageWidth - 85, totalY);
    doc.text(`$${data.paidAmount.toLocaleString()}`, pageWidth - 30, totalY, { align: 'right' });
    
    totalY += 6;
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('Saldo:', pageWidth - 85, totalY);
    doc.text(`$${((data.totalAmount || 0) - data.paidAmount).toLocaleString()}`, pageWidth - 30, totalY, { align: 'right' });
  }

  // FOOTER minimalista
  const footerY = pageHeight - 40;
  
  // Solo una línea separadora muy sutil
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.3);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  // Mensaje principal más pequeño
  doc.setTextColor(primaryBlack[0], primaryBlack[1], primaryBlack[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Gracias por elegir Milan Fragancias', pageWidth / 2, footerY + 8, { align: 'center' });
  
  // Términos compactos
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Los productos de perfumería no tienen cambio ni devolución una vez abiertos', pageWidth / 2, footerY + 16, { align: 'center' });
  doc.text('Factura generada electrónicamente', pageWidth / 2, footerY + 22, { align: 'center' });

  return doc;
};

// Función para descargar la factura
export const downloadInvoice = async (sale: Sale, companyInfo: CompanyInfo) => {
  const invoiceData: InvoiceData = {
    ...sale,
    companyInfo,
    invoiceNumber: `PF-${(sale.id || 0).toString().padStart(6, '0')}`,
  };
  
  const doc = await generateInvoicePDF(invoiceData);
  doc.save(`Factura-${invoiceData.invoiceNumber}.pdf`);
};

// Función para imprimir la factura
export const printInvoice = async (sale: Sale, companyInfo: CompanyInfo) => {
  const invoiceData: InvoiceData = {
    ...sale,
    companyInfo,
    invoiceNumber: `PF-${(sale.id || 0).toString().padStart(6, '0')}`,
  };
  
  const doc = await generateInvoicePDF(invoiceData);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
