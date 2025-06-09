import { Card, Col, Row, Select, Typography } from 'antd'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import dayjs from 'dayjs'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useMemo, useState } from 'react'

const { Title } = Typography

const DashboardHome = () => {
  const currentYear = dayjs().year()
  const [year, setYear] = useState(currentYear)

  const sales = useSelector((state: RootState) => state.sales.items)
  const expenses = useSelector((state: RootState) => state.expenses.items)

  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ]

  const monthlyData = useMemo(() => {
    return months.map((mes, i) => {
      const month = i + 1

      const ventasMes = sales.filter(s =>
        dayjs(s.date).year() === year && dayjs(s.date).month() + 1 === month
      )
      const egresosMes = expenses.filter(e =>
        dayjs(e.date).year() === year && dayjs(e.date).month() + 1 === month
      )

      const ingresos = ventasMes.reduce((sum, v) => sum + v.total, 0)
      const egresos = egresosMes.reduce((sum, e) => sum + e.amount, 0)
      const utilidad = ingresos - egresos

      return {
        mes,
        ingresos,
        egresos,
        utilidad,
      }
    })
  }, [year, sales, expenses])

  const resumenMesActual = monthlyData[dayjs().month()]

  return (
    <div className="p-8">
      <Title level={3}>Dashboard General ({year})</Title>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="text-sm font-semibold">Seleccionar año:</span>
        <Select
          value={year}
          onChange={setYear}
          options={Array.from({ length: 5 }, (_, i) => ({
            label: `${currentYear - i}`,
            value: currentYear - i,
          }))}
          style={{ width: 120 }}
        />
      </div>

      {/* KPI Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card title="Ventas del mes" bordered={false}>
            <span className="text-green-600 font-semibold text-xl">
              ${resumenMesActual?.ingresos?.toLocaleString() || 0}
            </span>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Egresos del mes" bordered={false}>
            <span className="text-red-600 font-semibold text-xl">
              ${resumenMesActual?.egresos?.toLocaleString() || 0}
            </span>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Utilidad del mes" bordered={false}>
            <span className={`font-semibold text-xl ${resumenMesActual?.utilidad >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${resumenMesActual?.utilidad?.toLocaleString() || 0}
            </span>
          </Card>
        </Col>
      </Row>

      {/* Gráfica de barras */}
      <Card title="Resumen mensual del año">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="ingresos" fill="#82ca9d" name="Ventas" />
            <Bar dataKey="egresos" fill="#f87171" name="Egresos" />
            <Bar dataKey="utilidad" fill="#8884d8" name="Utilidad" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

export default DashboardHome
