import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { Table, Typography, Tag, Button } from 'antd'
import dayjs from 'dayjs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const SalesHistory = () => {
  const sales = useSelector((state: RootState) => state.sales.items)

  const downloadInvoice = (sale: any) => {
    const doc = new jsPDF()

    doc.text('Factura de Venta', 14, 20)
    doc.setFontSize(11)
    doc.text(`Cliente: ${sale.clientName || 'No registrado'}`, 14, 30)
    doc.text(`Fecha: ${dayjs(sale.date).format('YYYY-MM-DD HH:mm')}`, 14, 36)
    doc.text(`Método de pago: ${sale.paymentMethod}`, 14, 42)
    doc.text(`Total: $${sale.total}`, 14, 48)

    autoTable(doc, {
      startY: 55,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      body: sale.details.map((d: any) => [
        `Producto ${d.productId}`,
        d.quantity,
        `$${d.unitPrice}`,
        `$${(d.unitPrice * d.quantity).toFixed(2)}`
      ]),
    })

    doc.save(`factura_${sale.id}.pdf`)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Cliente',
      dataIndex: 'clientName',
      render: (text: string) => text || <i>No registrado</i>,
    },
    {
      title: 'Método de pago',
      dataIndex: 'paymentMethod',
      render: (method: string) => <Tag color="blue">{method}</Tag>,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Acciones',
      render: (_: any, sale: any) => (
        <Button onClick={() => downloadInvoice(sale)}>Descargar factura</Button>
      ),
    },
  ]

  return (
    <div className="p-8">
      <Typography.Title level={3}>Historial de Ventas</Typography.Title>
      <Table
        dataSource={sales}
        columns={columns}
        rowKey="id"
        pagination={{ pageSize: 8 }}
      />
    </div>
  )
}

export default SalesHistory
