import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { selectUserPermissions, selectUserModules } from '../features/permissions/permissionsSlice';
import type { Module } from '../services/permissionsService';

export const usePermissions = () => {
  const userPermissions = useAppSelector(selectUserPermissions);
  const userModules = useAppSelector(selectUserModules);
  const user = useAppSelector((state) => state.auth.user);
  
  // Verificar si el usuario tiene un rol específico por nombre
  const hasRole = (roleName: string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.some(userRole => userRole.role.name.toLowerCase() === roleName.toLowerCase());
  };
  
  // Verificar si el usuario tiene un permiso específico
  const hasPermission = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export'): boolean => {
    const permission = userPermissions.find(p => p.module.name === moduleName);
    
    if (!permission) {
      return false;
    }

    switch (action) {
      case 'view':
        return permission.canView;
      case 'create':
        return permission.canCreate;
      case 'edit':
        return permission.canEdit;
      case 'delete':
        return permission.canDelete;
      case 'export':
        return permission.canExport;
      default:
        return false;
    }
  };

  // Verificar si el usuario puede acceder a un módulo
  const canAccessModule = (moduleName: string): boolean => {
    return hasPermission(moduleName, 'view');
  };

  // Obtener módulos accesibles organizados para el menú
  const getAccessibleModules = (): Module[] => {
    return userModules.filter(module => canAccessModule(module.name));
  };

  // Verificar si es super admin
  const isSuperAdmin = (): boolean => {
    // Verificar por rol o por acceso a módulo system-admin
    return hasRole('superadmin') || hasRole('super-admin') || canAccessModule('system-admin');
  };

  // Verificar si es admin del cliente
  const isClientAdmin = (): boolean => {
    // Verificar por rol o por acceso a company-config
    return hasRole('admin') || (canAccessModule('company-config') && !canAccessModule('system-admin'));
  };

  // Verificar si es admin (cualquier tipo de administrador)
  const isAdmin = (): boolean => {
    // Es admin si tiene el rol admin/superadmin o tiene acceso a módulos administrativos
    return hasRole('admin') || hasRole('superadmin') || hasRole('super-admin') || 
           hasRole('administrador') || isSuperAdmin() || isClientAdmin();
  };

  return {
    hasPermission,
    hasRole,
    canAccessModule,
    getAccessibleModules,
    isSuperAdmin,
    isClientAdmin,
    isAdmin,
    userPermissions,
    userModules,
  };
};

// Hook para verificar permisos específicos de forma async
export const usePermissionCheck = (moduleName: string, action: 'view' | 'create' | 'edit' | 'delete' | 'export') => {
  const { hasPermission } = usePermissions();
  const [canPerform, setCanPerform] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      setIsLoading(true);
      const result = hasPermission(moduleName, action);
      setCanPerform(result);
      setIsLoading(false);
    };

    checkPermission();
  }, [moduleName, action, hasPermission]);

  return { canPerform, isLoading };
};
