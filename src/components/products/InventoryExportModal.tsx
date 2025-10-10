// src/components/products/InventoryExportModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Select,
  Checkbox,
  Button,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Tag,
  message,
  Spin
} from 'antd';
import {
  FileExcelOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SettingOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { exportInventory } from '../../features/products/productSlice';
import { getCategories } from '../../features/categories/categoriesSlice';
import type { InventoryExportOptions } from '../../services/productService';

const { Option } = Select;
const { Title, Text } = Typography;

interface InventoryExportModalProps {
  visible: boolean;
  onCancel: () => void;
}

const InventoryExportModal: React.FC<InventoryExportModalProps> = ({
  visible,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.products);
  const { listCategories: categories } = useAppSelector((state) => state.categories);
  
  const [selectedFormat, setSelectedFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [previewOptions, setPreviewOptions] = useState<InventoryExportOptions>({});

  // Cargar categorías al abrir el modal
  useEffect(() => {
    if (visible) {
      dispatch(getCategories({}));
      // Reset form cuando se abre el modal
      form.resetFields();
      setSelectedFormat('excel');
      setPreviewOptions({});
    }
  }, [visible, dispatch, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    const options: InventoryExportOptions = {
      format: allValues.format || 'excel',
      groupBy: allValues.groupBy || 'none',
      stockFilter: allValues.stockFilter || 'all',
      includePhysicalCountColumns: allValues.includePhysicalCountColumns || false,
      includeStockValue: allValues.includeStockValue || false,
      includeImages: allValues.includeImages || false,
      sortBy: allValues.sortBy || 'name',
      categoryIds: allValues.categoryIds || [],
      supplierIds: allValues.supplierIds || [],
    };
    
    setPreviewOptions(options);
    if (changedValues.format) {
      setSelectedFormat(changedValues.format);
    }
  };

  const handleExport = async () => {
    try {
      const values = await form.validateFields();
      const options: InventoryExportOptions = {
        format: values.format || 'excel',
        groupBy: values.groupBy || 'none',
        stockFilter: values.stockFilter || 'all',
        includePhysicalCountColumns: values.includePhysicalCountColumns || false,
        includeStockValue: values.includeStockValue || false,
        includeImages: values.includeImages || false,
        sortBy: values.sortBy || 'name',
        categoryIds: values.categoryIds || [],
        supplierIds: values.supplierIds || [],
      };

      await dispatch(exportInventory(options)).unwrap();
      message.success('Inventario exportado exitosamente');
      onCancel();
    } catch (error: any) {
      message.error(error || 'Error al exportar inventario');
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'excel': return <FileExcelOutlined style={{ color: '#52c41a' }} />;
      case 'pdf': return <FilePdfOutlined style={{ color: '#f5222d' }} />;
      case 'csv': return <FileTextOutlined style={{ color: '#1890ff' }} />;
      default: return <FileExcelOutlined />;
    }
  };

  const getFormatDescription = (format: string) => {
    switch (format) {
      case 'excel': 
        return 'Ideal para inventarios físicos con cálculos automáticos';
      case 'pdf': 
        return 'Perfecto para imprimir y usar en almacén';
      case 'csv': 
        return 'Compatible con otros sistemas y aplicaciones';
      default: 
        return '';
    }
  };

  return (
    <Modal
      title={
        <Space>
          <DownloadOutlined />
          Exportar Inventario para Conteo Físico
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancelar
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleExport}
          loading={loading}

        >
          Exportar {selectedFormat.toUpperCase()}
        </Button>,
      ]}
      width={800}
      centered
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          format: 'excel',
          groupBy: 'none',
          stockFilter: 'all',
          sortBy: 'name',
          includePhysicalCountColumns: true,
          includeStockValue: false,
          includeImages: false,
        }}
        onValuesChange={handleValuesChange}
      >
        {/* Formato de Exportación */}
        <Card size="small" style={{ marginBottom: 16 }}>
          <Title level={5}>
            <SettingOutlined /> Formato de Exportación
          </Title>
          <Form.Item name="format">
            <Select 
              size="large"
              placeholder="Seleccionar formato"
              onChange={(value) => setSelectedFormat(value)}
              optionLabelProp="label"
            >
              <Option value="excel" label="Excel (.xlsx)">
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ marginRight: 12, fontSize: '18px' }}>
                    {getFormatIcon('excel')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      Excel (.xlsx)
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.3 }}>
                      {getFormatDescription('excel')}
                    </div>
                  </div>
                </div>
              </Option>
              <Option value="csv" label="CSV (.csv)">
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ marginRight: 12, fontSize: '18px' }}>
                    {getFormatIcon('csv')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      CSV (.csv)
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.3 }}>
                      {getFormatDescription('csv')}
                    </div>
                  </div>
                </div>
              </Option>
              <Option value="pdf" label="PDF (.pdf)">
                <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                  <div style={{ marginRight: 12, fontSize: '18px' }}>
                    {getFormatIcon('pdf')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>
                      PDF (.pdf) <Tag color="orange" style={{ marginLeft: 8 }}>Nuevo</Tag>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', lineHeight: 1.3 }}>
                      {getFormatDescription('pdf')}
                    </div>
                  </div>
                </div>
              </Option>
            </Select>
          </Form.Item>
        </Card>

        <Row gutter={16}>
          {/* Filtros y Agrupación */}
          <Col span={12}>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>
                <FilterOutlined /> Filtros y Organización
              </Title>
              
              <Form.Item label="Agrupar por" name="groupBy">
                <Select placeholder="Sin agrupación">
                  <Option value="none">Sin agrupación</Option>
                  <Option value="category">Por categoría</Option>
                  <Option value="supplier">Por proveedor</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Filtrar stock" name="stockFilter">
                <Select>
                  <Option value="all">Todos los productos</Option>
                  <Option value="available">Solo con stock</Option>
                  <Option value="low">Stock bajo</Option>
                  <Option value="out">Sin stock</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Ordenar por" name="sortBy">
                <Select>
                  <Option value="name">Nombre</Option>
                  <Option value="category">Categoría</Option>
                  <Option value="stock">Stock</Option>
                  <Option value="value">Valor</Option>
                  <Option value="code">Código</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Filtrar por categorías" name="categoryIds">
                <Select
                  mode="multiple"
                  placeholder="Todas las categorías"
                  allowClear
                >
                  {categories.map((cat: any) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Card>
          </Col>

          {/* Opciones de Contenido */}
          <Col span={12}>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Title level={5}>Opciones de Contenido</Title>
              
              <Form.Item name="includePhysicalCountColumns" valuePropName="checked">
                <Checkbox>
                  <strong>Columnas para conteo físico</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Incluye columnas vacías para escribir el stock físico, 
                    diferencias y observaciones
                  </Text>
                </Checkbox>
              </Form.Item>

              <Form.Item name="includeStockValue" valuePropName="checked">
                <Checkbox>
                  <strong>Información de precios y valores</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Incluye precios unitarios y valores de inventario
                  </Text>
                </Checkbox>
              </Form.Item>

              <Form.Item name="includeImages" valuePropName="checked">
                <Checkbox>
                  <strong>URLs de imágenes</strong>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Incluye enlaces a las imágenes de productos
                  </Text>
                </Checkbox>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* Vista previa de configuración */}
        {Object.keys(previewOptions).length > 0 && (
          <Card size="small" style={{ backgroundColor: '#f8f9fa' }}>
            <Title level={5}>Vista Previa de Configuración</Title>
            <Space wrap>
              <Tag color="blue">
                Formato: {previewOptions.format?.toUpperCase()}
              </Tag>
              {previewOptions.groupBy !== 'none' && (
                <Tag color="green">
                  Agrupado por: {previewOptions.groupBy}
                </Tag>
              )}
              <Tag color="orange">
                Stock: {previewOptions.stockFilter}
              </Tag>
              {previewOptions.includePhysicalCountColumns && (
                <Tag color="purple">Conteo físico</Tag>
              )}
              {previewOptions.includeStockValue && (
                <Tag color="gold">Valores</Tag>
              )}
              {previewOptions.includeImages && (
                <Tag color="cyan">Imágenes</Tag>
              )}
            </Space>
          </Card>
        )}
      </Form>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: 16, padding: '20px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '6px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, marginBottom: 8 }}>
            <Text strong style={{ fontSize: '14px' }}>Generando archivo de inventario...</Text>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {selectedFormat === 'pdf' ? (
              <>⏳ Los archivos PDF pueden tardar hasta 60 segundos en generarse</>
            ) : (
              <>⏳ Esto puede tomar unos momentos...</>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default InventoryExportModal;