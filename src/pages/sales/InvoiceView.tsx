import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import dayjs from 'dayjs'

const InvoiceView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const sales = useSelector((state: RootState) => state.sales.items)
  const products = useSelector((state: RootState) => state.products)

  const sale = sales.find(s => s.id.toString() === id)

  if (!sale) {
    return <div className="p-8 text-red-600">Factura no encontrada</div>
  }

  const getProductName = (productId: number) =>
    products.find(p => p.id === productId)?.name || `Producto ${productId}`

  const total = sale.details.reduce(
    (acc, d) => acc + d.quantity * d.unitPrice,
    0
  )

  return (
    <div className="p-4 bg-white max-w-md mx-auto text-xs font-mono" id="print-area">
      <div className="text-center mb-4">
        <img
          src="/logo-milan.png"
          alt="Milán Fragancias"
          className="h-20 mx-auto"
        />
        <h1 className="text-lg font-bold mt-2">Milán Fragancias</h1>
        <p className="text-[11px] text-gray-500">Centro de Cali, Colombia</p>
        <p className="text-[11px] text-gray-500">NIT 123.456.789-0</p>
        <hr className="my-2" />
      </div>

      <div className="mb-2">
        <p><strong>Factura N°:</strong> {sale.id}</p>
        <p><strong>Fecha:</strong> {dayjs(sale.date).format('YYYY-MM-DD HH:mm')}</p>
        <p><strong>Cliente:</strong> {sale.clientName || 'No registrado'}</p>
        <p><strong>Medio de pago:</strong> {sale.paymentMethod}</p>
      </div>

      <hr className="my-2" />

      <table className="w-full mb-2">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left">Producto</th>
            <th className="text-right">Cant</th>
            <th className="text-right">Precio</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.details.map((item, index) => (
            <tr key={index} className="border-b border-dashed">
              <td>{getProductName(item.productId)}</td>
              <td className="text-right">{item.quantity}</td>
              <td className="text-right">${item.unitPrice}</td>
              <td className="text-right">
                ${(item.quantity * item.unitPrice).toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-right font-bold mt-2">
        Total: ${total.toFixed(0)}
      </div>

      <div className="text-center text-[11px] mt-4">
        ¡Gracias por tu compra! <br />
        Síguenos en Instagram: @milanfragancias
      </div>

      <div className="mt-6 flex justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-1 border border-gray-300 rounded text-sm"
        >
          Volver
        </button>
        <button
          onClick={() => window.print()}
          className="px-4 py-1 bg-black text-white rounded text-sm"
        >
          Imprimir
        </button>
      </div>
    </div>
  )
}

export default InvoiceView
