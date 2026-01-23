// src/pages/company-config/CompanyConfig.tsx
import React, { useEffect, useState } from 'react';
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
  Upload,
  Image,
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  PrinterOutlined,
  FileTextOutlined,
  GlobalOutlined,
  UploadOutlined,
  SecurityScanOutlined,
  DollarOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchCompanyConfig,
  updateCompanyConfig,
  fetchPublicCompanyConfig,
  uploadLogo,
  clearError,
  type CreateCompanyConfigData,
} from '../../features/company-config/companyConfigSlice';
import systemParametersService from '../../services/systemParametersService';
import type { SystemParameter } from '../../services/systemParametersService';


const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CompanyConfig: React.FC = () => {
  const dispatch = useAppDispatch();
  const { config, loading, error } = useAppSelector((state) => state.companyConfig);
  const { user } = useAppSelector((state) => state.auth);
  const [form] = Form.useForm();
  const [systemParameters, setSystemParameters] = useState<SystemParameter[]>([]);
  const [parametersLoading, setParametersLoading] = useState(false);
  
  // Verificar si el usuario es SUPER_ADMIN
  const userRoles = user?.roles?.map(ur => ur.role.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  useEffect(() => {
    dispatch(fetchCompanyConfig());
    // Cargar parámetros del sistema si es SUPER_ADMIN
    if (isSuperAdmin) {
      loadSystemParameters();
    }
  }, [dispatch, isSuperAdmin]);

  const loadSystemParameters = async () => {
    if (!isSuperAdmin) return;
    
    setParametersLoading(true);
    try {
      const parameters = await systemParametersService.getAllParameters();
      console.log('Parámetros cargados:', parameters); // Debug
      // Asegurar que siempre tengamos un array
      setSystemParameters(Array.isArray(parameters) ? parameters : []);
    } catch (error) {
      console.error('Error loading system parameters:', error);
      message.error('Error al cargar parámetros del sistema');
      // En caso de error, establecer un array vacío
      setSystemParameters([]);
    } finally {
      setParametersLoading(false);
    }
  };

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
        // Configuración de visualización de ticket POS
        showLogo: values.showLogo ?? true,
        showNIT: values.showNIT ?? true,
        showAddress: values.showAddress ?? true,
        showPhone: values.showPhone ?? true,
        showEmail: values.showEmail ?? true,
        showWebsite: values.showWebsite ?? true,
        ticketWidth: values.ticketWidth || '80mm',
        fontSize: values.fontSize || 'medium',
        includeVendor: values.includeVendor ?? true,
        includeCashSession: values.includeCashSession ?? false,
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

  const handleParameterChange = async (key: string, value: boolean) => {
    try {
      await systemParametersService.updateParameter(key, { parameterValue: value });
      setSystemParameters(prev => 
        prev.map(param => 
          param.parameterKey === key 
            ? { ...param, parameterValue: value }
            : param
        )
      );
      
      // Limpiar cache del POS si se modificó un parámetro relacionado
      if (key.includes('pos_')) {
        systemParametersService.clearPosCache();
      }
      
      message.success('Parámetro actualizado correctamente. Los cambios se aplicarán inmediatamente en el POS.');
    } catch (error) {
      message.error('Error al actualizar parámetro');
    }
  };

  const getParameterDisplayName = (key: string): string => {
    const displayNames: { [key: string]: string } = {
      'pos_edit_cost_enabled': 'Permitir editar costo en POS',
      'pos_show_profit_margin': 'Mostrar margen de ganancia',
      'allow_manual_sale_date': 'Permitir fecha manual en ventas',
      'audit_track_cost_changes': 'Auditar cambios de costos',
    };
    return displayNames[key] || key;
  };

  const handleLogoUpload = async (file: File) => {
    // Validaciones del archivo
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen');
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('El archivo debe ser menor a 5MB');
      return false;
    }

    try {
      await dispatch(uploadLogo(file)).unwrap();
      // También actualizar la configuración pública
      dispatch(fetchPublicCompanyConfig());
      message.success('Logo subido exitosamente');
    } catch (error: any) {
      message.error(error || 'Error al subir logo');
    }

    return false; // Prevenir upload automático
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
            label="Logo de la Empresa"
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              {config?.logo && (
                <Image
                  src={config.logo}
                  alt="Logo actual"
                  style={{ maxHeight: 100, maxWidth: 200 }}
                  fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiUoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYzN"
                />
              )}
              <Upload
                beforeUpload={handleLogoUpload}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>
                  {config?.logo ? 'Cambiar Logo' : 'Subir Logo'}
                </Button>
              </Upload>
              <small style={{ color: '#666' }}>
                Formatos soportados: JPG, PNG, GIF, WebP. Tamaño máximo: 5MB
              </small>
            </Space>
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

      <Divider>Opciones de Visualización del Ticket</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showLogo"
            valuePropName="checked"
            label="Mostrar Logo"
            tooltip="Mostrar el logo de la empresa en el ticket"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showNIT"
            valuePropName="checked"
            label="Mostrar NIT/RUT"
            tooltip="Mostrar el número de identificación tributaria"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showAddress"
            valuePropName="checked"
            label="Mostrar Dirección"
            tooltip="Mostrar la dirección de la empresa"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showPhone"
            valuePropName="checked"
            label="Mostrar Teléfono"
            tooltip="Mostrar el teléfono de contacto"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showEmail"
            valuePropName="checked"
            label="Mostrar Email"
            tooltip="Mostrar el correo electrónico"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="showWebsite"
            valuePropName="checked"
            label="Mostrar Sitio Web"
            tooltip="Mostrar la dirección web"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Formato del Ticket</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={8}>
          <Form.Item
            name="ticketWidth"
            label="Ancho del Ticket"
            tooltip="Ancho del papel de la impresora térmica"
          >
            <Select placeholder="Seleccionar ancho">
              <Option value="58mm">58mm (Pequeño)</Option>
              <Option value="80mm">80mm (Estándar)</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="fontSize"
            label="Tamaño de Fuente"
            tooltip="Tamaño del texto en el ticket"
          >
            <Select placeholder="Seleccionar tamaño">
              <Option value="small">Pequeña</Option>
              <Option value="medium">Mediana</Option>
              <Option value="large">Grande</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={8}>
          <Form.Item
            name="printLogo"
            valuePropName="checked"
            label="Imprimir Logo"
            tooltip="Incluir logo en la impresión"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Información Adicional</Divider>

      <Row gutter={16}>
        <Col xs={24} sm={12}>
          <Form.Item
            name="includeVendor"
            valuePropName="checked"
            label="Incluir Vendedor"
            tooltip="Mostrar el nombre del vendedor en el ticket"
          >
            <Switch defaultChecked />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
          <Form.Item
            name="includeCashSession"
            valuePropName="checked"
            label="Incluir Sesión de Caja"
            tooltip="Mostrar el número de sesión de caja"
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
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

      {/* Sección de Parámetros del Sistema - Solo para SUPER_ADMIN */}
      {isSuperAdmin && (
        <>
          <Divider />
          <Title level={5}>
            <SecurityScanOutlined /> Parámetros Avanzados
          </Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  <DollarOutlined /> Punto de Venta
                </Text>
                {parametersLoading ? (
                  <Text type="secondary">Cargando parámetros...</Text>
                ) : Array.isArray(systemParameters) && systemParameters.length > 0 ? (
                  systemParameters
                    .filter(param => param.category === 'pos' || param.category === 'sales')
                    .map(param => (
                      <div key={param.parameterKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <div style={{ flex: 1 }}>
                          <Text>{getParameterDisplayName(param.parameterKey)}</Text>
                          {param.parameterKey === 'allow_manual_sale_date' && (
                            <div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Para migración de datos históricos
                              </Text>
                            </div>
                          )}
                        </div>
                        <Switch
                          checked={param.parameterValue}
                          onChange={(checked) => handleParameterChange(param.parameterKey, checked)}
                          loading={parametersLoading}
                        />
                      </div>
                    ))
                ) : (
                  <Text type="secondary">No hay parámetros de POS configurados</Text>
                )}
              </Space>
            </Col>
            <Col xs={24} sm={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>
                  <ShopOutlined /> Sistema
                </Text>
                {parametersLoading ? (
                  <Text type="secondary">Cargando parámetros...</Text>
                ) : Array.isArray(systemParameters) && systemParameters.length > 0 ? (
                  systemParameters
                    .filter(param => param.category === 'security')
                    .map(param => (
                      <div key={param.parameterKey} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <Text>{getParameterDisplayName(param.parameterKey)}</Text>
                        <Switch
                          checked={param.parameterValue}
                          onChange={(checked) => handleParameterChange(param.parameterKey, checked)}
                          loading={parametersLoading}
                        />
                      </div>
                    ))
                ) : (
                  <Text type="secondary">No hay parámetros de Sistema configurados</Text>
                )}
              </Space>
            </Col>
          </Row>
        </>
      )}
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
