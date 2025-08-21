import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Sale } from '../types/SaleTypes';

export const exportSalesToExcel = (sales: Sale[]) => {
  try {
    // Preparar datos para Excel
    const excelData = sales.map((sale, index) => ({
      '#': index + 1,
      'Fecha': new Date(sale.date).toLocaleDateString('es-CO'),
      'Cliente': sale.customerName || 'Cliente ocasional',
      'Método de Pago': sale.paymentMethod || 'Sin especificar',
      'Total': sale.totalAmount,
      'Estado': sale.isPaid ? 'PAGADO' : 'PENDIENTE',
      'Monto Pagado': sale.paidAmount || 0,
      'Saldo Pendiente': sale.isPaid ? 0 : (sale.totalAmount - (sale.paidAmount || 0)),
      'Productos': sale.details?.map(d => `${d.product?.name} (${d.quantity})`).join(', ') || '',
    }));

    // Crear workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    
    // Establecer ancho de columnas
    const colWidths = [
      { wch: 5 },   // #
      { wch: 12 },  // Fecha
      { wch: 20 },  // Cliente
      { wch: 15 },  // Método de Pago
      { wch: 12 },  // Total
      { wch: 12 },  // Estado
      { wch: 12 },  // Monto Pagado
      { wch: 15 },  // Saldo Pendiente
      { wch: 40 },  // Productos
    ];
    ws['!cols'] = colWidths;

    // Agregar hoja al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

    // Generar nombre del archivo
    const today = new Date().toISOString().split('T')[0];
    const filename = `ventas_milan_${today}.xlsx`;

    // Convertir a buffer y descargar
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error al exportar a Excel:', error);
    return false;
  }
};

export const exportDetailedSalesToExcel = (sales: Sale[]) => {
  try {
    // Preparar datos detallados (una fila por producto)
    const detailedData: any[] = [];
    
    sales.forEach((sale) => {
      if (sale.details && sale.details.length > 0) {
        sale.details.forEach((detail) => {
          detailedData.push({
            'ID Venta': sale.id || 'Sin ID',
            'Fecha': new Date(sale.date).toLocaleDateString('es-CO'),
            'Cliente': sale.customerName || 'Cliente ocasional',
            'Método de Pago': sale.paymentMethod || 'Sin especificar',
            'Estado Venta': sale.isPaid ? 'PAGADO' : 'PENDIENTE',
            'Producto': detail.product?.name || 'Sin nombre',
            'Cantidad': detail.quantity,
            'Precio Unitario': detail.unitPrice,
            'Subtotal': detail.totalPrice || 0,
            'Total Venta': sale.totalAmount,
          });
        });
      } else {
        // Si no hay detalles, agregar una fila con la venta
        detailedData.push({
          'ID Venta': sale.id || 'Sin ID',
          'Fecha': new Date(sale.date).toLocaleDateString('es-CO'),
          'Cliente': sale.customerName || 'Cliente ocasional',
          'Método de Pago': sale.paymentMethod || 'Sin especificar',
          'Estado Venta': sale.isPaid ? 'PAGADO' : 'PENDIENTE',
          'Producto': 'Sin productos',
          'Cantidad': 0,
          'Precio Unitario': 0,
          'Subtotal': 0,
          'Total Venta': sale.totalAmount,
        });
      }
    });

    // Crear workbook con datos detallados
    const ws = XLSX.utils.json_to_sheet(detailedData);
    const wb = XLSX.utils.book_new();
    
    // Establecer ancho de columnas para reporte detallado
    const colWidths = [
      { wch: 10 },  // ID Venta
      { wch: 12 },  // Fecha
      { wch: 20 },  // Cliente
      { wch: 15 },  // Método de Pago
      { wch: 12 },  // Estado Venta
      { wch: 25 },  // Producto
      { wch: 10 },  // Cantidad
      { wch: 15 },  // Precio Unitario
      { wch: 12 },  // Subtotal
      { wch: 12 },  // Total Venta
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Ventas Detalladas');

    // Generar archivo
    const today = new Date().toISOString().split('T')[0];
    const filename = `ventas_detalladas_milan_${today}.xlsx`;
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error al exportar reporte detallado:', error);
    return false;
  }
};
