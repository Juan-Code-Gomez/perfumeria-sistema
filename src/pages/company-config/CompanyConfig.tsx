// src/pages/company-config/CompanyConfig.tsx
import React, { useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Typography,
  Divider,
  InputNumber,
  Switch,
  Select,
  message,
  Tabs,
  Space,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  PrinterOutlined,
  FileTextOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCompanyConfig,
  updateCompanyConfig,
  fetchPublicCompanyConfig,
  clearError,
  type CreateCompanyConfigData,
} from '../../features/company-config/companyConfigSlice';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CompanyConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, loading, error } = useAppSelector((state) => state.companyConfig);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(fetchCompanyConfig());
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      form.setFieldsValue(config);
    }
  }, [config, form]);

  useEffect(() => {
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (values: any) => {
    try {
      const formData: CreateCompanyConfigData = {
        companyName: values.companyName,
        nit: values.nit || undefined,
        address: values.address || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        website: values.website || undefined,
        logo: values.logo || undefined,
        invoicePrefix: values.invoicePrefix || undefined,
        invoiceFooter: values.invoiceFooter || undefined,
        taxRate: values.taxRate || 0,
        currency: values.currency || 'COP',
        posReceiptHeader: values.posReceiptHeader || undefined,
        posReceiptFooter: values.posReceiptFooter || undefined,
        printLogo: values.printLogo || false,
        timezone: values.timezone || 'America/Bogota',
        dateFormat: values.dateFormat || 'DD/MM/YYYY',
        numberFormat: values.numberFormat || 'es-CO',
      };

      await dispatch(updateCompanyConfig(formData)).unwrap();
      // También actualizar la configuración pública para reflejar cambios en el login
      dispatch(fetchPublicCompanyConfig());
      message.success('Configuración actualizada exitosamente');
    } catch (error: any) {
      message.error(error || 'Error al actualizar configuración');
    }
  };

  const handleReset = () => {
    if (config) {
      form.setFieldsValue(config);
      message.info('Formulario restaurado');
    }
  };

  const basicInfoForm = (
    <Card>
      <Title level={4}>
        <SettingOutlined /> Información Básica
      </Title>
      
      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="companyName"
            label="Nombre de la Empresa"
            rules={[
              { required: true, message: 'El nombre de la empresa es obligatorio' },
              { min: 2, message: 'El nombre debe tener al menos 2 caracteres' },
            ]}
          >
            <Input placeholder="Ej: Perfumería Milan" />
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
            <Input placeholder="info@empresa.com" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Dirección"
      >
        <TextArea
          rows={3}
          placeholder="Dirección completa de la empresa"
        />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="website"
            label="Sitio Web"
          >
            <Input placeholder="www.empresa.com" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="logo"
            label="URL del Logo"
          >
            <Input placeholder="https://ejemplo.com/logo.png" />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const invoiceConfigForm = (
    <Card>
      <Title level={4}>
        <FileTextOutlined /> Configuración de Facturación
      </Title>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="invoicePrefix"
            label="Prefijo de Facturas"
          >
            <Input placeholder="Ej: FACT-" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="taxRate"
            label="Tasa de Impuesto (%)"
          >
            <InputNumber
              min={0}
              max={100}
              step={0.1}
              style={{ width: '100%' }}
              placeholder="19"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="currency"
            label="Moneda"
          >
            <Select placeholder="Seleccionar moneda">
              <Option value="COP">Peso Colombiano (COP)</Option>
              <Option value="USD">Dólar Americano (USD)</Option>
              <Option value="EUR">Euro (EUR)</Option>
              <Option value="MXN">Peso Mexicano (MXN)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="invoiceFooter"
        label="Pie de Página de Facturas"
      >
        <TextArea
          rows={3}
          placeholder="Mensaje que aparecerá al final de las facturas"
        />
      </Form.Item>
    </Card>
  );

  const posConfigForm = (
    <Card>
      <Title level={4}>
        <PrinterOutlined /> Configuración POS
      </Title>

      <Form.Item
        name="posReceiptHeader"
        label="Encabezado del Recibo"
      >
        <TextArea
          rows={4}
          placeholder="*** NOMBRE DE LA EMPRESA ***&#10;NIT: 123456789-0&#10;Dirección: Calle Principal #123&#10;Tel: +57 300 123 4567"
        />
      </Form.Item>

      <Form.Item
        name="posReceiptFooter"
        label="Pie de Página del Recibo"
      >
        <TextArea
          rows={3}
          placeholder="¡Gracias por su compra!&#10;Siga nuestras redes sociales&#10;@empresa"
        />
      </Form.Item>

      <Form.Item
        name="printLogo"
        valuePropName="checked"
        label="Imprimir Logo en Recibos"
      >
        <Switch />
      </Form.Item>
    </Card>
  );

  const systemConfigForm = (
    <Card>
      <Title level={4}>
        <GlobalOutlined /> Configuración del Sistema
      </Title>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="timezone"
            label="Zona Horaria"
          >
            <Select placeholder="Seleccionar zona horaria">
              <Option value="America/Bogota">América/Bogotá</Option>
              <Option value="America/Mexico_City">América/Ciudad_de_México</Option>
              <Option value="America/New_York">América/Nueva_York</Option>
              <Option value="America/Lima">América/Lima</Option>
              <Option value="America/Caracas">América/Caracas</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="dateFormat"
            label="Formato de Fecha"
          >
            <Select placeholder="Seleccionar formato">
              <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
              <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
              <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              <Option value="DD-MM-YYYY">DD-MM-YYYY</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="numberFormat"
            label="Formato de Números"
          >
            <Select placeholder="Seleccionar formato">
              <Option value="es-CO">Español (Colombia)</Option>
              <Option value="en-US">Inglés (Estados Unidos)</Option>
              <Option value="es-MX">Español (México)</Option>
              <Option value="pt-BR">Portugués (Brasil)</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );

  const tabItems = [
    {
      key: 'basic',
      label: 'Información Básica',
      children: basicInfoForm,
    },
    {
      key: 'invoice',
      label: 'Facturación',
      children: invoiceConfigForm,
    },
    {
      key: 'pos',
      label: 'Punto de Venta',
      children: posConfigForm,
    },
    {
      key: 'system',
      label: 'Sistema',
      children: systemConfigForm,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        ⚙️ Configuración de Empresa
      </Title>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            currency: 'COP',
            timezone: 'America/Bogota',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: 'es-CO',
            taxRate: 0,
            printLogo: false,
          }}
        >
          <Tabs items={tabItems} />

          <Divider />

          <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
            <Space size="middle">
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={loading}
                size="large"
              >
                Guardar Configuración
              </Button>
              <Button
                onClick={handleReset}
                icon={<ReloadOutlined />}
                size="large"
              >
                Restaurar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CompanyConfig;
