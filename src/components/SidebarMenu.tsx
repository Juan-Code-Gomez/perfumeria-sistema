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

const SidebarMenu: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const userRoles = user?.roles?.map((ur: any) => ur.role.name) ?? [];
  const isAdmin = userRoles.includes("ADMIN");
  const isVendedor = userRoles.includes("VENDEDOR");
  const isUser = userRoles.includes("USER");

  // Estilo personalizado para el menú
  const menuStyle = {
    background: 'transparent',
    border: 'none',
    fontSize: '14px',
  };

  // 1. Menú para vendedor
  if (isVendedor && !isAdmin && !isUser) {
    return (
      <div style={{ padding: '16px 0' }}>
        <Menu
          theme="dark"
          mode="inline"
          style={menuStyle}
          items={[
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
