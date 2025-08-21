// src/pages/capital/CapitalManagement.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Typography,
  Popconfirm,
} from 'antd';
import {
  DollarOutlined,
  BankOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCapitalHistory,
  fetchCapitalSummary,
  createCapital,
  updateCapital,
  deleteCapital,
  clearError,
} from '../../features/capital/capitalSlice';
import type { Capital, CreateCapitalData, UpdateCapitalData } from '../../services/capitalService';
import dayjs from 'dayjs';

const { Title } = Typography;

interface CapitalFormData {
  cash: number;
  bank: number;
  description?: string;
}

const CapitalManagement: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, summary, loading, error } = useAppSelector((state) => state.capital);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Capital | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCapitalHistory());
    dispatch(fetchCapitalSummary());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleCreate = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item: Capital) => {
    setEditingItem(item);
    form.setFieldsValue({
      cash: item.cash,
      bank: item.bank,
      description: item.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCapital(id)).unwrap();
      message.success('Registro eliminado exitosamente');
      dispatch(fetchCapitalSummary());
    } catch (error) {
      message.error('Error al eliminar el registro');
    }
  };

  const handleSubmit = async (values: CapitalFormData) => {
    try {
      if (editingItem) {
        const updateData: UpdateCapitalData = values;
        await dispatch(updateCapital({ id: editingItem.id, data: updateData })).unwrap();
        message.success('Capital actualizado exitosamente');
      } else {
        const createData: CreateCapitalData = values;
        await dispatch(createCapital(createData)).unwrap();
        message.success('Capital registrado exitosamente');
      }
      
      setModalVisible(false);
      dispatch(fetchCapitalSummary());
    } catch (error) {
      message.error('Error al guardar el registro');
    }
  };

  const handleRefresh = () => {
    dispatch(fetchCapitalHistory());
    dispatch(fetchCapitalSummary());
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a: Capital, b: Capital) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Efectivo',
      dataIndex: 'cash',
      key: 'cash',
      render: (value: number) => (
        <span style={{ color: '#52c41a' }}>
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a: Capital, b: Capital) => a.cash - b.cash,
    },
    {
      title: 'Banco',
      dataIndex: 'bank',
      key: 'bank',
      render: (value: number) => (
        <span style={{ color: '#1890ff' }}>
          {formatCurrency(value)}
        </span>
      ),
      sorter: (a: Capital, b: Capital) => a.bank - b.bank,
    },
    {
      title: 'Total',
      key: 'total',
      render: (record: Capital) => (
        <span style={{ fontWeight: 'bold' }}>
          {formatCurrency(record.cash + record.bank)}
        </span>
      ),
      sorter: (a: Capital, b: Capital) => (a.cash + a.bank) - (b.cash + b.bank),
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 150,
      render: (record: Capital) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Editar
          </Button>
          <Popconfirm
            title="¿Está seguro de eliminar este registro?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Eliminar
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="mb-0">
          Gestión de Capital
        </Title>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            Actualizar
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Nuevo Registro
          </Button>
        </Space>
      </div>

      {/* Resumen de Capital */}
      {summary && (
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Efectivo Disponible"
                value={summary.cash}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Dinero en Banco"
                value={summary.bank}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<BankOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Capital Total"
                value={summary.total}
                formatter={(value) => formatCurrency(Number(value))}
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabla de Historial */}
      <Card title="Historial de Capital">
        <Table
          columns={columns}
          dataSource={items}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} registros`,
          }}
        />
      </Card>

      {/* Modal de Formulario */}
      <Modal
        title={editingItem ? 'Editar Capital' : 'Nuevo Registro de Capital'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Efectivo"
                name="cash"
                rules={[
                  { required: true, message: 'El monto en efectivo es requerido' },
                  { type: 'number', min: 0, message: 'El monto debe ser mayor o igual a 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Monto en efectivo"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  precision={2}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Banco"
                name="bank"
                rules={[
                  { required: true, message: 'El monto en banco es requerido' },
                  { type: 'number', min: 0, message: 'El monto debe ser mayor o igual a 0' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Monto en banco"
                  formatter={(value) =>
                    `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  precision={2}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Descripción"
            name="description"
          >
            <Input.TextArea
              placeholder="Descripción del registro (opcional)"
              rows={3}
              maxLength={200}
            />
          </Form.Item>

          <div className="flex justify-end space-x-2">
            <Button onClick={() => setModalVisible(false)}>
              Cancelar
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CapitalManagement;
