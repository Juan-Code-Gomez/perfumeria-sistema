// src/pages/products/ProductList.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Button,
  Input,
  Modal,
  Popconfirm,
  Row,
  Col,
  Table,
  Tag,
  Form,
  Select,
  message,
  Card,
  Checkbox,
  Space,
  Drawer,
} from "antd";
import { 
  TableOutlined, 
  AppstoreOutlined, 
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  ScanOutlined,
  BarcodeOutlined,
  BarChartOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store/index";
import {
  fetchProducts,
  setFilters,
  clearFilters,
  setPage,
  deleteProduct,
  exportProducts,
} from "../../features/products/productSlice";
import type { Category, Unit } from "../../features/products/types";
import type { Product } from "../../services/productService";
import type { RootState } from "../../store";
import ProductForm from "../../components/products/ProductForm";
import ProductCardView from "../../components/products/ProductCardView";
import ProductStats from "../../components/products/ProductStats";
import { getCategories } from "../../features/categories/categoriesSlice";
import { getUnits } from "../../features/units/unitsSlice";
import BulkUploadProducts from "../../components/products/BulkUploadProducts";
import InventoryExportModal from "../../components/products/InventoryExportModal";
import BarcodeScanner from "../../components/products/BarcodeScanner";
import BarcodeGenerator from "../../components/products/BarcodeGenerator";
import QuickBarcodeScanner from "../../components/products/QuickBarcodeScanner";
import LabelPrintManager from "../../components/products/LabelPrintManager";
import ProductBatchesModal from "../../components/products/ProductBatchesModal";
import { usePermissions } from "../../hooks/usePermissions";

const { Option } = Select;

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters, page, pageSize, total } =
    useAppSelector((state: RootState) => state.products);
  const { listCategories } = useAppSelector(
    (state: RootState) => state.categories
  );
  const { listUnits } = useAppSelector((state: RootState) => state.units);
  
  // Responsive states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  );
  const [openBulkModal, setOpenBulkModal] = useState(false);
  const [openInventoryExportModal, setOpenInventoryExportModal] = useState(false);
  const [openBarcodeScanner, setOpenBarcodeScanner] = useState(false);
  const [openBarcodeGenerator, setOpenBarcodeGenerator] = useState(false);
  const [openLabelManager, setOpenLabelManager] = useState(false);
  const [selectedProductForBarcode, setSelectedProductForBarcode] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [batchModalVisible, setBatchModalVisible] = useState(false);
  const [selectedProductForBatches, setSelectedProductForBatches] = useState<{ id: number; name: string } | null>(null);

  const [form] = Form.useForm();

  // Hook de permisos
  const { hasPermission, isAdmin } = usePermissions();
  const user = useAppSelector((state: RootState) => state.auth.user);

  // Verificar permisos específicos (usar useMemo para reactivity)
  const canEditProducts = useMemo(() => hasPermission('productos', 'edit'), [hasPermission]);
  const canDeleteProducts = useMemo(() => hasPermission('productos', 'delete'), [hasPermission]);
  const canCreateProducts = useMemo(() => hasPermission('productos', 'create'), [hasPermission]);
  const canExportProducts = useMemo(() => hasPermission('productos', 'export'), [hasPermission]);
  const canViewStock = useMemo(() => {
    const adminCheck = isAdmin();
    console.log('🔍 Verificando si puede ver stock:', {
      isAdmin: adminCheck,
      user: user,
      roles: user?.roles
    });
    return adminCheck;
  }, [isAdmin, user]); // Se recalcula cuando cambia isAdmin o user

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carga inicial y cuando cambian los filtros
  useEffect(() => {
    // Resetear a la página 1 cuando el componente se monta
    if (page !== 1) {
      dispatch(setPage({ page: 1, pageSize }));
    } else {
      dispatch(fetchProducts({ ...filters, page, pageSize }));
    }
    // Solo ejecutar al montar el componente
    // eslint-disable-next-line
  }, []);

  // Efecto separado para cambios en filtros y paginación
  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page, pageSize }));
  }, [dispatch, filters, page, pageSize]);

  useEffect(() => {
    // Solo cargar categorías si nunca se han cargado
    if (!listCategories || listCategories.length === 0) {
      dispatch(getCategories({}));
    }
    if (!listUnits || listUnits.length === 0) {
      dispatch(getUnits({}));
    }
    // Solo se ejecuta una vez al inicio
    // eslint-disable-next-line
  }, [dispatch]);

  useEffect(() => {
    form.setFieldsValue(filters);
  }, [filters, form]);

  // Control de filtros
  const onFinishFilters = (values: any) => {
    // Limpia valores vacíos para evitar mandar undefined/null innecesarios
    const cleanValues = { ...values };

    // Convierte valores numéricos
    if (cleanValues.categoryId)
      cleanValues.categoryId = Number(cleanValues.categoryId);
    if (cleanValues.unitId) cleanValues.unitId = Number(cleanValues.unitId);
    if (cleanValues.supplierId) cleanValues.supplierId = Number(cleanValues.supplierId);
    if (cleanValues.stockMin)
      cleanValues.stockMin = Number(cleanValues.stockMin);
    if (cleanValues.stockMax)
      cleanValues.stockMax = Number(cleanValues.stockMax);

    // Solo manda filtros relevantes (opcional)
    Object.keys(cleanValues).forEach((key) => {
      if (cleanValues[key] === "" || cleanValues[key] === undefined) {
        delete cleanValues[key];
      }
    });

    // Actualiza filtros en el slice y dispara fetch
    dispatch(setFilters(cleanValues));
    // ¡No llames fetchProducts aquí! Ya lo tienes en el useEffect que depende de filters
  };
  const onClearFilters = () => {
    form.resetFields();
    dispatch(clearFilters());
  };

  // CRUD local + llamada a thunks (puedes reemplazar add/update/delete por sus thunks)
  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success("Producto eliminado exitosamente");
      // Recargar los productos para actualizar la lista
      dispatch(fetchProducts(filters));
    } catch (error) {
      message.error("Error al eliminar el producto");
      console.error("Error deleting product:", error);
    }
  };

  const handleExport = async () => {
    try {
      await dispatch(exportProducts()).unwrap();
      message.success("Productos exportados exitosamente");
    } catch (error) {
      message.error("Error al exportar productos");
      console.error("Error exporting products:", error);
    }
  };

  // Handlers para códigos de barras
  const handleProductFoundByBarcode = (product: Product) => {
    console.log('Producto encontrado por código de barras:', product);
    message.success(`Producto encontrado: ${product.name}`);
    
    // Aquí podrías abrir el modal de edición, agregar a carrito, etc.
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleBarcodeGenerated = (product: Product) => {
    console.log('Código generado para producto:', product);
    message.success(`Código generado: ${product.barcode}`);
    
    // Refrescar la lista de productos
    dispatch(fetchProducts({ ...filters, page, pageSize }));
  };

  const handleShowModal = (product?: Product) => {
    setEditingProduct(product ?? null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  // columnas de la tabla - responsive
  const columns = [
    ...(!isMobile ? [{
      title: "Imagen",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 60,
      render: (url: string) =>
        url ? (
          <img
            src={url}
            alt="Imagen"
            style={{
              width: 40,
              height: 40,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        ) : (
          <Tag color="default">Sin imagen</Tag>
        ),
    }] : []),
    { 
      title: "Nombre", 
      dataIndex: "name", 
      key: "name",
      width: isMobile ? undefined : 200,
      ellipsis: true,
    },
    ...(!isMobile ? [{
      title: "Unidad",
      dataIndex: "unit",
      key: "unit",
      width: 100,
      render: (u: Unit | undefined) => <Tag>{u?.name || 'Sin unidad'}</Tag>,
    }] : []),
    ...(!isMobile && !isTablet ? [{
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (c: Category | undefined) => <Tag>{c?.name || 'Sin categoría'}</Tag>,
    }] : []),
    // Stock - Solo visible para administradores
    ...(canViewStock ? [{
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: isMobile ? 70 : 80,
      render: (s: number) => {
        if (s <= 1) {
          return (
            <Tag color="red">
              {s} <span role="img">🔴</span>
            </Tag>
          );
        } else if (s === 2) {
          return (
            <Tag color="orange">
              {s} <span role="img">🟡</span>
            </Tag>
          );
        } else {
          return <span>{s}</span>;
        }
      },
    }] : []),
    // Precio de compra - Solo visible para roles administrativos y no mobile
    ...(hasPermission('productos', 'edit') && !isMobile && !isTablet ? [{
      title: "P. Compra",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      width: 100,
      render: (v: number) => v ? `$${v.toLocaleString()}` : '$0',
    }] : []),
    {
      title: "P. Venta",
      dataIndex: "salePrice",
      key: "salePrice",
      width: isMobile ? 90 : 100,
      render: (v: number) => v ? `$${v.toLocaleString()}` : '$0',
    },
    // Utilidad y margen - Solo visible para roles administrativos y desktop
    ...(hasPermission('productos', 'edit') && !isMobile && !isTablet ? [
      {
        title: "Utilidad",
        dataIndex: "utilidad",
        key: "utilidad",
        width: 90,
        render: (v: number) => (v != null ? `$${v.toLocaleString()}` : "-"),
      },
      {
        title: "Margen",
        dataIndex: "margen",
        key: "margen",
        width: 80,
        render: (v: number) => (
          <Tag color={v >= 50 ? "green" : v >= 20 ? "orange" : "red"}>
            {v ? `${v.toFixed(1)}%` : "-"}
          </Tag>
        ),
      }
    ] : []),
    // Columna de acciones - Condicionada por permisos
    ...(canEditProducts || canDeleteProducts ? [{
      title: "Acciones",
      key: "actions",
      fixed: isMobile ? ('right' as const) : undefined,
      width: isMobile ? 80 : isTablet ? 180 : 200,
      render: (_: any, record: Product) => (
        <Space size="small" direction={isMobile ? "vertical" : "horizontal"}>
          {!isMobile && (
            <Button 
              type="default"
              icon={<BarChartOutlined />}
              onClick={() => {
                setSelectedProductForBatches({ id: record.id, name: record.name });
                setBatchModalVisible(true);
              }}
              size={isTablet ? "middle" : "small"}
            >
              Ver Lotes
            </Button>
          )}
          {canEditProducts && (
            <Button 
              type="link" 
              onClick={() => handleShowModal(record)}
              size={isMobile ? "middle" : "small"}
            >
              {isMobile ? "✏️" : "Editar"}
            </Button>
          )}
          {canDeleteProducts && (
            <Popconfirm
              title="Eliminar producto?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Button danger type="link">
                Eliminar
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    }] : []),
  ];

  return (
    <div className="p-4">
      <Row 
        justify="space-between" 
        align="middle" 
        className="mb-4"
        gutter={isMobile ? [8, 8] : [16, 16]}
      >
        <Col xs={24} sm={24} md={12}>
          <h1 
            className="font-semibold" 
            style={{ 
              fontSize: isMobile ? '1.5rem' : '2rem',
              marginBottom: isMobile ? '4px' : '8px'
            }}
          >
            Gestión de Productos
          </h1>
          <p 
            className="text-gray-600" 
            style={{ fontSize: isMobile ? '12px' : '14px' }}
          >
            Administra tu inventario de perfumes y fragancias ({total} productos)
          </p>
        </Col>
        <Col xs={24} sm={24} md={12}>
          <Space 
            size={isMobile ? "small" : "middle"} 
            wrap
            style={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}
          >
            {/* Toggle de vista */}
            <Space>
              {!isMobile && (
                <span style={{ fontSize: 12, color: '#666' }}>Vista:</span>
              )}
              <Button.Group>
                <Button
                  type={viewMode === 'table' ? 'primary' : 'default'}
                  icon={<TableOutlined />}
                  onClick={() => setViewMode('table')}
                  size={isMobile ? "middle" : "small"}
                >
                  {!isMobile && "Tabla"}
                </Button>
                <Button
                  type={viewMode === 'cards' ? 'primary' : 'default'}
                  icon={<AppstoreOutlined />}
                  onClick={() => setViewMode('cards')}
                  size={isMobile ? "middle" : "small"}
                >
                  {!isMobile && "Tarjetas"}
                </Button>
              </Button.Group>
            </Space>
            
            {!isMobile && canExportProducts && (
              <Button
                href="/plantilla-carga-masiva-productos.xlsx"
                target="_blank"
                icon={<FileExcelOutlined />}
                size="small"
              >
                Plantilla
              </Button>
            )}
            
            {canCreateProducts && (
              <Button
                onClick={() => setOpenBulkModal(true)}
                icon={<UploadOutlined />}
                size={isMobile ? "middle" : "small"}
              >
                {!isMobile && "Carga masiva"}
              </Button>
            )}
            
            {!isMobile && canExportProducts && (
              <Button
                onClick={handleExport}
                icon={<DownloadOutlined />}
                type="default"
                loading={loading}
                size="small"
              >
                Exportar Lista
              </Button>
            )}
            
            {!isMobile && canExportProducts && (
              <Button
                onClick={() => setOpenInventoryExportModal(true)}
                icon={<FileExcelOutlined />}
                type="default"
                loading={loading}
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a', color: 'white' }}
              >
                Inventario Físico
              </Button>
            )}

            <Button
              onClick={() => setOpenBarcodeScanner(true)}
              icon={<ScanOutlined />}
              type="default"
              size={isMobile ? "middle" : "small"}
              style={{ backgroundColor: '#722ed1', borderColor: '#722ed1', color: 'white' }}
            >
              {!isMobile && "Buscar por Código"}
            </Button>

            {!isMobile && canEditProducts && (
              <Button
                onClick={() => setOpenBarcodeGenerator(true)}
                icon={<BarcodeOutlined />}
                type="default"
                size="small"
                style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16', color: 'white' }}
              >
                Generar Códigos
              </Button>
            )}

            {!isMobile && canExportProducts && (
              <Button
                onClick={() => setOpenLabelManager(true)}
                icon={<UploadOutlined />}
                type="default"
                size="small"
                style={{ backgroundColor: '#13c2c2', borderColor: '#13c2c2', color: 'white' }}
              >
                Imprimir Etiquetas
              </Button>
            )}
            
            {canCreateProducts && (
              <Button
                type="primary"
                onClick={() => handleShowModal()}
                icon={<PlusOutlined />}
                size={isMobile ? "middle" : "small"}
              >
                {isMobile ? "Nuevo" : "Nuevo Producto"}
              </Button>
            )}
          </Space>
          
          {canCreateProducts && (
            <BulkUploadProducts
              open={openBulkModal}
              onClose={() => setOpenBulkModal(false)}
              onUploaded={() => dispatch(fetchProducts(filters))}
            />
          )}
        </Col>
      </Row>

      {/* Estadísticas rápidas */}
      <ProductStats products={items} loading={loading} />

      {/* Formulario de filtros mejorado - Mobile: Drawer, Desktop: Card */}
      {isMobile ? (
        <>
          <Button
            icon={<FilterOutlined />}
            onClick={() => setFiltersVisible(true)}
            type="primary"
            size="large"
            block
            style={{ marginBottom: 16 }}
          >
            Filtros ({Object.keys(filters).filter(k => filters[k as keyof typeof filters]).length})
          </Button>
          <Drawer
            title="Filtros de Productos"
            placement="bottom"
            height="80%"
            onClose={() => setFiltersVisible(false)}
            open={filtersVisible}
          >
            <Form
              layout="vertical"
              form={form}
              onFinish={(values) => {
                onFinishFilters(values);
                setFiltersVisible(false);
              }}
            >
              <Form.Item name="search" label="Buscar">
                <Input
                  placeholder="🔍 Buscar por nombre..."
                  allowClear
                  size="large"
                />
              </Form.Item>
              
              <Form.Item name="categoryId" label="Categoría">
                <Select
                  placeholder="📂 Categoría"
                  allowClear
                  size="large"
                >
                  {listCategories?.map((cat) => (
                    <Option key={cat.id} value={cat.id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item name="unitId" label="Unidad">
                <Select
                  placeholder="📏 Unidad"
                  allowClear
                  size="large"
                >
                  {listUnits?.map((unit) => (
                    <Option key={unit.id} value={unit.id}>
                      {unit.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item name="lowStock" valuePropName="checked">
                <Checkbox>⚠️ Solo stock bajo</Checkbox>
              </Form.Item>
              
              <Form.Item label="Rango de Stock">
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item name="stockMin" noStyle>
                    <Input
                      placeholder="Mínimo"
                      type="number"
                      min={0}
                      size="large"
                    />
                  </Form.Item>
                  <Form.Item name="stockMax" noStyle>
                    <Input
                      placeholder="Máximo"
                      type="number"
                      min={0}
                      size="large"
                    />
                  </Form.Item>
                </Space.Compact>
              </Form.Item>
              
              <Form.Item>
                <Space style={{ width: '100%' }} direction="vertical">
                  <Button htmlType="submit" type="primary" size="large" block>
                    Aplicar Filtros
                  </Button>
                  <Button 
                    onClick={() => {
                      onClearFilters();
                      setFiltersVisible(false);
                    }} 
                    size="large" 
                    block
                  >
                    Limpiar
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Drawer>
        </>
      ) : (
        <Card className="mb-4 shadow-sm" size="small">
          <Form
            layout="inline"
            form={form}
            onFinish={onFinishFilters}
            style={{ flexWrap: 'wrap', gap: '8px' }}
          >
            <Form.Item name="search" style={{ minWidth: 200 }}>
              <Input
                placeholder="🔍 Buscar por nombre..."
                allowClear
                size={isTablet ? "middle" : "small"}
              />
            </Form.Item>
            
            <Form.Item name="categoryId" style={{ minWidth: 140 }}>
              <Select
                placeholder="📂 Categoría"
                allowClear
                size={isTablet ? "middle" : "small"}
              >
                {listCategories?.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="unitId" style={{ minWidth: 120 }}>
              <Select
                placeholder="📏 Unidad"
                allowClear
                size={isTablet ? "middle" : "small"}
              >
                {listUnits?.map((unit) => (
                  <Option key={unit.id} value={unit.id}>
                    {unit.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="lowStock" valuePropName="checked">
              <Checkbox style={{ fontSize: 12 }}>⚠️ Solo stock bajo</Checkbox>
            </Form.Item>
            
            <Form.Item>
              <Space size="small">
                <Form.Item name="stockMin" style={{ margin: 0 }}>
                  <Input
                    placeholder="Stock min"
                    type="number"
                    min={0}
                    size={isTablet ? "middle" : "small"}
                    style={{ width: 80 }}
                  />
                </Form.Item>
                <span style={{ fontSize: 12, color: '#999' }}>-</span>
                <Form.Item name="stockMax" style={{ margin: 0 }}>
                  <Input
                    placeholder="Stock max"
                    type="number"
                    min={0}
                    size={isTablet ? "middle" : "small"}
                    style={{ width: 80 }}
                  />
                </Form.Item>
              </Space>
            </Form.Item>
            
            <Form.Item>
              <Space>
                <Button htmlType="submit" type="primary" size={isTablet ? "middle" : "small"}>
                  Filtrar
                </Button>
                <Button onClick={onClearFilters} size={isTablet ? "middle" : "small"}>
                  Limpiar
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* Vista de productos */}
      {viewMode === 'table' ? (
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ 
            x: isMobile ? 600 : isTablet ? 900 : true,
            y: isMobile ? 'calc(60vh - 100px)' : 'calc(70vh - 150px)'
          }}
          size={isMobile ? "small" : "middle"}
          rowClassName={(record) =>
            record.stock <= (record.minStock ?? 0) ? "bg-red-50" : ""
          }
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedProducts.map(p => p.id),
            onChange: (selectedRowKeys) => {
              const selected = items.filter(item => selectedRowKeys.includes(item.id));
              setSelectedProducts(selected);
            },
            onSelectAll: (selected, _selectedRows, changeRows) => {
              if (selected) {
                setSelectedProducts([...selectedProducts, ...changeRows]);
              } else {
                const changeIds = changeRows.map(row => row.id);
                setSelectedProducts(selectedProducts.filter(p => !changeIds.includes(p.id)));
              }
            },
            getCheckboxProps: (record) => ({
              name: record.name,
            }),
          }}
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: !isMobile,
            pageSizeOptions: ["7", "10", "20", "50"],
            size: isMobile ? "default" : "small",
            showTotal: (total, range) => 
              isMobile ? `${range[0]}-${range[1]}/${total}` : `${range[0]}-${range[1]} de ${total} productos`,
            onChange: (newPage, newPageSize) => {
              dispatch(setPage({ page: newPage, pageSize: newPageSize || 7 }));
            },
          }}
        />
      ) : (
        <div>
          <ProductCardView
            products={items}
            loading={loading}
            onEdit={canEditProducts ? handleShowModal : undefined}
            onDelete={canDeleteProducts ? handleDelete : undefined}
          />
          {/* Paginación para vista de tarjetas */}
          <div 
            style={{ 
              marginTop: 24, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: isMobile ? '8px' : '16px'
            }}
          >
            <Button
              disabled={page === 1}
              onClick={() => dispatch(setPage({ page: page - 1, pageSize }))}
              size={isMobile ? "middle" : undefined}
            >
              Anterior
            </Button>
            <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
              Página {page} de {Math.ceil(total / pageSize)} ({total} productos)
            </span>
            <Button
              disabled={page >= Math.ceil(total / pageSize)}
              onClick={() => dispatch(setPage({ page: page + 1, pageSize }))}
              size={isMobile ? "middle" : undefined}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal genérico con el form - Solo si tiene permisos */}
      {(canCreateProducts || canEditProducts) && (
        <Modal
          title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
          open={isModalOpen}
          onCancel={handleCloseModal}
          footer={null}
        >
          <ProductForm
            product={editingProduct}
            onSaved={() => {
              handleCloseModal();
              // dispatch(fetchProducts(filters));
            }}
          />
        </Modal>
      )}

      {/* Modal de Exportación de Inventario */}
      <InventoryExportModal
        visible={openInventoryExportModal}
        onCancel={() => setOpenInventoryExportModal(false)}
      />

      {/* Modal de Escáner de Códigos de Barras */}
      <BarcodeScanner
        visible={openBarcodeScanner}
        onCancel={() => setOpenBarcodeScanner(false)}
        onProductFound={handleProductFoundByBarcode}
        title="Buscar Producto por Código"
        mode="general"
      />

      {/* Modal de Generador de Códigos de Barras */}
      <BarcodeGenerator
        visible={openBarcodeGenerator}
        onCancel={() => {
          setOpenBarcodeGenerator(false);
          setSelectedProductForBarcode(null);
        }}
        product={selectedProductForBarcode}
        onGenerated={handleBarcodeGenerated}
      />

      {/* Modal de Gestor de Etiquetas */}
      <LabelPrintManager
        visible={openLabelManager}
        onCancel={() => setOpenLabelManager(false)}
        products={items}
        selectedProducts={selectedProducts}
      />

      {/* Escáner Rápido - Componente de demostración - Solo desktop */}
      {!isMobile && !isTablet && (
        <div style={{ position: 'fixed', top: 20, right: 20, width: 300, zIndex: 1000 }}>
          <Card size="small" title="🚀 Demo: Escáner Rápido">
            <QuickBarcodeScanner
              onProductFound={(product) => {
                message.success(`¡Producto encontrado! ${product.name}`);
                console.log('Producto:', product);
              }}
              placeholder="Escanear aquí..."
              size="small"
              showHistory
              autoFocus={false}
            />
          </Card>
        </div>
      )}

      {/* Modal de Lotes FIFO */}
      {selectedProductForBatches && (
        <ProductBatchesModal
          visible={batchModalVisible}
          onClose={() => {
            setBatchModalVisible(false);
            setSelectedProductForBatches(null);
          }}
          productId={selectedProductForBatches.id}
          productName={selectedProductForBatches.name}
        />
      )}

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ProductList;
