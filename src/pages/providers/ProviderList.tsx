import { Button, Form, Input, Modal, Popconfirm, Table, message } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useState } from 'react'
import type { RootState } from '../../store'
import type { Provider } from '../../features/providers/types'
import { addProvider, deleteProvider, updateProvider } from '../../features/providers/providerSlice'

const ProviderList = () => {
  const dispatch = useDispatch()
  const providers = useSelector((state: RootState) => state.providers)
  const [form] = Form.useForm()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)

  const showAddModal = () => {
    setEditingProvider(null)
    form.resetFields()
    setIsModalOpen(true)
  }

  const showEditModal = (provider: Provider) => {
    setEditingProvider(provider)
    form.setFieldsValue(provider)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const onFinish = (values: any) => {
    if (editingProvider) {
      dispatch(updateProvider({ ...editingProvider, ...values }))
    } else {
      dispatch(addProvider({ ...values, id: Date.now() }))
    }
    handleCancel()
    message.success('Proveedor guardado correctamente')
  }

  const handleDelete = (id: number) => {
    dispatch(deleteProvider(id))
    message.success('Proveedor eliminado')
  }

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Teléfono',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: Provider) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => showEditModal(record)}>Editar</Button>
          <Popconfirm
            title="¿Eliminar proveedor?"
            okText="Sí"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">Eliminar</Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestión de Proveedores</h1>
        <Button type="primary" onClick={showAddModal}>Agregar Proveedor</Button>
      </div>

      <Table dataSource={providers} columns={columns} rowKey="id" />

      <Modal
        title={editingProvider ? 'Editar Proveedor' : 'Agregar Proveedor'}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Teléfono" name="phone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Dirección" name="address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Guardar
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProviderList
