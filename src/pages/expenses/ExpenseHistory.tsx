import { Card, Table, Typography } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import dayjs from 'dayjs'

const ExpenseHistory = () => {
  const expenses = useSelector((state: RootState) => state.expenses)

  const dataSource = Array.isArray(expenses) ? expenses.map(exp => ({
    ...exp,
    key: exp.id,
    formattedDate: dayjs(exp.date).format('YYYY-MM-DD'),
  })) : []

  const totalEgresos = Array.isArray(expenses) ? expenses.reduce((acc, e) => acc + e.amount, 0) : 0

  return (
    <div className="p-8">
      <Typography.Title level={3}>Historial de Egresos</Typography.Title>
      <Card>
        <Table
          dataSource={dataSource}
          pagination={{ pageSize: 5 }}
          columns={[
            { title: 'Fecha', dataIndex: 'formattedDate' },
            { title: 'Tipo', dataIndex: 'type' },
            { title: 'Descripción', dataIndex: 'description' },
            { title: 'Monto', dataIndex: 'amount', render: (v) => `$${v.toFixed(2)}` },
          ]}
        />
        <div className="text-right font-bold mt-4 text-lg">
          Total: ${totalEgresos.toFixed(2)}
        </div>
      </Card>
    </div>
  )
}

export default ExpenseHistory
