// src/pages/Unauthorized.tsx
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

export default function Unauthorized() {
  const nav = useNavigate();
  return (
    <Result
      status="403"
      title="403"
      subTitle="No tienes permiso para acceder a esta página."
      extra={<Button onClick={() => nav(-1)}>Volver</Button>}
    />
  );
}
