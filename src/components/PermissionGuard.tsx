import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  moduleName: string;
  action?: 'view' | 'create' | 'edit' | 'delete' | 'export';
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  children, 
  moduleName, 
  action = 'view',
  fallback 
}) => {
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();

  const hasAccess = hasPermission(moduleName, action);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Result
        status="403"
        title="403"
        subTitle="Lo siento, no tienes autorización para acceder a esta página."
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Ir al Dashboard
          </Button>
        }
      />
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
