import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Checkbox, message, Space, Typography, Divider } from 'antd';
import { SettingOutlined, EditOutlined } from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchRoles } from '../../features/roles/rolesSlice';
import { fetchAllModules, updateRolePermissions } from '../../features/permissions/permissionsSlice';
import { selectAllModules } from '../../features/permissions/permissionsSlice';
import permissionsService from '../../services/permissionsService';
import type { Module } from '../../services/permissionsService';

const { Title, Text } = Typography;

const RolePermissionsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: roles } = useAppSelector((state) => state.roles);
  const allModules = useAppSelector(selectAllModules);
  
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchRoles());
    dispatch(fetchAllModules());
  }, [dispatch]);

  const handleEditPermissions = async (role: any) => {
    setSelectedRole(role);
    setLoading(true);
    
    try {
      const permissions = await permissionsService.getRolePermissions(role.id);
      
      // Preparar valores para el formulario
      const formValues: any = {};
      permissions.forEach(permission => {
        const moduleKey = permission.module.name;
        formValues[`${moduleKey}_canView`] = permission.canView;
        formValues[`${moduleKey}_canCreate`] = permission.canCreate;
        formValues[`${moduleKey}_canEdit`] = permission.canEdit;
        formValues[`${moduleKey}_canDelete`] = permission.canDelete;
        formValues[`${moduleKey}_canExport`] = permission.canExport;
      });
      
      form.setFieldsValue(formValues);
      setIsModalVisible(true);
    } catch (error) {
      message.error('Error al cargar permisos del rol');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      const formValues = await form.validateFields();
      setLoading(true);

      // Convertir valores del formulario a formato de permisos
      const permissions = allModules.map(module => {
        const moduleKey = module.name;
        return {
          moduleId: module.id,
          canView: formValues[`${moduleKey}_canView`] || false,
          canCreate: formValues[`${moduleKey}_canCreate`] || false,
          canEdit: formValues[`${moduleKey}_canEdit`] || false,
          canDelete: formValues[`${moduleKey}_canDelete`] || false,
          canExport: formValues[`${moduleKey}_canExport`] || false,
        };
      });

      await dispatch(updateRolePermissions({
        roleId: selectedRole.id,
        permissions
      })).unwrap();

      message.success('Permisos actualizados correctamente');
      setIsModalVisible(false);
      setSelectedRole(null);
    } catch (error) {
      message.error('Error al actualizar permisos');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Rol',
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
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => handleEditPermissions(record)}
            loading={loading && selectedRole?.id === record.id}
          >
            Configurar Permisos
          </Button>
        </Space>
      ),
    },
  ];

  // Agrupar módulos por padre
  const mainModules = allModules.filter(module => !module.parentId);
  const getChildModules = (parentId: number) => allModules.filter(module => module.parentId === parentId);

  const renderPermissionCheckboxes = (module: Module, isChild = false) => {
    const moduleKey = module.name;
    const indent = isChild ? { marginLeft: '24px' } : {};
    
    return (
      <div key={module.id} style={{ marginBottom: '16px', ...indent }}>
        <Title level={isChild ? 5 : 4} style={{ marginBottom: '8px' }}>
          {module.displayName}
        </Title>
        {module.description && (
          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '8px' }}>
            {module.description}
          </Text>
        )}
        
        <Space>
          <Form.Item name={`${moduleKey}_canView`} valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>Ver</Checkbox>
          </Form.Item>
          
          <Form.Item name={`${moduleKey}_canCreate`} valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>Crear</Checkbox>
          </Form.Item>
          
          <Form.Item name={`${moduleKey}_canEdit`} valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>Editar</Checkbox>
          </Form.Item>
          
          <Form.Item name={`${moduleKey}_canDelete`} valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>Eliminar</Checkbox>
          </Form.Item>
          
          <Form.Item name={`${moduleKey}_canExport`} valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>Exportar</Checkbox>
          </Form.Item>
        </Space>
      </div>
    );
  };

  return (
    <>
      <Card 
        title={
          <Space>
            <SettingOutlined />
            Gestión de Roles y Permisos
          </Space>
        }
        style={{ margin: '24px' }}
      >
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={`Configurar Permisos - ${selectedRole?.name}`}
        open={isModalVisible}
        onOk={handleSavePermissions}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedRole(null);
        }}
        width={800}
        confirmLoading={loading}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            {mainModules.map(module => {
              const childModules = getChildModules(module.id);
              
              return (
                <div key={module.id}>
                  {renderPermissionCheckboxes(module)}
                  
                  {childModules.map(child => renderPermissionCheckboxes(child, true))}
                  
                  {mainModules.indexOf(module) < mainModules.length - 1 && (
                    <Divider style={{ margin: '16px 0' }} />
                  )}
                </div>
              );
            })}
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default RolePermissionsManager;
