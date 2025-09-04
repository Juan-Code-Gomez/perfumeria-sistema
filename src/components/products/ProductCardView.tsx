import React from 'react';
import { Card, Row, Col, Tag, Button, Popconfirm, Statistic, Space, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, ShoppingCartOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { Product } from '../../services/productService';
import type { Category, Unit } from '../../features/products/types';
import FieldPermissionGuard from '../FieldPermissionGuard';

interface ProductCardViewProps {
  products: Product[];
  loading: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: number) => void;
}

const ProductCardView: React.FC<ProductCardViewProps> = ({
  products,
  loading,
  onEdit,
  onDelete,
}) => {
  const getStockStatus = (stock: number, minStock?: number) => {
    if (stock <= 0) return { color: 'red', icon: <WarningOutlined />, text: 'Sin stock' };
    if (minStock && stock <= minStock) return { color: 'orange', icon: <WarningOutlined />, text: 'Stock bajo' };
    return { color: 'green', icon: <CheckCircleOutlined />, text: 'Stock OK' };
  };

  const calculateMargin = (salePrice: number, purchasePrice: number) => {
    if (!purchasePrice || purchasePrice === 0) return 0;
    return ((salePrice - purchasePrice) / purchasePrice) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Row gutter={[16, 16]}>
      {products.map((product) => {
        const stockStatus = getStockStatus(product.stock, product.minStock);
        const margin = calculateMargin(product.salePrice, product.purchasePrice);
        const profit = product.salePrice - product.purchasePrice;

        return (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={product.id}>
            <Card
              hoverable
              size="small"
              loading={loading}
              cover={
                product.imageUrl ? (
                  <div style={{ height: 120, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
                    <img
                      alt={product.name}
                      src={product.imageUrl}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 120,
                      backgroundColor: '#f5f5f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingCartOutlined style={{ fontSize: 40, color: '#d9d9d9' }} />
                  </div>
                )
              }
              actions={[
                ...(onEdit ? [
                  <Tooltip title="Editar producto" key="edit">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(product)}
                    />
                  </Tooltip>
                ] : []),
                ...(onDelete ? [
                  <Popconfirm
                    key="delete"
                    title="¿Eliminar producto?"
                    description="Esta acción no se puede deshacer"
                    onConfirm={() => onDelete(product.id)}
                    okText="Sí"
                    cancelText="No"
                  >
                    <Tooltip title="Eliminar producto">
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Tooltip>
                  </Popconfirm>
                ] : []),
              ]}
            >
              <div style={{ height: 180 }}>
                {/* Header con nombre y estado de stock */}
                <div style={{ marginBottom: 8 }}>
                  <Tooltip title={product.name}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {product.name}
                    </h4>
                  </Tooltip>
                  <Tag color={stockStatus.color} style={{ marginTop: 4, fontSize: 11 }}>
                    {stockStatus.icon} {stockStatus.text}
                  </Tag>
                </div>

                {/* Categoría y Unidad */}
                <Space size="small" style={{ marginBottom: 8 }}>
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    {(product.category as Category)?.name || 'Sin categoría'}
                  </Tag>
                  <Tag color="cyan" style={{ fontSize: 11 }}>
                    {(product.unit as Unit)?.name || 'Sin unidad'}
                  </Tag>
                </Space>

                {/* Stock */}
                <div style={{ marginBottom: 8 }}>
                  <Statistic
                    title="Stock"
                    value={product.stock}
                    suffix={`/ ${product.minStock || 0} mín`}
                    valueStyle={{ fontSize: 16, color: stockStatus.color }}
                  />
                </div>

                {/* Precios */}
                <Row gutter={8} style={{ marginBottom: 8 }}>
                  {/* Precio de compra - Solo para roles administrativos */}
                  <FieldPermissionGuard hideFor={['VENDEDOR']}>
                    <Col span={12}>
                      <div style={{ fontSize: 12, color: '#666' }}>Compra</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>
                        {formatCurrency(product.purchasePrice)}
                      </div>
                    </Col>
                  </FieldPermissionGuard>
                  
                  <Col span={12}>
                    <div style={{ fontSize: 12, color: '#666' }}>Venta</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#52c41a' }}>
                      {formatCurrency(product.salePrice)}
                    </div>
                  </Col>
                </Row>

                {/* Margen y Utilidad - Solo para roles administrativos */}
                <FieldPermissionGuard hideFor={['VENDEDOR']}>
                  <Row gutter={8}>
                    <Col span={12}>
                      <Tag
                        color={margin >= 50 ? 'green' : margin >= 20 ? 'orange' : 'red'}
                        style={{ width: '100%', textAlign: 'center' }}
                      >
                        {margin.toFixed(1)}% margen
                      </Tag>
                    </Col>
                    <Col span={12}>
                      <div style={{ fontSize: 11, color: '#666' }}>Utilidad</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: profit > 0 ? '#52c41a' : '#ff4d4f' }}>
                        {formatCurrency(profit)}
                      </div>
                    </Col>
                  </Row>
                </FieldPermissionGuard>
              </div>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default ProductCardView;
