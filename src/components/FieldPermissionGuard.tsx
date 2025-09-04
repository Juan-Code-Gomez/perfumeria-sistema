// src/components/FieldPermissionGuard.tsx
import React from 'react';
import { useAppSelector } from '../store';

interface FieldPermissionGuardProps {
  children: React.ReactNode;
  showFor?: string[]; // Lista de roles que pueden ver este campo
  hideFor?: string[]; // Lista de roles que NO pueden ver este campo
  fallback?: React.ReactNode; // Componente a mostrar si no tiene permisos
}

const FieldPermissionGuard: React.FC<FieldPermissionGuardProps> = ({
  children,
  showFor = [],
  hideFor = [],
  fallback = null
}) => {
  // Obtener roles del usuario actual desde el store
  const user = useAppSelector(state => state.auth.user);
  const userRoles = user?.roles?.map(ur => ur.role.name) || [];

  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasAllowedRole = showFor.length === 0 || userRoles.some(role => showFor.includes(role));
  
  // Verificar si el usuario tiene alguno de los roles prohibidos
  const hasProhibitedRole = hideFor.length > 0 && userRoles.some(role => hideFor.includes(role));

  // Mostrar el campo solo si tiene rol permitido y no tiene rol prohibido
  const canShowField = hasAllowedRole && !hasProhibitedRole;

  if (!canShowField) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FieldPermissionGuard;
