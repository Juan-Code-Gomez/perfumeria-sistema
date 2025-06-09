import { Button, Card, Form, InputNumber, Select, Table, Typography, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { useState } from 'react'
import type { Purchase, PurchaseDetail } from '../../features/purchases/types'
import { registerPurchase } from '../../features/purchases/purchaseSlice'
import { updateProduct } from '../../features/products/productSlice'

const RegisterPurchase = () => {
  const dispatch = useDispatch()
  const providers = useSelector((state: RootState) => state.providers)
  const products = useSelector((state: RootState) => state.products)

  const [form] = Form.useForm()
  const [details, setDetails] = useState<PurchaseDetail[]>([])

  const addProductToPurchase = (productId: number, quantity: number, unitPrice: number) => {
    const exists = details.find(d => d.productId === productId)
    if (exists) {
      setDetails(prev => prev.map(d =>
        d.productId === productId ? { ...d, quantity: d.quantity + quantity, unitPrice } : d
      ))
    } else {
      setDetails(prev => [...prev, { productId, quantity, unitPrice }])
    }
  }

  const handleRemove = (productId: number) => {
    setDetails(prev => prev.filter(p => p.productId !== productId))
  }

  const calculateTotal = () => {
    return details.reduce((acc, d) => acc + (d.quantity * d.unitPrice), 0)
  }

  const onFinish = (values: any) => {
    if (!details.length) return message.error('Agrega al menos un producto')

    const newPurchase: Purchase = {
      id: Date.now(),
      providerId: values.providerId,
      date: new Date().toISOString(),
      total: calculateTotal(),
      details,
    }

    // Registrar compra
    dispatch(registerPurchase(newPurchase))

    // Aumentar stock de cada producto
    details.forEach(d => {
      const product = products.find(p => p.id === d.productId)
      if (product) {
        dispatch(updateProduct({
          ...product,
          stock: product.stock + d.quantity
        }))
      }
    })

    form.resetFields()
    setDetails([])
    message.success('Compra registrada con éxito')
  }

  const productOptions = products.map(p => ({
    label: `${p.name} (${p.unit})`,
    value: p.id,
  }))

  return (
    <div className="p-8">
      <Typography.Title level={3}>Registrar Compra</Typography.Title>

      <Card className="mb-6">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Proveedor" name="providerId" rules={[{ required: true }]}>
            <Select
              options={providers.map(p => ({ label: p.name, value: p.id }))}
              placeholder="Selecciona un proveedor"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Form.Item label="Producto" name="productId" rules={[{ required: true }]}>
              <Select options={productOptions} placeholder="Selecciona producto" />
            </Form.Item>
            <Form.Item label="Cantidad" name="quantity" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={1} />
            </Form.Item>
            <Form.Item label="Precio unitario" name="unitPrice" rules={[{ required: true }]}>
              <InputNumber className="w-full" min={0} />
            </Form.Item>
          </div>

          <Button
            onClick={() => {
              const { productId, quantity, unitPrice } = form.getFieldsValue()
              if (productId && quantity && unitPrice) {
                addProductToPurchase(productId, quantity, unitPrice)
                form.setFieldsValue({ productId: null, quantity: null, unitPrice: null })
              }
            }}
            className="mb-4"
            type="dashed"
            block
          >
            Agregar producto a la compra
          </Button>

          <Table
            dataSource={details.map(d => {
              const product = products.find(p => p.id === d.productId)
              return {
                ...d,
                key: d.productId,
                name: product?.name,
                unit: product?.unit,
                total: d.quantity * d.unitPrice
              }
            })}
            pagination={false}
            columns={[
              { title: 'Producto', dataIndex: 'name' },
              { title: 'Unidad', dataIndex: 'unit' },
              { title: 'Cantidad', dataIndex: 'quantity' },
              { title: 'Precio unitario', dataIndex: 'unitPrice', render: (v) => `$${v}` },
              { title: 'Total', dataIndex: 'total', render: (v) => `$${v}` },
              {
                title: 'Acción',
                render: (_, record) => (
                  <Button type="link" danger onClick={() => handleRemove(record.key)}>
                    Eliminar
                  </Button>
                )
              }
            ]}
          />

          <div className="text-right mt-4 font-semibold text-lg">
            Total: ${calculateTotal()}
          </div>

          <Form.Item className="mt-4">
            <Button type="primary" htmlType="submit" block>
              Registrar compra
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default RegisterPurchase
