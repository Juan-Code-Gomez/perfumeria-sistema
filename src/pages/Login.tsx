// src/pages/Login.tsx
import { Button, Form, Input, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../store";
import { login } from "../features/auth/authSlice";
import "./Login.css"; // archivo de estilos personalizado

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      await dispatch(login(values)).unwrap();
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
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
            <Button type="primary" htmlType="submit" block>
              Iniciar sesión
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
