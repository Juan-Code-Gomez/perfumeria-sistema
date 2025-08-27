// src/components/suppliers/SupplierForm.tsx
import React from 'react';
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  Switch,
  InputNumber,
  Space,
  Typography,
  Divider,
} from 'antd';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import type { Supplier, CreateSupplierData } from '../../features/suppliers/supplierSlice';

const { TextArea } = Input;
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
      contactPerson: values.contactPerson || null,
      phone: values.phone || null,
      email: values.email || null,
      address: values.address || null,
      supplierType: values.supplierType || null,
      paymentTerms: values.paymentTerms || null,
      creditLimit: values.creditLimit || null,
      leadTimeDays: values.leadTimeDays || null,
      rating: values.rating || null,
      notes: values.notes || null,
      isActive: values.isActive !== undefined ? values.isActive : true,
      isPreferred: values.isPreferred || false,
    };

    await onSubmit(formData);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{
        isActive: true,
        isPreferred: false,
        rating: 3,
        leadTimeDays: 7,
        ...initialValues,
      }}
    >
      <Title level={4}>Información Básica</Title>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Nombre del Proveedor"
            rules={[
              { required: true, message: 'El nombre es obligatorio' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Distribuidora ABC S.A.S" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="nit"
            label="NIT / RUT"
            rules={[
              { pattern: /^[0-9\-]+$/, message: 'Formato de NIT inválido' },
            ]}
          >
            <Input placeholder="Ej: 123456789-0" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="contactPerson"
            label="Persona de Contacto"
          >
            <Input placeholder="Nombre del contacto principal" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="supplierType"
            label="Tipo de Proveedor"
          >
            <Select placeholder="Seleccionar tipo">
              <Option value="DISTRIBUIDOR">Distribuidor</Option>
              <Option value="FABRICANTE">Fabricante</Option>
              <Option value="IMPORTADOR">Importador</Option>
              <Option value="LOCAL">Local</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider />
      <Title level={4}>Información de Contacto</Title>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[
              { pattern: /^[\d\s\+\-\(\)]+$/, message: 'Formato de teléfono inválido' },
            ]}
          >
            <Input placeholder="Ej: +57 300 123 4567" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', message: 'Formato de email inválido' },
            ]}
          >
            <Input placeholder="ejemplo@empresa.com" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Dirección"
      >
        <TextArea
          rows={3}
          placeholder="Dirección completa del proveedor"
        />
      </Form.Item>

      <Divider />
      <Title level={4}>Términos Comerciales</Title>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="paymentTerms"
            label="Términos de Pago"
          >
            <Select placeholder="Seleccionar términos">
              <Option value="CONTADO">Contado</Option>
              <Option value="15_DIAS">15 días</Option>
              <Option value="30_DIAS">30 días</Option>
              <Option value="45_DIAS">45 días</Option>
              <Option value="60_DIAS">60 días</Option>
              <Option value="90_DIAS">90 días</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="creditLimit"
            label="Límite de Crédito"
          >
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as any}
              placeholder="0"
            />
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="leadTimeDays"
            label="Tiempo de Entrega (días)"
          >
            <InputNumber
              min={0}
              max={365}
              style={{ width: '100%' }}
              placeholder="7"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="rating"
            label="Calificación (1-5)"
          >
            <Select placeholder="Calificar proveedor">
              <Option value={1}>⭐ 1 - Muy Malo</Option>
              <Option value={2}>⭐⭐ 2 - Malo</Option>
              <Option value={3}>⭐⭐⭐ 3 - Regular</Option>
              <Option value={4}>⭐⭐⭐⭐ 4 - Bueno</Option>
              <Option value={5}>⭐⭐⭐⭐⭐ 5 - Excelente</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <div style={{ paddingTop: '30px' }}>
            <Space size="large">
              <Form.Item
                name="isActive"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Activo" unCheckedChildren="Inactivo" />
              </Form.Item>
              <Form.Item
                name="isPreferred"
                valuePropName="checked"
                style={{ marginBottom: 0 }}
              >
                <Switch checkedChildren="Preferido" unCheckedChildren="Normal" />
              </Form.Item>
            </Space>
          </div>
        </Col>
      </Row>

      <Form.Item
        name="notes"
        label="Notas Adicionales"
      >
        <TextArea
          rows={3}
          placeholder="Información adicional sobre el proveedor..."
        />
      </Form.Item>

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
