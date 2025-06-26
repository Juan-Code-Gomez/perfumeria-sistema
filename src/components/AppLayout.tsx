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

  const userMenu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar sesión
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo text-white text-center py-4">
          <h2 style={{ color: '#fff', margin: 0 }}>Milán</h2>
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['/']}>
          <Menu.Item key="/" icon={<DashboardOutlined />} onClick={() => navigate('/')}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="/ventas" icon={<ShoppingCartOutlined />} onClick={() => navigate('/ventas')}>
            Ventas
          </Menu.Item>
          <Menu.Item key="/compras" icon={<GiftOutlined />} onClick={() => navigate('/compras')}>
            Compras
          </Menu.Item>
          <Menu.Item key="/productos" icon={<GiftOutlined />} onClick={() => navigate('/products')}>
            Productos
          </Menu.Item>
          <Menu.Item key="/usuarios" icon={<UserOutlined />} onClick={() => navigate('/usuarios')}>
            Usuarios
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: 24 }}>
          <Dropdown overlay={userMenu} placement="bottomRight">
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
