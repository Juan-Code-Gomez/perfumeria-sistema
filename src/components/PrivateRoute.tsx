import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/index';  // tu hook useAppSelector

interface PrivateRouteProps {
  /** Roles permitidos. Si no se pasa, sólo valida autenticación */
  allowedRoles?: string[];
  /** Ruta a la que redirigir si no está autenticado */
  redirectTo?: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  allowedRoles,
  redirectTo = '/login',
}) => {
  const location = useLocation();
  const { token, user } = useAppSelector((state) => state.auth);

  // 1. Si no hay token, redirigir a login
  if (!token) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 2. Si se especifican roles y el usuario no tiene ninguno de ellos ➔ No autorizado
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user?.roles.map((ur: any) => ur.role.name) || [];
    const hasRole = allowedRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 3. Todo OK: renderiza el outlet (las rutas hijas)
  return <Outlet />;
};

export default PrivateRoute;
