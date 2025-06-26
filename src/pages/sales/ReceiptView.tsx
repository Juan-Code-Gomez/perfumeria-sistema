import React from 'react'
import { Button } from 'antd'
import type { Sale } from '../../types/SaleTypes' // Asegúrate de que este tipo tenga: id, date, totalAmount, paidAmount, customerName, details[]
import { format } from 'date-fns'

interface Props {
  sale: Sale
}

const ReceiptView: React.FC<Props> = ({ sale }) => {
  const handlePrint = () => {
    const printContents = document.getElementById('receipt-content')?.innerHTML
    const printWindow = window.open('', '_blank')
    if (printWindow && printContents) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Factura de venta</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                padding: 20px;
              }
              .text-center { text-align: center; }
              .font-bold { font-weight: bold; }
              .border-b { border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
              .mb-2 { margin-bottom: 8px; }
              .mt-4 { margin-top: 16px; }
              .text-sm { font-size: 14px; }
            </style>
          </head>
          <body>${printContents}</body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div>
      <div id="receipt-content" className="p-4 w-full max-w-sm mx-auto text-sm">
        <div className="text-center mb-4">
          <img
            src="/logo-factura.png" // asegúrate de tener tu logo en public/
            alt="Milán Fragancias"
            className="w-24 mx-auto mb-2"
          />
          <h2 className="text-lg font-bold">Milán Fragancias</h2>
          <p>Fecha: {format(new Date(sale.date), 'dd/MM/yyyy')}</p>
        </div>

        <div className="border-b mb-2">
          <p className="font-bold">Cliente:</p>
          <p>{sale.customerName || 'Consumidor final'}</p>
        </div>

        <div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border-b pb-1">Producto</th>
                <th className="border-b pb-1">Cant</th>
                <th className="border-b pb-1">V. Unit</th>
                <th className="border-b pb-1">Total</th>
              </tr>
            </thead>
            <tbody>
              {sale.details.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.product.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.unitPrice.toFixed(0)}</td>
                  <td>${item.totalPrice.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t pt-2 text-right">
          <p>Total: <strong>${sale.totalAmount.toFixed(0)}</strong></p>
          <p>Pagado: ${sale.paidAmount.toFixed(0)}</p>
          <p className="mt-1 text-xs">Factura N.º {sale.id}</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-4">
        <Button onClick={handlePrint} type="primary">
          Imprimir
        </Button>
        {/* Puedes agregar otro botón si quieres permitir descarga en PDF en el futuro */}
      </div>
    </div>
  )
}

export default ReceiptView
