import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Modal, Space, Popconfirm, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/index';
import {
  searchClients,
  addClient,
  updateClient,
  removeClient,
} from '../../features/clients/clientSlice';
import ClientForm from '../../components/clients/ClientForm';

const ClientList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, loading } = useSelector((state: RootState) => state.clients);

  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);

  useEffect(() => {
    dispatch(searchClients(''));
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    dispatch(searchClients(value));
  };

  const openNewModal = () => {
    setEditingClient(null);
    setModalVisible(true);
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(removeClient(id)).unwrap();
      message.success('Cliente eliminado');
      dispatch(searchClients(searchText));
    } catch {
      message.error('Error al eliminar');
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingClient) {
        await dispatch(updateClient({ id: editingClient.id, data: values })).unwrap();
        message.success('Cliente actualizado');
      } else {
        await dispatch(addClient(values)).unwrap();
        message.success('Cliente creado');
      }
      setModalVisible(false);
      dispatch(searchClients(searchText));
    } catch {
      message.error('Error al guardar');
    }
  };

  const columns = [
    { title: 'Nombre', dataIndex: 'name', key: 'name' },
    { title: 'Documento', dataIndex: 'document', key: 'document' },
    { title: 'Teléfono', dataIndex: 'phone', key: 'phone' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button onClick={() => openEditModal(record)}>Editar</Button>
          <Popconfirm
            title="¿Eliminar cliente?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger>Eliminar</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Buscar clientes"
          onSearch={handleSearch}
          enterButton
          loading={loading}
          allowClear
        />
        <Button type="primary" onClick={openNewModal}>
          Nuevo Cliente
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={clients}
      />

      <Modal
        title={editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
        open={isModalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <ClientForm
          initialValues={editingClient ?? undefined}
          onFinish={handleFormSubmit}
        />
      </Modal>
    </>
  );
};

export default ClientList;
