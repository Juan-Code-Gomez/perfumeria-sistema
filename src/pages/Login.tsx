// src/pages/Login.tsx
import { Button, Form, Input, Typography, message, Spin } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { login } from "../features/auth/authSlice";
import { fetchPublicCompanyConfig } from "../features/company-config/companyConfigSlice";

import "./Login.css"; // archivo de estilos personalizado
import { useState, useEffect } from "react";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { token, user } = useAppSelector((state) => state.auth);
  const { publicConfig, loading: configLoading } = useAppSelector((state) => state.companyConfig);
  
  // Cargar configuración de la empresa al montar el componente
  useEffect(() => {
    dispatch(fetchPublicCompanyConfig());
  }, [dispatch]);

  // Refrescar configuración cuando el componente se vuelve a montar
  useEffect(() => {
    // Solo refrescar si no estamos cargando y no hay configuración
    if (!configLoading && !publicConfig) {
      dispatch(fetchPublicCompanyConfig());
    }
  }, [dispatch, configLoading, publicConfig]);

  // Determinar qué logo usar
  const getLogoSrc = () => {
    // Si no hay configuración cargada aún, usar logo por defecto
    if (configLoading || !publicConfig) {
      return "/logo-milan.png";
    }
    
    // Si hay logo configurado
    if (publicConfig.logo) {
      // Si es base64, usarlo directamente
      if (publicConfig.logo.startsWith('data:')) {
        return publicConfig.logo;
      }
      // Si es una URL, usarla
      if (publicConfig.logo.startsWith('http') || publicConfig.logo.startsWith('/')) {
        return publicConfig.logo;
      }
    }
    
    // Fallback al logo por defecto
    return "/logo-milan.png";
  };
  
  const logoSrc = getLogoSrc();
  
  // Debug
  console.log('Config loaded:', !configLoading && !!publicConfig);
  console.log('Has custom logo:', publicConfig?.logo ? 'Yes' : 'No');  
  console.log('Logo type:', publicConfig?.logo?.startsWith('data:') ? 'Base64' : 'URL/Path');
  
  // Solo verificar el token del Redux, no ambos lugares
  if (token && user) {
    // Ya logueado, redirecciona
    return <Navigate to="/" replace />;
  }

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      navigate("/");
    } catch (error: any) {
      message.destroy();
      if (error?.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (typeof error === "string") {
        message.error(error);
      } else {
        message.error("Credenciales incorrectas. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        {configLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <Spin size="large" />
          </div>
        ) : (
          <img
            src={logoSrc}
            alt="Company Logo"
            className="login-illustration"
            onError={(e) => {
              // Si falla cargar el logo personalizado, usar el por defecto
              const target = e.target as HTMLImageElement;
              if (target.src !== "/logo-milan.png") {
                console.warn('Failed to load custom logo, falling back to default');
                target.src = "/logo-milan.png";
              }
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              objectFit: 'contain'
            }}
          />
        )}
      </div>
      <div className="login-right">
        <div className="login-card">
          <Typography.Title level={3}>
            {publicConfig?.companyName ? `${publicConfig.companyName} - Ingresa tu cuenta` : 'Ingresa tu cuenta'}
          </Typography.Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              label="Usuario"
              name="username"
              rules={[
                { required: true, message: "Por favor ingresa tu usuario" },
              ]}
            >
              <Input placeholder="admin123" />
            </Form.Item>
            <Form.Item
              label="Contraseña"
              name="password"
              rules={[
                { required: true, message: "Por favor ingresa tu contraseña" },
              ]}
            >
              <Input.Password placeholder="Ingresa tu contraseña" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Iniciar sesión
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
