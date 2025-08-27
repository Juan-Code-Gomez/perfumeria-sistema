import api from './api';

export interface Module {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  route?: string;
  icon?: string;
  order: number;
  parentId?: number;
  permissions?: {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  };
}

export interface Permission {
  module: Module;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

const permissionsService = {
  // Obtener módulos accesibles para el usuario actual
  async getMyModules(): Promise<Module[]> {
    const response = await api.get('/permissions/my-modules');
    return response.data.data || response.data;
  },

  // Obtener permisos del usuario actual
  async getMyPermissions(): Promise<Permission[]> {
    const response = await api.get('/permissions/my-permissions');
    return response.data.data || response.data;
  },

  // Verificar si el usuario actual tiene un permiso específico
  async checkMyPermission(moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export'): Promise<boolean> {
    try {
      const response = await api.get(`/permissions/check/${moduleName}/${action}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  },

  // Obtener todos los módulos del sistema (para administradores)
  async getAllModules(): Promise<Module[]> {
    const response = await api.get('/permissions/modules');
    return response.data.data || response.data;
  },

  // Obtener permisos de un rol específico
  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const response = await api.get(`/permissions/roles/${roleId}`);
    return response.data.data || response.data;
  },

  // Actualizar permisos de un rol
  async updateRolePermissions(roleId: number, permissions: Array<{
    moduleId: number;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
  }>): Promise<Permission[]> {
    const response = await api.put(`/permissions/role/${roleId}/permissions`, permissions);
    return response.data.data || response.data;
  },

  // Obtener módulos de un usuario específico
  async getUserModules(userId: number): Promise<Module[]> {
    const response = await api.get(`/permissions/user/${userId}/modules`);
    return response.data.data || response.data;
  },

  // Obtener permisos de un usuario específico
  async getUserPermissions(userId: number): Promise<Permission[]> {
    const response = await api.get(`/permissions/user/${userId}`);
    return response.data.data || response.data;
  },
};

export default permissionsService;
