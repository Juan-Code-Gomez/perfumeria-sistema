import React, { useEffect } from 'react';
import { Form, Input, Button } from 'antd';

interface ClientFormProps {
  initialValues?: {
    name: string;
    document?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  onFinish: (values: {
    name: string;
    document?: string;
    phone?: string;
    email?: string;
    address?: string;
  }) => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ initialValues, onFinish }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) form.setFieldsValue(initialValues);
    else form.resetFields();
  }, [initialValues, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
    >
      <Form.Item
        name="name"
        label="Nombre"
        rules={[{ required: true, message: 'Por favor ingresa el nombre' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="document" label="Documento">
        <Input />
      </Form.Item>

      <Form.Item name="phone" label="Teléfono">
        <Input />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ type: 'email', message: 'Email no válido' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="address" label="Dirección">
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block>
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ClientForm;
