// src/pages/sales/POSPage.tsx
import React from 'react';
import { Layout } from 'antd';
import POSInterface from '../../components/sales/POSInterface';

const { Content } = Layout;

const POSPage: React.FC = () => {
  const handleSaleCompleted = () => {
    // Opcional: actualizar estadísticas, etc.
    console.log('Venta completada desde POS');
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <Content style={{ padding: 0 }}>
        <POSInterface onSaleCompleted={handleSaleCompleted} />
      </Content>
    </Layout>
  );
};

export default POSPage;
