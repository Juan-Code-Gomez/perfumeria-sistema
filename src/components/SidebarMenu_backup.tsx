// src/components/SidebarMenu.tsx
import React from "react";
import { Menu } from "antd";
import {
  ShoppingCartOutlined,
  GiftOutlined,
  TeamOutlined,
  BarChartOutlined,
  DollarOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  PieChartOutlined,
  WalletOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  ShopOutlined,
  SettingOutlined,
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
  const menuItems = [];

  // Dashboard - Accesible para todos los roles autenticados
  if (hasPermission('dashboard', 'view')) {
    menuItems.push({
      key: "/",
      icon: <PieChartOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/pos")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/ventas")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/products")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/clients")}>
          Clientes
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/suppliers")}>
          Proveedores
        </span>
      ),
    });
  }

  // Gastos - Solo administradores
  if (hasPermission('gastos', 'view')) {
    menuItems.push({
      key: "/expenses",
      icon: <DollarOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/expenses")}>
          Gastos
        </span>
      ),
    });
  }

  // Cierres de caja - Solo administradores
  if (hasPermission('cierres-caja', 'view')) {
    menuItems.push({
      key: "/cash-closings",
      icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
      label: (
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/cash-closings")}>
          Cierres de caja
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/capital")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/reports/profit-summary")}>
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
        <span style={{ fontSize: '14px' }} onClick={() => navigate("/company-config")}>
          Configuración
        </span>
      ),
    });
  }

  // Agregar separador y logout para todos
  menuItems.push(
    { type: 'divider' },
    {
      key: "logout",
      icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />,
      label: (
        <span style={{ fontSize: '14px', color: '#ff4d4f' }} onClick={onLogout}>
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
          if (key !== "logout") {
            navigate(key);
          }
        }}
      />
    </div>
  );
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  POS - Punto de Venta
                </span>
              ),
              onClick: () => navigate("/pos"),
            },
            {
              key: "/ventas",
              icon: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Ventas
                </span>
              ),
              onClick: () => navigate("/ventas"),
            },
            {
              type: 'divider',
              style: { margin: '16px 0', borderColor: 'rgba(255,255,255,0.1)' }
            },
            {
              key: "logout",
              icon: <LogoutOutlined style={{ fontSize: '16px', color: '#ff7875' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px', color: '#ff7875' }}>
                  Cerrar sesión
                </span>
              ),
              onClick: onLogout,
            },
          ]}
        />
      </div>
    );
  }

  // 2. Menú general para Admin y User
  const mainMenu = [
    {
      key: "dashboard-section",
      type: 'group' as const,
      label: (
        <span style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '11px', 
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.5px',
          padding: '0 8px'
        }}>
          Dashboard
        </span>
      ),
      children: [
        {
          key: "/executive-dashboard",
          icon: <PieChartOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Dashboard Ejecutivo
            </span>
          ),
          onClick: () => navigate("/"),
        }
      ]
    },
    {
      key: "operations-section",
      type: 'group' as const,
      label: (
        <span style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '11px', 
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.5px',
          padding: '0 8px'
        }}>
          Operaciones
        </span>
      ),
      children: [
        {
          key: "/pos",
          icon: <CreditCardOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              POS - Punto de Venta
            </span>
          ),
          onClick: () => navigate("/pos"),
        },
        {
          key: "/ventas",
          icon: <ShoppingCartOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Ventas
            </span>
          ),
          onClick: () => navigate("/ventas"),
        },
        {
          key: "/products",
          icon: <AppstoreOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Productos
            </span>
          ),
          onClick: () => navigate("/products"),
        },
        {
          key: "/clients",
          icon: <TeamOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Clientes
            </span>
          ),
          onClick: () => navigate("/clients"),
        },
        {
          key: "/suppliers",
          icon: <ShopOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Proveedores
            </span>
          ),
          onClick: () => navigate("/suppliers"),
        },
      ]
    },
    {
      key: "finance-section",
      type: 'group' as const,
      label: (
        <span style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '11px', 
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.5px',
          padding: '0 8px'
        }}>
          Finanzas
        </span>
      ),
      children: [
        {
          key: "/expenses",
          icon: <DollarOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Gastos
            </span>
          ),
          onClick: () => navigate("/expenses"),
        },
        {
          key: "/cash-closings",
          icon: <FileDoneOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Cierres de caja
            </span>
          ),
          onClick: () => navigate("/cash-closings"),
        },
        {
          key: "/capital",
          icon: <WalletOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Capital
            </span>
          ),
          onClick: () => navigate("/capital"),
        },
        {
          key: "/invoices",
          icon: <FileTextOutlined style={{ fontSize: '16px' }} />,
          label: (
            <span style={{ fontWeight: '500', fontSize: '14px' }}>
              Facturas
            </span>
          ),
          onClick: () => navigate("/invoices"),
        }
      ]
    }
  ];

  // Menú de administración solo para ADMIN
  const adminMenu = isAdmin
    ? [
        {
          key: "admin-section",
          type: 'group' as const,
          label: (
            <span style={{ 
              color: 'rgba(255,255,255,0.5)', 
              fontSize: '11px', 
              textTransform: 'uppercase',
              fontWeight: '600',
              letterSpacing: '0.5px',
              padding: '0 8px'
            }}>
              Administración
            </span>
          ),
          children: [
            {
              key: "/users",
              icon: <TeamOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Usuarios
                </span>
              ),
              onClick: () => navigate("/users"),
            },
            {
              key: "/categories",
              icon: <GiftOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Categorías
                </span>
              ),
              onClick: () => navigate("/categories"),
            },
            {
              key: "/units",
              icon: <GiftOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Unidades
                </span>
              ),
              onClick: () => navigate("/units"),
            },
            {
              key: "/reports/profit-summary",
              icon: <BarChartOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Resumen de ganancias
                </span>
              ),
              onClick: () => navigate("/reports/profit-summary"),
            },
            {
              key: "/company-config",
              icon: <SettingOutlined style={{ fontSize: '16px' }} />,
              label: (
                <span style={{ fontWeight: '500', fontSize: '14px' }}>
                  Configuración
                </span>
              ),
              onClick: () => navigate("/company-config"),
            },
          ],
        },
      ]
    : [];

  // Logout section
  const logoutMenu = [
    {
      key: "logout-section",
      type: 'group' as const,
      label: (
        <span style={{ 
          color: 'rgba(255,255,255,0.5)', 
          fontSize: '11px', 
          textTransform: 'uppercase',
          fontWeight: '600',
          letterSpacing: '0.5px',
          padding: '0 8px'
        }}>
          Sistema
        </span>
      ),
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
        },
      ]
    }
  ];

  return (
    <div style={{ padding: '16px 0' }}>
      <Menu
        theme="dark"
        mode="inline"
        style={menuStyle}
        items={[...mainMenu, ...adminMenu, ...logoutMenu]}
      />
    </div>
  );
};

export default SidebarMenu;
