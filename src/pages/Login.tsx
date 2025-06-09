// src/pages/Login.tsx
import { Button, Form, Input, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../store'
import { login } from '../features/auth/authSlice'
import './Login.css' // archivo de estilos personalizado

const Login = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const onFinish = (values: any) => {
    dispatch(login({
      user: { id: 1, name: 'Admin', email: values.email },
      token: 'mock-token',
    }))
    navigate('/')
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>Login page</h1>
        <p>Start your journey now with us</p>
      </div>
      <div className="login-right">
        <div className="login-card">
          <Typography.Title level={3}>Ingresa tu cuenta</Typography.Title>
          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item label="Usuario" name="user" rules={[{ required: true, message: 'Por favor ingresa tu usuario' }]}>
              <Input placeholder="admin123" />
            </Form.Item>
            <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}>
              <Input.Password placeholder="Ingresa tu contraseña" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block>
              Iniciar sesión
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Login
