// src/pages/suppliers/SupplierList.tsx
import React, { useEffect, useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
  Row,
  Col,
  Statistic,
  Modal,
  Popconfirm,
  Typography,
  Select,
  Avatar,
  Tabs,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CreditCardOutlined,
  UserOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
  type CreateSupplierData,
} from '../../features/suppliers/supplierSlice';
import SupplierForm from '../../components/suppliers/SupplierForm';
import SupplierDetail from '../../components/suppliers/SupplierDetail';
import SupplierAnalytics from '../../components/suppliers/SupplierAnalytics';

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const SupplierList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: suppliers, loading, error } = useAppSelector((state) => state.suppliers);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierType, setSelectedSupplierType] = useState<string>('');
  const [showWithDebtOnly, setShowWithDebtOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    dispatch(fetchSuppliers());
  }, [dispatch]);

  const handleCreateSupplier = async (data: CreateSupplierData) => {
    try {
      await dispatch(createSupplier(data)).unwrap();
      message.success('Proveedor creado exitosamente');
      setModalVisible(false);
    } catch (error: any) {
      message.error(error || 'Error al crear proveedor');
    }
  };

  const handleUpdateSupplier = async (data: CreateSupplierData) => {
    if (!editingSupplier) return;
    
    try {
      await dispatch(updateSupplier({ id: editingSupplier.id, data })).unwrap();
      message.success('Proveedor actualizado exitosamente');
      setModalVisible(false);
      setEditingSupplier(null);
    } catch (error: any) {
      message.error(error || 'Error al actualizar proveedor');
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      await dispatch(deleteSupplier(id)).unwrap();
      message.success('Proveedor eliminado exitosamente');
    } catch (error: any) {
      message.error(error || 'Error al eliminar proveedor');
    }
  };

  const openCreateModal = () => {
    setEditingSupplier(null);
    setModalVisible(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalVisible(true);
  };

  const openDetailModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailModalVisible(true);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch = !searchTerm || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.nit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !selectedSupplierType || supplier.supplierType === selectedSupplierType;
    const matchesDebt = !showWithDebtOnly || (supplier.currentDebt && supplier.currentDebt > 0);
    
    return matchesSearch && matchesType && matchesDebt;
  });

  // Calcular estadísticas
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.isActive).length;
  const totalDebt = suppliers.reduce((sum, s) => sum + (s.currentDebt || 0), 0);
  const suppliersWithDebt = suppliers.filter(s => s.currentDebt && s.currentDebt > 0).length;

  const columns = [
    {
      title: 'Proveedor',
      key: 'supplier',
      render: (_: any, record: Supplier) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar 
              icon={<UserOutlined />} 
              style={{ backgroundColor: record.isPreferred ? '#52c41a' : '#1890ff' }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                {record.name}
                {record.isPreferred && (
                  <Tag color="green" style={{ marginLeft: 8 }}>PREFERIDO</Tag>
                )}
              </div>
              {record.nit && (
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  NIT: {record.nit}
                </Text>
              )}
            </div>
          </div>
        </div>
      ),
      sorter: (a: Supplier, b: Supplier) => a.name.localeCompare(b.name),
    },
    {
      title: 'Contacto',
      key: 'contact',
      render: (_: any, record: Supplier) => (
        <div>
          {record.contactPerson && (
            <div style={{ fontSize: '13px', marginBottom: 2 }}>
              👤 {record.contactPerson}
            </div>
          )}
          {record.phone && (
            <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
              <PhoneOutlined /> {record.phone}
            </div>
          )}
          {record.email && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              <MailOutlined /> {record.email}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'supplierType',
      key: 'supplierType',
      render: (type: string) => type ? <Tag>{type}</Tag> : '-',
      filters: [
        { text: '🌸 Esencias', value: 'ESENCIAS' },
        { text: '🍶 Frascos', value: 'FRASCOS' },
        { text: '💎 Originales', value: 'ORIGINALES' },
        { text: '🧴 Lociones', value: 'LOCIONES' },
        { text: '🧴 Cremas', value: 'CREMAS' },
        { text: '🔄 Mixto', value: 'MIXTO' },
        { text: '🚛 Distribuidor', value: 'DISTRIBUIDOR' },
        { text: '🏭 Fabricante', value: 'FABRICANTE' },
        { text: '🌍 Importador', value: 'IMPORTADOR' },
        { text: '🏪 Local', value: 'LOCAL' },
      ],
      onFilter: (value: any, record: Supplier) => record.supplierType === value,
    },
    {
      title: 'Términos de Pago',
      dataIndex: 'paymentTerms',
      key: 'paymentTerms',
      render: (terms: string) => terms ? <Tag color="blue">{terms}</Tag> : '-',
    },
    {
      title: 'Deuda Actual',
      key: 'currentDebt',
      render: (_: any, record: Supplier) => {
        const debt = record.currentDebt || 0;
        return (
          <div style={{ textAlign: 'right' }}>
            <Text strong style={{ color: debt > 0 ? '#ff4d4f' : '#52c41a' }}>
              ${debt.toLocaleString()}
            </Text>
            {record.creditLimit && (
              <div style={{ fontSize: '11px', color: '#999' }}>
                Límite: ${record.creditLimit.toLocaleString()}
              </div>
            )}
          </div>
        );
      },
      sorter: (a: Supplier, b: Supplier) => (a.currentDebt || 0) - (b.currentDebt || 0),
    },
    {
      title: 'Estado',
      key: 'status',
      render: (_: any, record: Supplier) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'ACTIVO' : 'INACTIVO'}
        </Tag>
      ),
      filters: [
        { text: 'Activo', value: true },
        { text: 'Inactivo', value: false },
      ],
      onFilter: (value: any, record: Supplier) => record.isActive === value,
    },
    {
      title: 'Acciones',
      key: 'actions',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: Supplier) => (
        <Space>
          <Tooltip title="Ver detalles">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => openDetailModal(record)}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Estás seguro de eliminar este proveedor?"
            onConfirm={() => handleDeleteSupplier(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Tooltip title="Eliminar">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        🏭 Gestión de Proveedores
      </Title>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Proveedores"
              value={totalSuppliers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Activos"
              value={activeSuppliers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Con Deuda"
              value={suppliersWithDebt}
              prefix={<CreditCardOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Deuda Total"
              value={totalDebt}
              prefix={<DollarOutlined />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="list" tabPosition="top">
          <TabPane tab="📋 Lista de Proveedores" key="list">
            <div>
              {/* Filtros y búsqueda */}
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} sm={8}>
                  <Input
                    placeholder="Buscar por nombre, NIT o contacto..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Select
                    placeholder="Filtrar por tipo"
                    value={selectedSupplierType}
                    onChange={setSelectedSupplierType}
                    allowClear
                    style={{ width: '100%' }}
                  >
                    <Option value="ESENCIAS">🌸 Esencias</Option>
                    <Option value="FRASCOS">🍶 Frascos y Envases</Option>
                    <Option value="ORIGINALES">💎 Perfumes Originales</Option>
                    <Option value="LOCIONES">🧴 Lociones y Splash</Option>
                    <Option value="CREMAS">🧴 Cremas y Cosméticos</Option>
                    <Option value="MIXTO">🔄 Mixto (Varios productos)</Option>
                    <Option value="DISTRIBUIDOR">🚛 Distribuidor General</Option>
                    <Option value="FABRICANTE">🏭 Fabricante</Option>
                    <Option value="IMPORTADOR">🌍 Importador</Option>
                    <Option value="LOCAL">🏪 Proveedor Local</Option>
                  </Select>
                </Col>
                <Col xs={24} sm={4}>
                  <Button
                    type={showWithDebtOnly ? 'primary' : 'default'}
                    onClick={() => setShowWithDebtOnly(!showWithDebtOnly)}
                    icon={<CreditCardOutlined />}
                  >
                    Con Deuda
                  </Button>
                </Col>
                <Col xs={24} sm={6} style={{ textAlign: 'right' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateModal}
                  >
                    Nuevo Proveedor
                  </Button>
                </Col>
              </Row>

              {error && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="danger">{error}</Text>
                </div>
              )}

              <Table
                columns={columns}
                dataSource={filteredSuppliers}
                loading={loading}
                rowKey="id"
                scroll={{ x: 1200 }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} de ${total} proveedores`,
                }}
              />
            </div>
          </TabPane>
          
          <TabPane tab="📊 Análisis y Reportes" key="analytics">
            <SupplierAnalytics suppliers={suppliers} />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modal de formulario */}
      <Modal
        title={editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingSupplier(null);
        }}
        footer={null}
        width={800}
        destroyOnClose
      >
        <SupplierForm
          initialValues={editingSupplier}
          onSubmit={editingSupplier ? handleUpdateSupplier : handleCreateSupplier}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>

      {/* Modal de detalles */}
      <Modal
        title="Detalles del Proveedor"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={900}
        destroyOnClose
      >
        {selectedSupplier && (
          <SupplierDetail supplier={selectedSupplier} />
        )}
      </Modal>
    </div>
  );
};

export default SupplierList;
