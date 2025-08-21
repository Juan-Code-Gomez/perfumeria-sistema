// src/components/SidebarMenu.tsx
import React from "react";
import { Menu } from "antd";
import {
  ShoppingCartOutlined,
  GiftOutlined,
  TeamOutlined,
  BarChartOutlined,
  FolderOpenOutlined,
  DollarOutlined,
  SettingOutlined,
  FileDoneOutlined,
  LogoutOutlined,
  CreditCardOutlined,
  PieChartOutlined,
  WalletOutlined,
  FileTextOutlined,
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

  // 1. Menú para vendedor
  if (isVendedor && !isAdmin && !isUser) {
    return (
      <Menu
        theme="dark"
        mode="inline"
        items={[
          {
            key: "/pos",
            icon: <CreditCardOutlined />,
            label: "POS - Punto de Venta",
            onClick: () => navigate("/pos"),
          },
          {
            key: "/ventas",
            icon: <ShoppingCartOutlined />,
            label: "Ventas",
            onClick: () => navigate("/ventas"),
          },
          {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Cerrar sesión",
            onClick: onLogout,
          },
        ]}
      />
    );
  }

  // 2. Menú general para Admin y User
  // Puedes seguir agrupando más si tienes muchos módulos
  const mainMenu = [
    {
      key: "/executive-dashboard",
      icon: <PieChartOutlined />,
      label: "Dashboard Ejecutivo",
      onClick: () => navigate("/"),
    },
    {
      key: "/pos",
      icon: <CreditCardOutlined />,
      label: "POS - Punto de Venta",
      onClick: () => navigate("/pos"),
    },
    {
      key: "/ventas",
      icon: <ShoppingCartOutlined />,
      label: "Ventas",
      onClick: () => navigate("/ventas"),
    },
    // {
    //   key: "/compras",
    //   icon: <GiftOutlined />,
    //   label: "Compras",
    //   onClick: () => navigate("/purchases"),
    // },
    {
      key: "/products",
      icon: <FolderOpenOutlined />,
      label: "Productos",
      onClick: () => navigate("/products"),
    },
    // {
    //   key: "/providers",
    //   icon: <BankOutlined />,
    //   label: "Proveedores",
    //   onClick: () => navigate("/providers"),
    // },
    {
      key: "/expenses",
      icon: <DollarOutlined />,
      label: "Gastos",
      onClick: () => navigate("/expenses"),
    },
    {
      key: "/cash-closings",
      icon: <FileDoneOutlined />,
      label: "Cierres de caja",
      onClick: () => navigate("/cash-closings"),
    },
    // {
    //   key: "/pending-sales",
    //   icon: <FileDoneOutlined />,
    //   label: "Ventas pendientes",
    //   onClick: () => navigate("/pending-sales"),
    // },
    {
      key: "/clients",
      icon: <TeamOutlined />,
      label: "Clientes",
      onClick: () => navigate("/clients"),
    },
    {
      key: "/capital",
      icon: <WalletOutlined />,
      label: "Capital",
      onClick: () => navigate("/capital"),
    },
    {
      key: "/invoices",
      icon: <FileTextOutlined />,
      label: "Facturas",
      onClick: () => navigate("/invoices"),
    }
  ];

  // Menú de administración solo para ADMIN
  const adminMenu = isAdmin
    ? [
        {
          key: "admin",
          icon: <SettingOutlined />,
          label: "Administración",
          children: [
            {
              key: "/users",
              icon: <TeamOutlined />,
              label: "Usuarios",
              onClick: () => navigate("/users"),
            },
            {
              key: "/categories",
              icon: <GiftOutlined />,
              label: "Categorías",
              onClick: () => navigate("/categories"),
            },
            {
              key: "/units",
              icon: <GiftOutlined />,
              label: "Unidades",
              onClick: () => navigate("/units"),
            },
            {
              key: "/reports/profit-summary",
              icon: <BarChartOutlined />,
              label: "Resumen de ganancias",
              onClick: () => navigate("/reports/profit-summary"),
            },
          ],
        },
      ]
    : [];

  // Logout
  const logoutMenu = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Cerrar sesión",
      onClick: onLogout,
    },
  ];

  return (
    <Menu
      theme="dark"
      mode="inline"
      items={[...mainMenu, ...adminMenu, ...logoutMenu]}
    />
  );
};

export default SidebarMenu;
