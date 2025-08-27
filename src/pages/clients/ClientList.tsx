import React, { useEffect, useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Modal, 
  Space, 
  Popconfirm, 
  message, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Tooltip, 
  Empty 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined, 
  PhoneOutlined, 
  MailOutlined, 
  IdcardOutlined,
  ReloadOutlined 
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/index';
import {
  searchClients,
  addClient,
  updateClient,
  removeClient,
} from '../../features/clients/clientSlice';
import ClientForm from '../../components/clients/ClientForm';
import type { Client } from '../../features/clients/types';

const { Title, Text } = Typography;

const ClientList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { clients, loading } = useSelector((state: RootState) => state.clients);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, [dispatch]);

  const loadClients = () => {
    dispatch(searchClients(''));
  };

  const handleSearch = (value: string) => {
    dispatch(searchClients(value));
  };

  const openNewModal = () => {
    setEditingClient(null);
    setModalVisible(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(removeClient(id)).unwrap();
      message.success('Cliente eliminado exitosamente');
      loadClients();
    } catch (error) {
      message.error('Error al eliminar el cliente');
      console.error('Error:', error);
    }
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingClient) {
        await dispatch(updateClient({ id: editingClient.id, data: values })).unwrap();
        message.success('Cliente actualizado exitosamente');
      } else {
        await dispatch(addClient(values)).unwrap();
        message.success('Cliente creado exitosamente');
      }
      setModalVisible(false);
      loadClients();
    } catch (error) {
      message.error('Error al guardar el cliente');
      console.error('Error:', error);
    }
  };

  const columns = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Client) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined style={{ color: '#1890ff' }} />
            <Text strong>{name}</Text>
          </div>
          {record.document && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <IdcardOutlined style={{ color: '#666', fontSize: '12px' }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                {record.document}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_: any, record: Client) => (
        <div>
          {record.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <PhoneOutlined style={{ color: '#52c41a' }} />
              <Text>{record.phone}</Text>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MailOutlined style={{ color: '#722ed1' }} />
              <Text>{record.email}</Text>
            </div>
          )}
          {!record.phone && !record.email && (
            <Text type="secondary">Sin contacto</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Dirección',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => (
        address ? (
          <Tooltip title={address}>
            <Text ellipsis style={{ maxWidth: 200 }}>
              {address}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">No especificada</Text>
        )
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_: any, record: Client) => {
        const hasContact = record.phone || record.email;
        return (
          <Tag color={hasContact ? 'green' : 'orange'}>
            {hasContact ? 'Completo' : 'Incompleto'}
          </Tag>
        );
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      render: (_: any, record: Client) => (
        <Space size="small">
          <Tooltip title="Editar cliente">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => openEditModal(record)}
              size="small"
            />
          </Tooltip>
          <Popconfirm
            title="¿Eliminar cliente?"
            description="Esta acción no se puede deshacer"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Tooltip title="Eliminar cliente">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          <UserOutlined style={{ marginRight: 8 }} />
          Gestión de Clientes
        </Title>
        <Text type="secondary">
          Administra la información de tus clientes
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                {clients.length}
              </Title>
              <Text type="secondary">Total Clientes</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#52c41a' }}>
                {clients.filter(c => c.phone || c.email).length}
              </Title>
              <Text type="secondary">Con Contacto</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card size="small">
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ margin: 0, color: '#fa8c16' }}>
                {clients.filter(c => !c.phone && !c.email).length}
              </Title>
              <Text type="secondary">Sin Contacto</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Input.Search
            placeholder="Buscar clientes por nombre..."
            onSearch={handleSearch}
            onChange={(e) => {
              if (!e.target.value) {
                handleSearch('');
              }
            }}
            enterButton={<SearchOutlined />}
            loading={loading}
            allowClear
            style={{ maxWidth: 300 }}
          />
          
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={loadClients}
              loading={loading}
            >
              Actualizar
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={openNewModal}
              size="middle"
            >
              Nuevo Cliente
            </Button>
          </Space>
        </div>

        {/* Table */}
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={clients}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} clientes`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No hay clientes registrados"
              />
            ),
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserOutlined />
            {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
          </div>
        }
        open={isModalVisible}
        footer={null}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <ClientForm
          initialValues={editingClient ?? undefined}
          onFinish={handleFormSubmit}
          loading={loading}
        />
      </Modal>
    </div>
  );
};

export default ClientList;
