import React, { useEffect, useState } from "react";
import { Layout, Dropdown, Avatar, Typography } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { logoutWithPermissions } from "../features/auth/authSlice";
import { fetchUserModules, fetchUserPermissions } from "../features/permissions/permissionsSlice";
import { fetchPublicCompanyConfig } from "../features/company-config/companyConfigSlice";

import DynamicSidebarMenu from "./DynamicSidebarMenu";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state: any) => state.auth);
  const { userModules } = useAppSelector((state: any) => state.permissions);
  const { publicConfig } = useAppSelector((state: any) => state.companyConfig);
  const [logoError, setLogoError] = useState(false);

  // Efecto para cargar módulos cuando la aplicación se inicializa con un usuario ya autenticado
  useEffect(() => {
    // Si hay un usuario autenticado pero no hay módulos cargados, cargarlos
    if (user && token && (!userModules || userModules.length === 0)) {
      console.log('🔥 AppLayout: Usuario autenticado detectado sin módulos, cargando...');
      dispatch(fetchUserModules());
      dispatch(fetchUserPermissions());
    }
  }, [dispatch, user, token, userModules]);

  // Efecto para cargar la configuración pública de la empresa
  useEffect(() => {
    // Cargar configuración pública al inicializar el layout
    dispatch(fetchPublicCompanyConfig());
  }, [dispatch]);

  // Resetear error de logo cuando cambie la configuración
  useEffect(() => {
    setLogoError(false);
  }, [publicConfig?.logo]);

  // Función para generar iniciales del nombre de la empresa
  const getCompanyInitials = (companyName?: string): string => {
    if (!companyName) return 'MF'; // Milán Fragancias por defecto
    
    return companyName
      .split(' ')
      .map((word: string) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'MF';
  };

  const handleLogout = () => {
    dispatch(logoutWithPermissions());
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
            background: publicConfig?.logo ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            overflow: 'hidden'
          }}>
            {(publicConfig?.logo && !logoError) ? (
              <img 
                src={publicConfig.logo}
                alt="Company Logo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '12px'
                }}
                onError={() => setLogoError(true)}
              />
            ) : (
              <span style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#fff',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {getCompanyInitials(publicConfig?.companyName)}
              </span>
            )}
          </div>
          <h2 style={{ 
            color: '#fff', 
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            letterSpacing: '0.5px',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            {publicConfig?.companyName || 'Milán Fragancias'}
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
