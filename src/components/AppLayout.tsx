import React from "react";
import { Layout, Dropdown, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { logout } from "../features/auth/authSlice";
import DynamicSidebarMenu from "./DynamicSidebarMenu";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider 
        breakpoint="lg" 
        collapsedWidth="0"
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
        }}
      >
        {/* Logo y título mejorado */}
        <div style={{ 
          padding: '24px 16px',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.05)',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              M
            </span>
          </div>
          <h2 style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Milán Fragancias
          </h2>
          <Text style={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '12px',
            display: 'block',
            marginTop: '4px'
          }}>
            Sistema de Gestión
          </Text>
        </div>

        <DynamicSidebarMenu onLogout={handleLogout} />
      </Sider>
      <Layout>
        <Header
          style={{
            background: 'linear-gradient(90deg, #fff 0%, #f8fafc 100%)',
            padding: 0,
            textAlign: "right",
            paddingRight: 24,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Dropdown
            menu={{
              items: [
                {
                  key: "profile",
                  icon: <UserOutlined />,
                  label: "Mi Perfil",
                  onClick: () => navigate("/profile"),
                },
                {
                  key: "logout",
                  icon: <UserOutlined />,
                  label: "Cerrar sesión",
                  onClick: handleLogout,
                },
              ],
            }}
            placement="bottomRight"
          >
            <span style={{ cursor: "pointer", display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar
                style={{ 
                  backgroundColor: "#52c41a",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                icon={<UserOutlined />}
              />
              <span style={{ color: '#595959', fontWeight: '500' }}>
                {user?.name}
              </span>
            </span>
          </Dropdown>
        </Header>
        <Content style={{ 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          padding: '0'
        }}>
          <div style={{ padding: '24px 32px', maxWidth: 'none' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
