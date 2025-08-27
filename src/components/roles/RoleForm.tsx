import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Checkbox, Card, Row, Col, Space, Typography, Divider, message } from 'antd';
import { useAppDispatch, useAppSelector } from '../../store';
import { fetchAllModules } from '../../features/permissions/permissionsSlice';
import { selectAllModules } from '../../features/permissions/permissionsSlice';
import { createRole, updateRole } from '../../features/roles/rolesSlice';
import permissionsService from '../../services/permissionsService';
import type { Module } from '../../services/permissionsService';

const { Title, Text } = Typography;

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  role?: any;
  onSaved?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ open, onClose, role, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const allModules = useAppSelector(selectAllModules);
  const [loading, setLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!allModules.length) {
      dispatch(fetchAllModules());
    }
  }, [dispatch, allModules.length]);

  useEffect(() => {
    if (open) {
      if (role) {
        // Modo edición
        form.setFieldsValue({
          name: role.name,
          description: role.description,
        });
        loadRolePermissions(role.id);
      } else {
        // Modo creación
        form.resetFields();
        setSelectedPermissions({});
      }
    }
  }, [open, role, form]);

  const loadRolePermissions = async (roleId: number) => {
    try {
      const permissions = await permissionsService.getRolePermissions(roleId);
      const permissionsMap: Record<string, any> = {};
      
      permissions.forEach(permission => {
        const moduleName = permission.module.name;
        permissionsMap[moduleName] = {
          canView: permission.canView,
          canCreate: permission.canCreate,
          canEdit: permission.canEdit,
          canDelete: permission.canDelete,
          canExport: permission.canExport,
        };
      });
      
      setSelectedPermissions(permissionsMap);
    } catch (error) {
      message.error('Error al cargar permisos del rol');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let savedRole;
      if (role) {
        // Actualizar rol existente
        savedRole = await dispatch(updateRole({ id: role.id, data: values })).unwrap();
      } else {
        // Crear nuevo rol
        savedRole = await dispatch(createRole(values)).unwrap();
      }

      // Actualizar permisos del rol
      const permissions = allModules.map(module => ({
        moduleId: module.id,
        canView: selectedPermissions[module.name]?.canView || false,
        canCreate: selectedPermissions[module.name]?.canCreate || false,
        canEdit: selectedPermissions[module.name]?.canEdit || false,
        canDelete: selectedPermissions[module.name]?.canDelete || false,
        canExport: selectedPermissions[module.name]?.canExport || false,
      }));

      await permissionsService.updateRolePermissions(savedRole.id, permissions);

      message.success(`Rol ${role ? 'actualizado' : 'creado'} correctamente`);
      onSaved?.();
      onClose();
    } catch (error) {
      message.error(`Error al ${role ? 'actualizar' : 'crear'} el rol`);
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (moduleName: string, permission: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [permission]: checked,
      }
    }));
  };

  const handleSelectAllModule = (moduleName: string, checked: boolean) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [moduleName]: {
        canView: checked,
        canCreate: checked,
        canEdit: checked,
        canDelete: checked,
        canExport: checked,
      }
    }));
  };

  // Organizar módulos por jerarquía
  const mainModules = allModules.filter(module => !module.parentId);
  const getChildModules = (parentId: number) => allModules.filter(module => module.parentId === parentId);

  const renderModulePermissions = (module: Module, isChild = false) => {
    const moduleName = module.name;
    const permissions = selectedPermissions[moduleName] || {};
    const indent = isChild ? 24 : 0;

    return (
      <Card 
        key={module.id}
        size="small" 
        style={{ marginBottom: 16, marginLeft: indent }}
        title={
          <Space>
            <Checkbox
              checked={permissions.canView && permissions.canCreate && permissions.canEdit && permissions.canDelete && permissions.canExport}
              indeterminate={Object.values(permissions).some(Boolean) && !Object.values(permissions).every(Boolean)}
              onChange={(e) => handleSelectAllModule(moduleName, e.target.checked)}
            >
              <strong>{module.displayName}</strong>
            </Checkbox>
          </Space>
        }
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {module.description}
          </Text>
        }
      >
        <Row gutter={[16, 8]}>
          <Col span={4}>
            <Checkbox
              checked={permissions.canView || false}
              onChange={(e) => handlePermissionChange(moduleName, 'canView', e.target.checked)}
            >
              Ver
            </Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox
              checked={permissions.canCreate || false}
              onChange={(e) => handlePermissionChange(moduleName, 'canCreate', e.target.checked)}
            >
              Crear
            </Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox
              checked={permissions.canEdit || false}
              onChange={(e) => handlePermissionChange(moduleName, 'canEdit', e.target.checked)}
            >
              Editar
            </Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox
              checked={permissions.canDelete || false}
              onChange={(e) => handlePermissionChange(moduleName, 'canDelete', e.target.checked)}
            >
              Eliminar
            </Checkbox>
          </Col>
          <Col span={4}>
            <Checkbox
              checked={permissions.canExport || false}
              onChange={(e) => handlePermissionChange(moduleName, 'canExport', e.target.checked)}
            >
              Exportar
            </Checkbox>
          </Col>
        </Row>
      </Card>
    );
  };

  return (
    <Modal
      title={`${role ? 'Editar' : 'Crear'} Rol`}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      width={900}
      confirmLoading={loading}
      destroyOnClose
      okText={role ? 'Actualizar' : 'Crear'}
      cancelText="Cancelar"
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nombre del Rol"
              rules={[
                { required: true, message: 'Ingresa el nombre del rol' },
                { min: 2, message: 'Mínimo 2 caracteres' }
              ]}
            >
              <Input placeholder="Ej: GERENTE, VENDEDOR, etc." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="description"
              label="Descripción"
              rules={[{ required: true, message: 'Ingresa una descripción' }]}
            >
              <Input placeholder="Describe las responsabilidades del rol" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider>
        <Title level={4}>Permisos del Rol</Title>
      </Divider>

      <div style={{ maxHeight: '50vh', overflowY: 'auto', padding: '0 8px' }}>
        {mainModules.map(module => {
          const childModules = getChildModules(module.id);
          
          return (
            <div key={module.id}>
              {renderModulePermissions(module)}
              {childModules.map(child => renderModulePermissions(child, true))}
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default RoleForm;
