import React, { useEffect } from 'react';
import { Form, Input, Button, Row, Col } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined } from '@ant-design/icons';
import type { Client, ClientCreateData } from '../../features/clients/types';

interface ClientFormProps {
  initialValues?: Partial<Client>;
  onFinish: (values: ClientCreateData) => void;
  loading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialValues, onFinish, loading = false }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      size="middle"
    >
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="name"
            label="Nombre Completo"
            rules={[
              { required: true, message: 'El nombre es obligatorio' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
              { max: 100, message: 'El nombre no puede exceder 100 caracteres' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Ej: Juan Pérez"
              showCount
              maxLength={100}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} sm={12}>
          <Form.Item
            name="document"
            label="Documento de Identidad"
            rules={[
              { pattern: /^[0-9-]*$/, message: 'Solo se permiten números y guiones' },
              { max: 20, message: 'El documento no puede exceder 20 caracteres' }
            ]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Ej: 12345678-9"
              maxLength={20}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="phone"
            label="Teléfono"
            rules={[
              { pattern: /^[+]?[0-9\s()-]*$/, message: 'Formato de teléfono inválido' },
              { max: 20, message: 'El teléfono no puede exceder 20 caracteres' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="Ej: +57 300 123 4567"
              maxLength={20}
            />
          </Form.Item>
        </Col>
        
        <Col xs={24} sm={12}>
          <Form.Item
            name="email"
            label="Correo Electrónico"
            rules={[
              { type: 'email', message: 'Formato de email inválido' },
              { max: 100, message: 'El email no puede exceder 100 caracteres' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Ej: juan@email.com"
              maxLength={100}
            />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Dirección"
        rules={[
          { max: 200, message: 'La dirección no puede exceder 200 caracteres' }
        ]}
      >
        <Input.TextArea 
          placeholder="Ej: Calle 123 #45-67, Barrio Centro"
          rows={2}
          showCount
          maxLength={200}
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          size="large"
          loading={loading}
        >
          {initialValues ? 'Actualizar Cliente' : 'Crear Cliente'}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ClientForm;
