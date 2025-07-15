import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { Card, Select, Table, Typography } from 'antd'
import dayjs from 'dayjs'

const { Title } = Typography

const ProfitSummary = () => {
  const currentYear = dayjs().year()
  const [year, setYear] = useState(currentYear)

  const sales = useSelector((state: RootState) => state.sales.items)
  const expenses = useSelector((state: RootState) => state.expenses.items)
  const purchases = useSelector((state: RootState) => state.purchases.items);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  const data = useMemo(() => {
    return months.map((_, i) => {
      const month = i + 1

      const ventasMes = sales.filter(s =>
        dayjs(s.date).year() === year && dayjs(s.date).month() + 1 === month
      )

      const egresosMes = expenses.filter(e =>
        dayjs(e.date).year() === year && dayjs(e.date).month() + 1 === month
      )

      const comprasMes = purchases.filter(p =>
        dayjs(p.date).year() === year && dayjs(p.date).month() + 1 === month
      )

      const ingresos = ventasMes.reduce((sum, v) => sum + v.total, 0)
      const egresos = egresosMes.reduce((sum, e) => sum + e.amount, 0)
      const costoProductos = comprasMes.reduce((sum, c) => sum + c.total, 0)

      const utilidad = ingresos - (egresos + costoProductos)

      return {
        key: i,
        mes: months[i],
        ingresos,
        egresos,
        costos: costoProductos,
        utilidad,
      }
    })
  }, [year, sales, expenses, purchases])

  const resumenAnual = data.reduce(
    (acc, mes) => ({
      ingresos: acc.ingresos + mes.ingresos,
      egresos: acc.egresos + mes.egresos,
      costos: acc.costos + mes.costos,
      utilidad: acc.utilidad + mes.utilidad,
    }),
    { ingresos: 0, egresos: 0, costos: 0, utilidad: 0 }
  )

  const columns = [
    { title: 'Mes', dataIndex: 'mes' },
    { title: 'Ingresos', dataIndex: 'ingresos', render: (v: number) => `$${v.toFixed(0)}` },
    { title: 'Egresos', dataIndex: 'egresos', render: (v: number) => `$${v.toFixed(0)}` },
    { title: 'Costos', dataIndex: 'costos', render: (v: number) => `$${v.toFixed(0)}` },
    {
      title: 'Utilidad Neta',
      dataIndex: 'utilidad',
      render: (v: number) => (
        <span className={v >= 0 ? 'text-green-600' : 'text-red-600'}>
          ${v.toFixed(0)}
        </span>
      ),
    },
  ]

  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="p-8">
      <Title level={3}>Resumen de Rentabilidad ({year})</Title>

      <div className="mb-4">
        <span className="mr-2 text-sm font-semibold">Seleccionar año:</span>
        <Select
          value={year}
          onChange={setYear}
          options={yearOptions.map(y => ({ label: y.toString(), value: y }))}
          style={{ width: 120 }}
        />
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}><strong>Total Anual</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={1}><strong>${resumenAnual.ingresos.toFixed(0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={2}><strong>${resumenAnual.egresos.toFixed(0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={3}><strong>${resumenAnual.costos.toFixed(0)}</strong></Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  <strong className={resumenAnual.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}>
                    ${resumenAnual.utilidad.toFixed(0)}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  )
}

export default ProfitSummary
