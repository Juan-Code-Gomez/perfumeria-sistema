// src/pages/Login.tsx
import { Button, Form, Input, Typography, message } from "antd";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store";
import { login } from "../features/auth/authSlice";
import "./Login.css"; // archivo de estilos personalizado
import { useState } from "react";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { token, user } = useAppSelector((state) => state.auth);
  
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
        <img
          src="/logo-milan.png"
          alt="Login Illustration"
          className="login-illustration"
        />
      </div>
      <div className="login-right">
        <div className="login-card">
          <Typography.Title level={3}>Ingresa tu cuenta</Typography.Title>
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
