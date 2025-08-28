// src/components/DynamicSidebarMenu.tsx
import React from 'react';
import { Menu } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  TagsOutlined,
  NumberOutlined,
  ControlOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  PieChartOutlined,
  WalletOutlined,
  FileTextOutlined,
  ShopOutlined,
  DollarOutlined,
  FileDoneOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  CreditCardOutlined: <CreditCardOutlined />,
  ShoppingOutlined: <ShoppingOutlined />,
  AppstoreOutlined: <AppstoreOutlined />,
  UserOutlined: <UserOutlined />,
  TeamOutlined: <TeamOutlined />,
  ShopOutlined: <ShopOutlined />,
  DollarOutlined: <DollarOutlined />,
  FileDoneOutlined: <FileDoneOutlined />,
  WalletOutlined: <WalletOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SettingOutlined: <SettingOutlined />,
  TagsOutlined: <TagsOutlined />,
  GiftOutlined: <GiftOutlined />,
  NumberOutlined: <NumberOutlined />,
  ControlOutlined: <ControlOutlined />,
  UsergroupAddOutlined: <UsergroupAddOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
};

interface DynamicSidebarMenuProps {
  onLogout: () => void;
}

const DynamicSidebarMenu: React.FC<DynamicSidebarMenuProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { getAccessibleModules, isSuperAdmin, userModules } = usePermissions();

  // Ya no cargamos módulos aquí, se hace en AppLayout
  // useEffect(() => {
  //   // Cargar módulos del usuario al montar el componente
  //   console.log('🔥 DynamicSidebarMenu: Cargando módulos del usuario...');
  //   dispatch(fetchUserModules());
  // }, [dispatch]);

  const accessibleModules = getAccessibleModules();
  
  console.log('🔥 DynamicSidebarMenu: userModules:', userModules);
  console.log('🔥 DynamicSidebarMenu: accessibleModules:', accessibleModules);
  console.log('🔥 DynamicSidebarMenu: isSuperAdmin:', isSuperAdmin());

  // Estilo personalizado para el menú
  const menuStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
  };

  // Función para crear estilo de grupo
  const createGroupLabel = (text: string) => (
    <span style={{ 
      color: 'rgba(255,255,255,0.5)', 
      fontSize: '11px', 
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: '0.5px',
      padding: '0 8px'
    }}>
      {text}
    </span>
  );

  // Función para crear elemento del menú
  const createMenuItem = (module: any) => {
    const iconKey = module.icon || 'SettingOutlined';
    const IconComponent = iconMap[iconKey] || <SettingOutlined />;
    
    return {
      key: module.route || `/${module.name}`,
      icon: <span style={{ fontSize: '16px' }}>{IconComponent}</span>,
      label: (
        <span style={{ fontWeight: '500', fontSize: '14px' }}>
          {module.displayName}
        </span>
      ),
      onClick: () => {
        if (module.route) {
          navigate(module.route);
        }
      }
    };
  };

  // Organizar módulos por secciones
  const organizeSections = () => {
    const sections = [];

    // 1. DASHBOARD - Solo si el usuario tiene acceso
    const dashboardModules = accessibleModules.filter(m => 
      m.name === 'dashboard'
    );

    if (dashboardModules.length > 0) {
      sections.push({
        key: "dashboard-section",
        type: 'group' as const,
        label: createGroupLabel('Dashboard'),
        children: dashboardModules.map(createMenuItem)
      });
    }

    // 2. OPERACIONES
    const operationModules = accessibleModules.filter(m => 
      ['ventas', 'productos', 'clientes', 'proveedores', 'pos'].includes(m.name)
    );

    if (operationModules.length > 0) {
      sections.push({
        key: "operations-section",
        type: 'group' as const,
        label: createGroupLabel('Operaciones'),
        children: operationModules.map(createMenuItem)
      });
    }

    // 3. FINANZAS
    const financeModules = accessibleModules.filter(m => 
      ['gastos', 'cierres-caja', 'capital', 'facturas'].includes(m.name)
    );

    if (financeModules.length > 0) {
      sections.push({
        key: "finance-section",
        type: 'group' as const,
        label: createGroupLabel('Finanzas'),
        children: financeModules.map(createMenuItem)
      });
    }

    // 4. ADMINISTRACIÓN
    const adminModules = accessibleModules.filter(m => 
      ['usuarios', 'categorias', 'unidades', 'reportes', 'configuracion', 'roles'].includes(m.name)
    );

    if (adminModules.length > 0) {
      sections.push({
        key: "admin-section",
        type: 'group' as const,
        label: createGroupLabel('Administración'),
        children: adminModules.map(createMenuItem)
      });
    }

    // 5. SISTEMA (siempre mostrar logout)
    sections.push({
      key: "system-section",
      type: 'group' as const,
      label: createGroupLabel('Sistema'),
      children: [
        {
          key: "logout",
          icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ff7875' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px', color: '#ff7875' }}>
              Cerrar sesión
            </span>
          ),
          onClick: onLogout,
        }
      ]
    });

    return sections;
  };

  const menuItems = organizeSections();

  return (
    <div style={{ padding: '16px 0' }}>
      <Menu
        theme="dark"
        mode="inline"
        style={menuStyle}
        items={menuItems}
      />
      
      {/* Información de permisos para debug (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          padding: '16px', 
          fontSize: '12px', 
          color: '#666',
          borderTop: '1px solid #333',
          marginTop: '16px'
        }}>
          <div>Módulos accesibles: {accessibleModules.length}</div>
          <div>Super Admin: {isSuperAdmin() ? 'Sí' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default DynamicSidebarMenu;
