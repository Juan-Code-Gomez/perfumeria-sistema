// src/components/AppLayout.tsx
import React from 'react';
import { Layout, Menu, Dropdown, Avatar } from 'antd';
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  GiftOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index';
import { logout } from '../features/auth/authSlice';

const { Header, Sider, Content } = Layout;

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Definir items para el menú del usuario
  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
      onClick: handleLogout,
    },
  ];

  // Definir items para el menú principal
  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/'),
    },
    {
      key: '/ventas',
      icon: <ShoppingCartOutlined />,
      label: 'Ventas',
      onClick: () => navigate('/ventas'),
    },
    {
      key: '/compras',
      icon: <GiftOutlined />,
      label: 'Compras',
      onClick: () => navigate('/purchases'),
    },
    {
      key: '/products',
      icon: <GiftOutlined />,
      label: 'Productos',
      onClick: () => navigate('/products'),
    },
    {
      key: '/usuarios',
      icon: <UserOutlined />,
      label: 'Usuarios',
      onClick: () => navigate('/usuarios'),
    },
    {
      key: '/categories',
      icon: <GiftOutlined />,
      label: 'Categorías',
      onClick: () => navigate('/categories'),
    },
        {
      key: '/units',
      icon: <GiftOutlined />,
      label: 'Unidades',
      onClick: () => navigate('/units'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo text-white text-center py-4">
          <h2 style={{ color: '#fff', margin: 0 }}>Milán</h2>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: 24 }}>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
          >
            <span style={{ cursor: 'pointer' }}>
              <Avatar style={{ backgroundColor: '#87d068', marginRight: 8 }} icon={<UserOutlined />} />
              {user?.name}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div className="max-w-screen-xl mx-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
