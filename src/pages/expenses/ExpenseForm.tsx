import { Button, Card, Form, Input, InputNumber, Select, DatePicker, message } from 'antd'
import { useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import { registerExpense } from '../../features/expenses/expenseSlice'

const ExpenseForm = () => {
  const dispatch = useDispatch()

  const onFinish = (values: any) => {
    const expense = {
      id: Date.now(),
      type: values.type,
      amount: values.amount,
      date: values.date.toISOString(),
      description: values.description,
      userId: 1, // mock usuario admin
    }
    dispatch(registerExpense(expense))
    message.success('Egreso registrado con éxito')
  }

  return (
    <Card title="Registrar Egreso" className="mb-6">
      <Form layout="vertical" onFinish={onFinish} initialValues={{ date: dayjs() }}>
        <Form.Item label="Tipo de gasto" name="type" rules={[{ required: true }]}>
          <Select placeholder="Selecciona el tipo">
            <Select.Option value="arriendo">Arriendo</Select.Option>
            <Select.Option value="servicios">Servicios</Select.Option>
            <Select.Option value="compras">Compras varias</Select.Option>
            <Select.Option value="salario">Salario</Select.Option>
            <Select.Option value="otro">Otro</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item label="Monto" name="amount" rules={[{ required: true }]}>
          <InputNumber min={0} prefix="$" className="w-full" />
        </Form.Item>

        <Form.Item label="Fecha" name="date" rules={[{ required: true }]}>
          <DatePicker className="w-full" format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item label="Descripción" name="description">
          <Input.TextArea rows={2} placeholder="Detalle del gasto" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Guardar egreso
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default ExpenseForm
