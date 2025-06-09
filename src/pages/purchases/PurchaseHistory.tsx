import { Card, Table, Typography, Tag } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'

const PurchaseHistory = () => {
  const purchases = useSelector((state: RootState) => state.purchases)
  const providers = useSelector((state: RootState) => state.providers)
  const products = useSelector((state: RootState) => state.products)

  const dataSource = purchases.map((purchase) => {
    const provider = providers.find(p => p.id === purchase.providerId)
    return {
      key: purchase.id,
      date: new Date(purchase.date).toLocaleString(),
      providerName: provider?.name || 'No encontrado',
      total: purchase.total,
      details: purchase.details.map(detail => {
        const product = products.find(p => p.id === detail.productId)
        return `${product?.name || 'Producto'} (${detail.quantity} x $${detail.unitPrice})`
      }),
    }
  })

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
    },
    {
      title: 'Proveedor',
      dataIndex: 'providerName',
    },
    {
      title: 'Productos',
      dataIndex: 'details',
      render: (details: string[]) =>
        details.map((d, i) => (
          <Tag key={i} color="blue" className="mb-1">
            {d}
          </Tag>
        )),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (value: number) => `$${value.toFixed(2)}`,
    },
  ]

  return (
    <div className="p-8">
      <Typography.Title level={3}>Historial de Compras</Typography.Title>
      <Card>
        <Table
          columns={columns}
          dataSource={dataSource}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  )
}

export default PurchaseHistory
