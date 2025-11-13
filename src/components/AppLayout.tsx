import React, { useEffect, useState } from "react";
import { Layout, Dropdown, Avatar, Typography, Drawer, Button } from "antd";
import { UserOutlined, MenuOutlined, CloseOutlined } from "@ant-design/icons";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Detectar cambios de tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Cerrar menú móvil si se hace la pantalla grande
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Componente del logo reutilizable
  const LogoSection = () => (
    <div style={{ 
      padding: isMobile ? '16px 12px' : '24px 16px',
      textAlign: 'center',
      background: 'rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        width: isMobile ? '40px' : '48px',
        height: isMobile ? '40px' : '48px',
        borderRadius: '12px',
        background: publicConfig?.logo ? 'transparent' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 12px',
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
            fontSize: isMobile ? '20px' : '24px', 
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
        fontSize: isMobile ? '16px' : '18px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)'
      }}>
        {publicConfig?.companyName || 'Milán Fragancias'}
      </h2>
      <Text style={{ 
        color: 'rgba(255,255,255,0.7)', 
        fontSize: isMobile ? '11px' : '12px',
        display: 'block',
        marginTop: '4px'
      }}>
        Sistema de Gestión
      </Text>
    </div>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar para desktop */}
      {!isMobile && (
        <Sider 
          breakpoint="lg" 
          collapsedWidth="0"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
          }}
        >
          <LogoSection />
          <DynamicSidebarMenu onLogout={handleLogout} />
        </Sider>
      )}

      {/* Drawer para móvil */}
      {isMobile && (
        <Drawer
          placement="left"
          onClose={() => setMobileMenuOpen(false)}
          open={mobileMenuOpen}
          closable={false}
          bodyStyle={{ 
            padding: 0,
            background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          }}
          width={280}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            <Button
              type="text"
              icon={<CloseOutlined style={{ color: '#fff', fontSize: '18px' }} />}
              onClick={() => setMobileMenuOpen(false)}
            />
          </div>
          <LogoSection />
          <DynamicSidebarMenu onLogout={() => {
            handleLogout();
            setMobileMenuOpen(false);
          }} />
        </Drawer>
      )}

      <Layout>
        <Header
          style={{
            background: 'linear-gradient(90deg, #fff 0%, #f8fafc 100%)',
            padding: isMobile ? '0 12px' : '0 24px',
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            height: isMobile ? '56px' : '64px'
          }}
        >
          {/* Botón de menú en móvil */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ padding: '4px 8px' }}
            />
          )}

          {/* Logo compacto en header móvil */}
          {isMobile && (
            <div style={{ 
              flex: 1, 
              textAlign: 'center',
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a2e'
            }}>
              {publicConfig?.companyName || 'Milán Fragancias'}
            </div>
          )}

          {/* User dropdown */}
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
            <span style={{ 
              cursor: "pointer", 
              display: 'flex', 
              alignItems: 'center', 
              gap: isMobile ? '4px' : '8px' 
            }}>
              <Avatar
                size={isMobile ? 32 : 40}
                style={{ 
                  backgroundColor: "#52c41a",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
                icon={<UserOutlined />}
              />
              {!isMobile && (
                <span style={{ color: '#595959', fontWeight: '500' }}>
                  {user?.name}
                </span>
              )}
            </span>
          </Dropdown>
        </Header>
        <Content style={{ 
          background: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
          padding: '0'
        }}>
          <div style={{ 
            padding: isMobile ? '16px' : '24px 32px', 
            maxWidth: 'none' 
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
