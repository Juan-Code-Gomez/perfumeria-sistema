import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DiscountReport } from '../services/discountReportService';

// Exportar a Excel con múltiples hojas
export const exportDiscountReportToExcel = (reportData: DiscountReport) => {
  try {
    // Crear un nuevo workbook
    const workbook = XLSX.utils.book_new();

    // === HOJA 1: RESUMEN EJECUTIVO ===
    const summaryData = [
      ['REPORTE DE DESCUENTOS - RESUMEN EJECUTIVO'],
      [''],
      ['Período:', `${reportData.period.from || 'N/A'} - ${reportData.period.to || 'N/A'}`],
      ['Fecha generación:', new Date().toLocaleString()],
      [''],
      ['ESTADÍSTICAS GENERALES'],
      ['Total ventas con descuento', reportData.summary.totalSales],
      ['Monto total descontado', `$${reportData.summary.totalDiscountAmount.toLocaleString()}`],
      ['Subtotal antes descuentos', `$${reportData.summary.totalSubtotalAmount.toLocaleString()}`],
      ['Total facturado final', `$${reportData.summary.totalFinalAmount.toLocaleString()}`],
      ['Promedio descuento por venta', `$${reportData.summary.averageDiscountAmount.toLocaleString()}`],
      ['% descuento del subtotal', `${reportData.summary.discountPercentageOfSubtotal.toFixed(2)}%`],
      [''],
      ['ANÁLISIS POR TIPO DE DESCUENTO'],
    ];

    // Agregar datos por tipo
    Object.entries(reportData.discountsByType).forEach(([type, data]) => {
      const typeLabel = type === 'percentage' ? 'Porcentaje' : 'Fijo';
      summaryData.push([
        `${typeLabel}:`,
        `${data.count} ventas`,
        `$${data.totalDiscountAmount.toLocaleString()}`,
        `${((data.totalDiscountAmount / reportData.summary.totalDiscountAmount) * 100).toFixed(1)}%`
      ]);
    });

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen Ejecutivo');

    // === HOJA 2: DETALLE DE VENTAS ===
    const salesHeaders = [
      'ID Venta',
      'Fecha', 
      'Cliente',
      'Subtotal',
      'Tipo Descuento',
      'Valor Descuento',
      'Monto Descontado',
      'Total Final'
    ];

    const salesData = reportData.salesWithDiscounts.map(sale => [
      sale.id,
      new Date(sale.date).toLocaleDateString(),
      sale.customerDisplayName,
      sale.subtotalAmount,
      sale.discountType === 'percentage' ? 'Porcentaje' : 'Fijo',
      sale.discountType === 'percentage' ? `${sale.discountValue}%` : `$${sale.discountValue?.toLocaleString()}`,
      sale.discountAmount,
      sale.totalAmount
    ]);

    const salesSheet = XLSX.utils.aoa_to_sheet([salesHeaders, ...salesData]);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Detalle Ventas');

    // === HOJA 3: TOP CLIENTES ===
    const clientsHeaders = ['Cliente', 'Total Descuentos', 'Cantidad Ventas', '% del Total'];
    const clientsData = reportData.topCustomers.map(customer => [
      customer.name,
      customer.totalDiscount,
      customer.salesCount,
      `${((customer.totalDiscount / reportData.summary.totalDiscountAmount) * 100).toFixed(1)}%`
    ]);

    const clientsSheet = XLSX.utils.aoa_to_sheet([clientsHeaders, ...clientsData]);
    XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Top Clientes');

    // Generar el archivo
    const fileName = `reporte_descuentos_${reportData.period.from || 'N-A'}_${reportData.period.to || 'N-A'}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};

// Exportar reporte ejecutivo a PDF
export const exportDiscountReportToPDF = (reportData: DiscountReport) => {
  try {
    const doc = new jsPDF();
    
    // === ENCABEZADO ===
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text('REPORTE DE DESCUENTOS', 105, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    const currentDate = new Date().toLocaleDateString('es-ES');
    doc.text('Generado el: ' + currentDate, 105, 35, { align: 'center' });
    
    const fromDate = reportData.period.from || 'N/A';
    const toDate = reportData.period.to || 'N/A';
    const period = 'Periodo: ' + fromDate + ' - ' + toDate;
    doc.text(period, 105, 42, { align: 'center' });
    
    // === RESUMEN EJECUTIVO ===
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.text('RESUMEN EJECUTIVO', 20, 60);
    
    doc.setFontSize(11);
    doc.setTextColor(60);
    
    const summaryData = [
      ['Total de ventas con descuento:', reportData.summary.totalSales.toString()],
      ['Monto total descontado:', '$' + reportData.summary.totalDiscountAmount.toLocaleString()],
      ['Subtotal antes de descuentos:', '$' + reportData.summary.totalSubtotalAmount.toLocaleString()],
      ['Total facturado final:', '$' + reportData.summary.totalFinalAmount.toLocaleString()],
      ['Promedio descuento por venta:', '$' + Math.round(reportData.summary.averageDiscountAmount).toLocaleString()],
      ['% de descuento del subtotal:', reportData.summary.discountPercentageOfSubtotal.toFixed(2) + '%'],
    ];

    summaryData.forEach((item, index) => {
      doc.text(item[0], 25, 75 + (index * 8));
      doc.text(item[1], 130, 75 + (index * 8));
    });

    // === ANÁLISIS POR TIPO ===
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('ANALISIS POR TIPO DE DESCUENTO', 20, 140);

    const typeAnalysis = Object.entries(reportData.discountsByType).map(([type, data]) => [
      type === 'percentage' ? 'Porcentaje' : 'Fijo',
      data.count.toString(),
      '$' + data.totalDiscountAmount.toLocaleString(),
      ((data.totalDiscountAmount / reportData.summary.totalDiscountAmount) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: 150,
      head: [['Tipo', 'Cantidad', 'Monto Total', '% del Total']],
      body: typeAnalysis,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
      margin: { left: 20, right: 20 }
    });

    // === TOP CLIENTES ===
    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('TOP CLIENTES CON DESCUENTOS', 20, (doc as any).lastAutoTable.finalY + 20);

    const clientsData = reportData.topCustomers.slice(0, 8).map(customer => [
      customer.name,
      customer.salesCount.toString(),
      '$' + customer.totalDiscount.toLocaleString(),
      ((customer.totalDiscount / reportData.summary.totalDiscountAmount) * 100).toFixed(1) + '%'
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 30,
      head: [['Cliente', 'Ventas', 'Total Descuentos', '% del Total']],
      body: clientsData,
      theme: 'grid',
      headStyles: { fillColor: [46, 204, 113] },
      margin: { left: 20, right: 20 }
    });

    // Nueva página para detalle de ventas si hay espacio
    if ((doc as any).lastAutoTable.finalY > 250) {
      doc.addPage();
    }

    // === DETALLE DE VENTAS ===
    doc.setFontSize(14);
    doc.setTextColor(40);
    const detailY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 20 : 60;
    doc.text('DETALLE DE VENTAS CON DESCUENTOS', 20, detailY);

    const salesData = reportData.salesWithDiscounts.map(sale => [
      '#' + sale.id,
      new Date(sale.date).toLocaleDateString('es-ES'),
      sale.customerDisplayName,
      sale.discountType === 'percentage' ? sale.discountValue + '%' : 'Fijo',
      '$' + sale.discountAmount.toLocaleString(),
      '$' + sale.totalAmount.toLocaleString()
    ]);

    autoTable(doc, {
      startY: detailY + 10,
      head: [['ID', 'Fecha', 'Cliente', 'Tipo', 'Descuento', 'Total']],
      body: salesData,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      margin: { left: 20, right: 20 },
      styles: { fontSize: 9 }
    });

    // === PIE DE PÁGINA ===
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Página ${i} de ${pageCount}`, 105, 285, { align: 'center' });
      doc.text('Sistema de Gestion - Milan Fragancias', 105, 292, { align: 'center' });
    }

    // Guardar archivo
    const fromDateFile = reportData.period.from || 'N-A';
    const toDateFile = reportData.period.to || 'N-A';
    const fileName = 'reporte_descuentos_' + fromDateFile + '_' + toDateFile + '.pdf';
    doc.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exportando a PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
  }
};