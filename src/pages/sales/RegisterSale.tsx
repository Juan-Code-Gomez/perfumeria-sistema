import { useState } from 'react'
import { Card, Form, Input, InputNumber, Button, Select, Divider, Typography, Table, message } from 'antd'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
// import { registerSale } from '../../features/sales/salesSlice'

const RegisterSale = () => {
  const [form] = Form.useForm()
  const dispatch = useDispatch()
  const products = useSelector((state: RootState) => state.products)
  const [selectedProducts, setSelectedProducts] = useState<any[]>([])

  const handleAddProduct = (values: any) => {
    const product = products.find(p => p.id === values.productId)
    if (!product) return

    const alreadyExists = selectedProducts.some(p => p.productId === values.productId)
    if (alreadyExists) {
      message.warning('Este producto ya fue agregado.')
      return
    }

    setSelectedProducts([
      ...selectedProducts,
      {
        productId: product.id,
        name: product.name,
        quantity: values.quantity,
        unitPrice: values.unitPrice,
        total: values.quantity * values.unitPrice,
      },
    ])
    form.resetFields(['productId', 'quantity', 'unitPrice'])
  }

  const handleRemoveProduct = (productId: number) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId))
  }

  const handleSubmit = (values: any) => {
    const total = selectedProducts.reduce((acc, curr) => acc + curr.total, 0)
    const sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      clientName: values.clientName || '',
      paymentMethod: values.paymentMethod,
      userId: 1, // Simulado
      total,
      details: selectedProducts.map(p => ({
        productId: p.productId,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
      })),
    }

    // dispatch(registerSale(sale))
    message.success('Venta registrada con éxito')
    setSelectedProducts([])
    form.resetFields()
  }

  const columns = [
    { title: 'Producto', dataIndex: 'name' },
    { title: 'Cantidad', dataIndex: 'quantity' },
    { title: 'Precio Unitario', dataIndex: 'unitPrice' },
    { title: 'Total', dataIndex: 'total' },
    {
      title: '',
      render: (_: any, record: any) => (
        <Button danger type="link" onClick={() => handleRemoveProduct(record.productId)}>
          Eliminar
        </Button>
      ),
    },
  ]

  const totalVenta = selectedProducts.reduce((acc, curr) => acc + curr.total, 0)

  return (
    <div className="p-8">
      <Typography.Title level={3}>Registrar Venta</Typography.Title>
      <Card className="mb-6">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item label="Cliente" name="clientName">
              <Input placeholder="Nombre del cliente (opcional)" />
            </Form.Item>
            <Form.Item label="Método de pago" name="paymentMethod" rules={[{ required: true, message: 'Requerido' }]}>
              <Select placeholder="Selecciona un método">
                <Select.Option value="efectivo">Efectivo</Select.Option>
                <Select.Option value="transferencia">Transferencia</Select.Option>
                <Select.Option value="otro">Otro</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Divider>Agregar productos</Divider>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item name="productId" label="Producto" rules={[{ required: true }]}>
              <Select placeholder="Seleccione un producto">
                {products.map(p => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="quantity" label="Cantidad" rules={[{ required: true }]}>
              <InputNumber min={1} className="w-full" />
            </Form.Item>

            <Form.Item name="unitPrice" label="Precio unitario" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item>
            <Button type="dashed" htmlType="button" onClick={() => form.validateFields(['productId', 'quantity', 'unitPrice']).then(handleAddProduct)}>
              Agregar producto
            </Button>
          </Form.Item>

          <Table columns={columns} dataSource={selectedProducts} rowKey="productId" pagination={false} />

          <div className="text-right mt-4 font-semibold text-lg">
            Total: ${totalVenta.toFixed(2)}
          </div>

          <Form.Item className="mt-6">
            <Button type="primary" htmlType="submit" disabled={selectedProducts.length === 0}>
              Registrar venta
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterSale
