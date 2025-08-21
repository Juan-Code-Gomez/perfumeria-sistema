// Test simple del Dashboard Ejecutivo
// Este archivo simula la respuesta del API para probar la interfaz

export const mockExecutiveDashboardData = {
  kpis: {
    today: {
      sales: 250000,
      expenses: 45000,
      profit: 205000,
      transactions: 12,
      cashInRegister: 180000
    },
    month: {
      sales: 4500000,
      expenses: 850000,
      profit: 3650000,
      transactions: 240,
      salesGrowth: 18.5,
      expenseGrowth: -8.2
    }
  },
  charts: {
    salesTrend: [
      { date: '2025-08-02', day: 'Vie', sales: 120000, transactions: 8 },
      { date: '2025-08-03', day: 'Sab', sales: 180000, transactions: 15 },
      { date: '2025-08-04', day: 'Dom', sales: 95000, transactions: 6 },
      { date: '2025-08-05', day: 'Lun', sales: 220000, transactions: 14 },
      { date: '2025-08-06', day: 'Mar', sales: 165000, transactions: 10 },
      { date: '2025-08-07', day: 'Mie', sales: 190000, transactions: 11 },
      { date: '2025-08-08', day: 'Jue', sales: 250000, transactions: 12 }
    ],
    topProducts: [
      { 
        product: { 
          id: 1, 
          name: 'Perfume Carolina Herrera Good Girl', 
          category: { name: 'Perfumes Femeninos' } 
        }, 
        quantity: 25, 
        revenue: 3750000 
      },
      { 
        product: { 
          id: 2, 
          name: 'Cologne Hugo Boss Bottled', 
          category: { name: 'Perfumes Masculinos' } 
        }, 
        quantity: 18, 
        revenue: 2340000 
      },
      { 
        product: { 
          id: 3, 
          name: 'Perfume Chanel No. 5', 
          category: { name: 'Perfumes Premium' } 
        }, 
        quantity: 12, 
        revenue: 1800000 
      }
    ],
    paymentMethods: {
      efectivo: 1800000,
      tarjeta: 1650000,
      transferencia: 750000,
      credito: 300000
    },
    expensesByCategory: {
      'Compra de Mercancía': 450000,
      'Servicios Públicos': 120000,
      'Arriendo': 180000,
      'Personal': 85000,
      'Otros Gastos': 15000
    }
  },
  finances: {
    cashFlow: {
      income: 4500000,
      expenses: 850000,
      netFlow: 3650000
    },
    accounts: {
      receivable: 320000,
      payable: 180000,
      netPosition: 140000
    }
  },
  alerts: [
    {
      type: 'stock',
      severity: 'high',
      message: '5 productos con stock bajo',
      data: []
    },
    {
      type: 'credits',
      severity: 'medium',
      message: '3 créditos vencidos',
      data: []
    }
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    period: {
      today: '2025-08-08',
      month: '2025-08'
    }
  }
};

console.log('✅ Datos de prueba del Dashboard Ejecutivo generados');
console.log('📊 Ventas de hoy:', mockExecutiveDashboardData.kpis.today.sales.toLocaleString('es-CO'));
console.log('💰 Utilidad del mes:', mockExecutiveDashboardData.kpis.month.profit.toLocaleString('es-CO'));
console.log('📈 Crecimiento de ventas:', mockExecutiveDashboardData.kpis.month.salesGrowth + '%');
console.log('🚨 Alertas activas:', mockExecutiveDashboardData.alerts.length);
