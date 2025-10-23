// src/components/suppliers/SupplierForm.tsx
import React from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Space,
  Typography,
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { Supplier, CreateSupplierData } from '../../features/suppliers/supplierSlice';

const { Option } = Select;
const { Title } = Typography;

interface SupplierFormProps {
  initialValues?: Supplier | null;
  onSubmit: (data: CreateSupplierData) => Promise<void>;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    const formData: CreateSupplierData = {
      name: values.name,
      nit: values.nit || null,
      supplierType: values.supplierType || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
    };

    await onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues || {}}
    >
      <Title level={4}>Información del Proveedor</Title>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Nombre del Proveedor"
            rules={[{ required: true, message: 'El nombre es obligatorio' }]}
          >
            <Input placeholder="Ej: Distribuidora ABC S.A.S" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="nit"
            label="NIT / RUT"
          >
            <Input placeholder="Ej: 123456789-0" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="supplierType"
            label="Tipo de Proveedor"
          >
            <Select placeholder="Seleccionar tipo" size="large">
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
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Teléfono"
          >
            <Input placeholder="Ej: +57 300 123 4567" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ type: 'email', message: 'Formato de email inválido' }]}
          >
            <Input placeholder="ejemplo@empresa.com" size="large" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="address"
            label="Dirección"
          >
            <Input placeholder="Dirección completa del proveedor" size="large" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
          >
            {initialValues ? 'Actualizar' : 'Crear'} Proveedor
          </Button>
          <Button
            onClick={onCancel}
            icon={<CloseOutlined />}
          >
            Cancelar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default SupplierForm;
