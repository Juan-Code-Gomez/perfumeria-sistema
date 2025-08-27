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
  customerNit?: string;
  customerAddress?: string;
  customerPhone?: string;
}

export const generateInvoicePDF = async (data: InvoiceData): Promise<jsPDF> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colores profesionales basados en la imagen de referencia
  const primaryBlue: [number, number, number] = [52, 73, 130];
  const darkGray: [number, number, number] = [64, 64, 64];
  const lightGray: [number, number, number] = [240, 240, 240];
  const borderGray: [number, number, number] = [180, 180, 180];
  const accentColor: [number, number, number] = [220, 53, 69];

  // HEADER CON DISEÑO CORPORATIVO
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, pageWidth, 45, 'F');
  
  // Logo o inicial de la empresa
  const logoBase64 = await getLogoOrPlaceholder();
  
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', 15, 8, 25, 25);
  } else {
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 8, 25, 25, 3, 3, 'F');
    doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MF', 27.5, 22, { align: 'center' });
  }

  // Información de la empresa en el header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(data.companyInfo.name.toUpperCase(), 45, 18);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(data.companyInfo.address, 45, 25);
  doc.text(`Tel: ${data.companyInfo.phone}`, 45, 30);
  doc.text(data.companyInfo.email, 45, 35);
  if (data.companyInfo.website) {
    doc.text(data.companyInfo.website, 45, 40);
  }

  // INFORMACIÓN DE FACTURA - Recuadro derecho
  const invoiceBoxX = pageWidth - 70;
  const invoiceBoxY = 8;
  const invoiceBoxWidth = 60;
  const invoiceBoxHeight = 30;
  
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(invoiceBoxX, invoiceBoxY, invoiceBoxWidth, invoiceBoxHeight, 2, 2, 'F');
  
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(invoiceBoxX, invoiceBoxY, invoiceBoxWidth, invoiceBoxHeight, 2, 2, 'S');
  
  doc.setTextColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE VENTA', invoiceBoxX + 30, invoiceBoxY + 8, { align: 'center' });
  
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. Factura: ${data.invoiceNumber || data.id}`, invoiceBoxX + 30, invoiceBoxY + 15, { align: 'center' });
  doc.text(`Fecha: ${new Date(data.date).toLocaleDateString('es-CO')}`, invoiceBoxX + 30, invoiceBoxY + 20, { align: 'center' });

  // LÍNEA SEPARADORA
  let yPosition = 55;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // INFORMACIÓN DEL CLIENTE
  yPosition += 10;
  
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(15, yPosition, pageWidth - 30, 8, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.rect(15, yPosition, pageWidth - 30, 8, 'S');
  
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMACIÓN DEL CLIENTE', 20, yPosition + 5);

  yPosition += 12;
  
  // Información del cliente en formato de tabla
  const clientInfo = [
    ['Nombre Cliente:', data.customerName || 'Cliente Ocasional'],
    ['NIT:', data.customerNit || 'N/A'],
    ['Dirección:', data.customerAddress || 'N/A'],
    ['Teléfono:', data.customerPhone || 'N/A'],
  ];

  clientInfo.forEach(([label, value], index) => {
    const rowY = yPosition + (index * 8);
    
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(15, rowY - 2, pageWidth - 30, 8, 'F');
    }
    
    doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
    doc.setLineWidth(0.3);
    doc.line(15, rowY - 2, pageWidth - 15, rowY - 2);
    doc.line(15, rowY + 6, pageWidth - 15, rowY + 6);
    doc.line(15, rowY - 2, 15, rowY + 6);
    doc.line(pageWidth - 15, rowY - 2, pageWidth - 15, rowY + 6);
    doc.line(80, rowY - 2, 80, rowY + 6);
    
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, rowY + 3);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 85, rowY + 3);
  });

  yPosition += 40;

  // ENCABEZADO DE PRODUCTOS
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(15, yPosition, pageWidth - 30, 10, 'F');
  doc.setDrawColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(15, yPosition, pageWidth - 30, 10, 'S');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUCTOS', 20, yPosition + 6);

  yPosition += 15;

  // TABLA DE PRODUCTOS
  const tableProductsData = data.details?.map((detail, index) => [
    (index + 1).toString(),
    detail.product?.name || 'Producto',
    detail.quantity.toString(),
    `$${detail.unitPrice?.toLocaleString('es-CO') || '0'}`,
    `$${(detail.totalPrice || 0).toLocaleString('es-CO')}`
  ]) || [];

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'Producto', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableProductsData,
    styles: {
      fontSize: 9,
      textColor: darkGray,
      cellPadding: 4,
      lineColor: borderGray,
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: lightGray,
      textColor: darkGray,
      fontStyle: 'bold',
      fontSize: 10,
      lineColor: borderGray,
      lineWidth: 0.3,
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 12 },
      1: { halign: 'left', cellWidth: 85 },
      2: { halign: 'center', cellWidth: 20 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 35 },
    },
    margin: { left: 15, right: 15 },
    tableLineColor: borderGray,
    tableLineWidth: 0.3,
  });

  // TOTALES
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  // Fondo para totales
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(pageWidth - 90, finalY - 5, 75, 35, 2, 2, 'F');
  
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 90, finalY - 5, 75, 35, 2, 2, 'S');

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let totalY = finalY + 2;
  doc.text('Subtotal:', pageWidth - 85, totalY);
  doc.text(`$${data.totalAmount?.toLocaleString('es-CO') || '0'}`, pageWidth - 25, totalY, { align: 'right' });

  totalY += 6;
  doc.text('IVA (0%):', pageWidth - 85, totalY);
  doc.text('$0', pageWidth - 25, totalY, { align: 'right' });

  // Total final
  totalY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - 85, totalY);
  doc.text(`$${data.totalAmount?.toLocaleString('es-CO') || '0'}`, pageWidth - 25, totalY, { align: 'right' });

  // INFORMACIÓN DE PAGO
  totalY += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Método: ${data.paymentMethod || 'Efectivo'}`, pageWidth - 85, totalY);

  // Estado de pago
  if (data.isPaid) {
    doc.setTextColor(40, 167, 69);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGADA', pageWidth - 25, totalY, { align: 'right' });
  } else {
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('PENDIENTE', pageWidth - 25, totalY, { align: 'right' });
  }

  // FOOTER
  const footerY = 270;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Gracias por su compra - Milán Fragancias', pageWidth / 2, footerY + 8, { align: 'center' });
  doc.text('Esta factura es válida como comprobante de compra', pageWidth / 2, footerY + 14, { align: 'center' });

  return doc;
};

// Funciones existentes para mantener compatibilidad
export const printInvoice = async (sale: Sale, companyInfo: CompanyInfo): Promise<void> => {
  const invoiceData: InvoiceData = {
    ...sale,
    companyInfo,
    invoiceNumber: `${sale.id}`.padStart(6, '0'),
  };
  
  const doc = await generateInvoicePDF(invoiceData);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

export const downloadInvoice = async (sale: Sale, companyInfo: CompanyInfo): Promise<void> => {
  const invoiceData: InvoiceData = {
    ...sale,
    companyInfo,
    invoiceNumber: `${sale.id}`.padStart(6, '0'),
  };
  
  const doc = await generateInvoicePDF(invoiceData);
  doc.save(`Factura-${invoiceData.invoiceNumber}.pdf`);
};
