import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { ShoppingCartOutlined, DollarCircleOutlined, WarningOutlined, RiseOutlined } from '@ant-design/icons';
import type { Product } from '../../services/productService';

interface ProductStatsProps {
  products: Product[];
  loading: boolean;
}

const ProductStats: React.FC<ProductStatsProps> = ({ products, loading }) => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= (p.minStock || 0)).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + (p.salePrice * p.stock), 0
  );
  
  const averageMargin = products.length > 0 
    ? products.reduce((sum, p) => {
        const margin = p.purchasePrice > 0 ? ((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100 : 0;
        return sum + margin;
      }, 0) / products.length
    : 0;

  const stockHealthPercentage = totalProducts > 0 
    ? ((totalProducts - lowStockProducts) / totalProducts) * 100 
    : 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="Total Productos"
            value={totalProducts}
            prefix={<ShoppingCartOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="Valor Inventario"
            value={totalInventoryValue}
            prefix={<DollarCircleOutlined />}
            formatter={(value) => formatCurrency(Number(value))}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <Statistic
            title="Margen Promedio"
            value={averageMargin}
            precision={1}
            suffix="%"
            prefix={<RiseOutlined />}
            valueStyle={{ color: averageMargin >= 50 ? '#52c41a' : averageMargin >= 30 ? '#faad14' : '#ff4d4f' }}
          />
        </Card>
      </Col>
      
      <Col xs={12} sm={6}>
        <Card loading={loading}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <WarningOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
              <span>Salud del Stock</span>
            </div>
            <Progress
              percent={stockHealthPercentage}
              size="small"
              status={stockHealthPercentage >= 80 ? 'success' : stockHealthPercentage >= 60 ? 'normal' : 'exception'}
              showInfo={false}
            />
            <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
              {lowStockProducts} productos con stock bajo
              {outOfStockProducts > 0 && ` • ${outOfStockProducts} sin stock`}
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default ProductStats;
