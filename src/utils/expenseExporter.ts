// src/utils/expenseExporter.ts
import * as XLSX from 'xlsx';

interface Expense {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  notes?: string;
}

interface ExpenseSummary {
  total: number;
  dailyAverage: number;
  previousMonthTotal: number;
  byCategory: Record<string, number>;
  byPaymentMethod: Record<string, number>;
}

export const exportExpensesToExcel = (
  expenses: Expense[], 
  summary: ExpenseSummary,
  filters: any
) => {
  // Crear workbook
  const wb = XLSX.utils.book_new();

  // 1. Hoja de Resumen
  const summaryData = [
    ['📊 RESUMEN DE GASTOS', '', '', ''],
    ['', '', '', ''],
    ['💰 Total del Período', `$${summary.total.toLocaleString()}`, '', ''],
    ['📅 Promedio Diario', `$${summary.dailyAverage.toLocaleString()}`, '', ''],
    ['📈 Mes Anterior', `$${summary.previousMonthTotal.toLocaleString()}`, '', ''],
    ['📊 Variación', summary.previousMonthTotal > 0 ? 
      `${(((summary.total - summary.previousMonthTotal) / summary.previousMonthTotal) * 100).toFixed(1)}%` : 'N/A', '', ''],
    ['', '', '', ''],
    ['🏷️ POR CATEGORÍA', '', '', ''],
    ...Object.entries(summary.byCategory).map(([cat, amount]) => [cat, `$${amount.toLocaleString()}`, '', '']),
    ['', '', '', ''],
    ['💳 POR MÉTODO DE PAGO', '', '', ''],
    ...Object.entries(summary.byPaymentMethod).map(([method, amount]) => [method, `$${amount.toLocaleString()}`, '', '']),
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Configurar columnas del resumen
  summaryWs['!cols'] = [
    { width: 25 },
    { width: 15 },
    { width: 15 },
    { width: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, summaryWs, '📊 Resumen');

  // 2. Hoja de Detalle
  const detailData = [
    ['🗓️ Fecha', '📝 Descripción', '🏷️ Categoría', '💰 Monto', '💳 Método Pago', '📝 Notas'],
    ...expenses.map(expense => [
      new Date(expense.date).toLocaleDateString('es-ES'),
      expense.description,
      expense.category,
      expense.amount,
      expense.paymentMethod,
      expense.notes || ''
    ])
  ];

  const detailWs = XLSX.utils.aoa_to_sheet(detailData);
  
  // Configurar columnas del detalle
  detailWs['!cols'] = [
    { width: 12 },  // Fecha
    { width: 30 },  // Descripción
    { width: 15 },  // Categoría
    { width: 12 },  // Monto
    { width: 15 },  // Método Pago
    { width: 25 }   // Notas
  ];

  XLSX.utils.book_append_sheet(wb, detailWs, '📋 Detalle');

  // 3. Generar archivo
  const fileName = `gastos_${filters.dateFrom || 'inicio'}_a_${filters.dateTo || 'fin'}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportExpenseSummaryToExcel = (summary: ExpenseSummary, filters: any) => {
  const wb = XLSX.utils.book_new();
  
  const data = [
    ['📊 RESUMEN EJECUTIVO DE GASTOS'],
    [''],
    ['Período:', `${filters.dateFrom || 'Inicio'} - ${filters.dateTo || 'Fin'}`],
    [''],
    ['💰 TOTALES'],
    ['Total Gastos:', `$${summary.total.toLocaleString()}`],
    ['Promedio Diario:', `$${summary.dailyAverage.toLocaleString()}`],
    ['Mes Anterior:', `$${summary.previousMonthTotal.toLocaleString()}`],
    [''],
    ['🏷️ DISTRIBUCIÓN POR CATEGORÍA'],
    ...Object.entries(summary.byCategory).map(([cat, amount]) => [
      cat, 
      `$${amount.toLocaleString()}`,
      `${((amount / summary.total) * 100).toFixed(1)}%`
    ]),
    [''],
    ['💳 DISTRIBUCIÓN POR MÉTODO DE PAGO'],
    ...Object.entries(summary.byPaymentMethod).map(([method, amount]) => [
      method, 
      `$${amount.toLocaleString()}`,
      `${((amount / summary.total) * 100).toFixed(1)}%`
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ width: 25 }, { width: 15 }, { width: 12 }];
  
  XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
  
  const fileName = `resumen_gastos_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
