import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchRoles, deleteRole } from '../../features/roles/rolesSlice';
import PermissionGuard from '../../components/PermissionGuard';
import RoleForm from '../../components/roles/RoleForm';

const { Title } = Typography;

const RolesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: roles, loading } = useAppSelector((state) => state.roles);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  const handleCreate = () => {
    setSelectedRole(null);
    setIsModalVisible(true);
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setIsModalVisible(true);
  };

  const handleDelete = async (roleId: number, roleName: string) => {
    try {
      await dispatch(deleteRole(roleId)).unwrap();
      message.success(`Rol "${roleName}" eliminado correctamente`);
    } catch (error) {
      message.error('Error al eliminar el rol');
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedRole(null);
  };

  const handleRoleSaved = () => {
    dispatch(fetchRoles());
  };

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Acciones',
      key: 'actions',
      render: (_: any, record: any) => {
        // No permitir eliminar roles del sistema
        const systemRoles = ['SUPER_ADMIN', 'ADMIN'];
        const canDelete = !systemRoles.includes(record.name);
        
        return (
          <Space>
            <PermissionGuard moduleName="roles" action="edit" fallback={null}>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                size="small"
              >
                Editar
              </Button>
            </PermissionGuard>
            
            {canDelete && (
              <PermissionGuard moduleName="roles" action="delete" fallback={null}>
                <Popconfirm
                  title="¿Eliminar rol?"
                  description={`¿Estás seguro de eliminar el rol "${record.name}"?`}
                  onConfirm={() => handleDelete(record.id, record.name)}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button 
                    type="default" 
                    danger
                    icon={<DeleteOutlined />}
                    size="small"
                  >
                    Eliminar
                  </Button>
                </Popconfirm>
              </PermissionGuard>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <PermissionGuard moduleName="roles" action="view">
      <div style={{ padding: '24px' }}>
        <Card 
          title={
            <Space>
              <SafetyCertificateOutlined />
              <Title level={3} style={{ margin: 0 }}>Gestión de Roles</Title>
            </Space>
          }
          extra={
            <PermissionGuard moduleName="roles" action="create" fallback={null}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleCreate}
              >
                Crear Rol
              </Button>
            </PermissionGuard>
          }
        >
          <Table
            dataSource={roles}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} roles`,
            }}
          />
        </Card>

        <RoleForm
          open={isModalVisible}
          onClose={handleModalClose}
          role={selectedRole}
          onSaved={handleRoleSaved}
        />
      </div>
    </PermissionGuard>
  );
};

export default RolesPage;
