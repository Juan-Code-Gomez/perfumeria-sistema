// src/components/SidebarMenu.tsx
import React from "react";
import { Menu } from "antd";
import {
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  PieChartOutlined,
  WalletOutlined,
  AppstoreOutlined,
  ShopOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../store/index";
import { usePermissions } from "../hooks/usePermissions";

const SidebarMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { hasPermission } = usePermissions();
  
  const userRoles = user?.roles?.map((ur: any) => ur.role.name) ?? [];
  const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  const isVendedor = userRoles.includes("VENDEDOR");

  // Estilo personalizado para el menú
  const menuStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
  };

  // Definir elementos del menú basados en permisos
  const menuItems: any[] = [];

  // Dashboard - Accesible para todos los roles autenticados
  if (hasPermission('dashboard', 'view')) {
    menuItems.push({
      key: "/",
      icon: <PieChartOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Dashboard Ejecutivo
        </span>
      ),
    });
  }

  // POS - Solo para vendedores y administradores
  if (hasPermission('pos', 'view')) {
    menuItems.push({
      key: "/pos",
      icon: <CreditCardOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          POS - Punto de Venta
        </span>
      ),
    });
  }

  // Ventas - Para vendedores y administradores
  if (hasPermission('ventas', 'view')) {
    menuItems.push({
      key: "/ventas",
      icon: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Administración de Ventas
        </span>
      ),
    });
  }

  // Productos - Para vendedores (solo lectura) y administradores
  if (hasPermission('productos', 'view')) {
    menuItems.push({
      key: "/products",
      icon: <AppstoreOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          {isVendedor && !isAdmin ? 'Consultar Productos' : 'Gestión de Productos'}
        </span>
      ),
    });
  }

  // Clientes - Para administradores
  if (hasPermission('clientes', 'view')) {
    menuItems.push({
      key: "/clients",
      icon: <TeamOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Clientes
        </span>
      ),
    });
  }

  // Pedidos - Para vendedores (crear y ver propios) y administradores
  if (hasPermission('pedidos', 'view')) {
    menuItems.push({
      key: "/orders",
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          {isVendedor && !isAdmin ? 'Mis Pedidos' : 'Gestión de Pedidos'}
        </span>
      ),
    });
  }

  // Proveedores - Solo administradores
  if (hasPermission('proveedores', 'view')) {
    menuItems.push({
      key: "/suppliers",
      icon: <ShopOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Proveedores
        </span>
      ),
    });
  }

  // Gastos - Para vendedores (solo crear) y administradores
  if (hasPermission('gastos', 'view')) {
    menuItems.push({
      key: "/expenses",
      icon: <DollarOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          {isVendedor && !isAdmin ? 'Registrar Gastos' : 'Gastos'}
        </span>
      ),
    });
  }

  // Cierres de caja - Para vendedores y administradores
  if (hasPermission('cierres-caja', 'view')) {
    menuItems.push({
      key: "/cash-closings",
      icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Cierres de caja
        </span>
      ),
    });
  }

  // Facturas - Para vendedores (solo crear) y administradores
  if (hasPermission('facturas', 'view')) {
    menuItems.push({
      key: "/invoices",
      icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          {isVendedor && !isAdmin ? 'Registrar Facturas' : 'Facturas'}
        </span>
      ),
    });
  }

  // Capital - Solo administradores
  if (hasPermission('capital', 'view')) {
    menuItems.push({
      key: "/capital",
      icon: <WalletOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Capital
        </span>
      ),
    });
  }

  // Reportes - Solo administradores
  if (hasPermission('reportes', 'view')) {
    menuItems.push({
      key: "/reports/profit-summary",
      icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Resumen de ganancias
        </span>
      ),
    });
  }

  // Configuración - Solo administradores
  if (hasPermission('configuracion', 'view')) {
    menuItems.push({
      key: "/config",
      icon: <SettingOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }}>
          Configuración
        </span>
      ),
    });
  }

  // Agregar separador y logout para todos
  menuItems.push(
    { type: 'divider' as const },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />,
      label: (
        <span style={{ fontSize: '14px', color: '#ff4d4f' }}>
          Cerrar Sesión
        </span>
      ),
    }
  );

  return (
    <div style={{ padding: '16px 0' }}>
      <Menu
        theme="dark"
        mode="inline"
        style={menuStyle}
        items={menuItems}
        onClick={({ key }) => {
          if (key === "logout") {
            onLogout();
          } else {
            navigate(key);
          }
        }}
      />
    </div>
  );
};

export default SidebarMenu;
