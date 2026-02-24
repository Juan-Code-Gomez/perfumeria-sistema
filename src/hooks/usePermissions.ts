import { useEffect, useState } from 'react';
import { useAppSelector } from '../store';
import { selectUserPermissions, selectUserModules } from '../features/permissions/permissionsSlice';
import type { Module } from '../services/permissionsService';

export const usePermissions = () => {
  const userPermissions = useAppSelector(selectUserPermissions);
  const userModules = useAppSelector(selectUserModules);
  
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
    // Esto se podría implementar verificando los roles del usuario
    // Por ahora, asumimos que si tiene acceso a 'system-admin', es super admin
    return canAccessModule('system-admin');
  };

  // Verificar si es admin del cliente
  const isClientAdmin = (): boolean => {
    // Admin del cliente tiene acceso a la mayoría de módulos pero no a system-admin
    return canAccessModule('company-config') && !canAccessModule('system-admin');
  };

  // Verificar si es admin (cualquier tipo de administrador)
  const isAdmin = (): boolean => {
    // Es admin si es super admin o client admin
    return isSuperAdmin() || isClientAdmin();
  };

  return {
    hasPermission,
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
