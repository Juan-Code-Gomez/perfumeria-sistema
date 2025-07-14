// src/pages/products/ProductList.tsx
import React, { useEffect, useState } from "react";
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
} from "antd";
import { useAppDispatch, useAppSelector } from "../../store/index";
import {
  fetchProducts,
  setFilters,
  clearFilters,
  setPage,
} from "../../features/products/productSlice";
// import {
//   deleteProduct,
//   updateProduct,
//   addProduct,
// } from "@/features/products/productSlice";
import type { Category, Product, Unit } from "../../features/products/types";
import type { RootState } from "../../store";
import ProductForm from "../../components/products/ProductForm"; // extrae el formulario a su propio componente
import { getCategories } from "../../features/categories/categoriesSlice";
import { getUnits } from "../../features/units/unitsSlice";
import BulkUploadProducts from "../../components/products/BulkUploadProducts";

const { Option } = Select;

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters, page, pageSize, total } =
    useAppSelector((state: RootState) => state.products);
  const { listCategories } = useAppSelector(
    (state: RootState) => state.categories
  );
  const { listUnits } = useAppSelector((state: RootState) => state.units);
  const FILTER_WIDTH = 160;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  );
  const [openBulkModal, setOpenBulkModal] = useState(false);

  const [form] = Form.useForm();

  // Carga inicial y cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchProducts({ ...filters, page, pageSize }));
  }, [dispatch, filters, page, pageSize]);

  useEffect(() => {
    // Solo cargar categorías si nunca se han cargado
    if (!listCategories || listCategories.length === 0) {
      dispatch(getCategories());
    }
    if (!listUnits || listUnits.length === 0) {
      dispatch(getUnits());
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

    // Convierte precios y IDs a número (los selects devuelven string a veces)
    if (cleanValues.categoryId)
      cleanValues.categoryId = Number(cleanValues.categoryId);
    if (cleanValues.unitId) cleanValues.unitId = Number(cleanValues.unitId);
    if (cleanValues.salePriceMin)
      cleanValues.salePriceMin = Number(cleanValues.salePriceMin);
    if (cleanValues.salePriceMax)
      cleanValues.salePriceMax = Number(cleanValues.salePriceMax);

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
  const handleDelete = (id: number) => {
    // dispatch(deleteProduct(id));
    message.success("Producto eliminado");
  };

  const handleShowModal = (product?: Product) => {
    setEditingProduct(product ?? null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  // columnas de la tabla
  const columns = [
    {
      title: "Imagen",
      dataIndex: "imageUrl",
      key: "imageUrl",
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
    },
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Unidad",
      dataIndex: "unit",
      key: "unit",
      render: (u: Unit) => <Tag>{u.name}</Tag>,
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (c: Category) => <Tag>{c?.name}</Tag>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (s: number) =>
        s < 10 ? (
          <Tag color="red">
            {s} <span role="img">⚠️</span>
          </Tag>
        ) : (
          s
        ),
    },
    {
      title: "P. Compra",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "P. Venta",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Utilidad",
      dataIndex: "utilidad",
      key: "utilidad",
      render: (v: number) => (v !== undefined ? `$${v.toLocaleString()}` : "-"),
    },
    {
      title: "Margen",
      dataIndex: "margen",
      key: "margen",
      render: (v: number) => (
        <Tag color={v >= 50 ? "green" : v >= 20 ? "orange" : "red"}>
          {v ? `${v.toFixed(1)}%` : "-"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Product) => (
        <>
          <Button type="link" onClick={() => handleShowModal(record)}>
            Editar
          </Button>
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
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
          <p className="text-gray-600">
            Administra tu inventario de perfumes y fragancias
          </p>
        </Col>
        <Col>
          <Button
            href="/plantilla-carga-masiva-productos.xlsx"
            target="_blank"
            style={{ marginRight: 8 }}
          >
            Descargar plantilla
          </Button>
          <Button
            onClick={() => setOpenBulkModal(true)}
            style={{ marginRight: 8 }}
          >
            Carga masiva
          </Button>
          <Button
            style={{ marginLeft: "6px" }}
            type="primary"
            onClick={() => handleShowModal()}
            size="small"
          >
            Agregar Producto
          </Button>
          <BulkUploadProducts
            open={openBulkModal}
            onClose={() => setOpenBulkModal(false)}
            onUploaded={() => dispatch(fetchProducts(filters))}
          />
        </Col>
      </Row>

      {/* Formulario de filtros */}
      <Card className="mb-12 mt-1.5 shadow-sm">
        <Card className="mb-12 mt-1.5 shadow-sm">
          <Form
            layout="inline"
            initialValues={form}
            onFinish={onFinishFilters}
            className="mb-4 mt-2.5"
          >
            <Form.Item name="name">
              <Input
                placeholder="Buscar producto..."
                allowClear
                size="small"
                style={{ width: FILTER_WIDTH }}
              />
            </Form.Item>
            <Form.Item name="categoryId">
              <Select
                placeholder="Categoría"
                allowClear
                size="small"
                style={{ width: FILTER_WIDTH }}
              >
                {listCategories?.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="unitId">
              <Select
                placeholder="Unidad"
                allowClear
                size="small"
                style={{ width: FILTER_WIDTH }}
              >
                {listUnits?.map((unit) => (
                  <Option key={unit.id} value={unit.id}>
                    {unit.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="onlyLowStock" valuePropName="checked">
              <Checkbox>Stock bajo</Checkbox>
            </Form.Item>
            <Form.Item name="salePriceMin">
              <Input
                placeholder="Precio mín."
                type="number"
                min={0}
                size="small"
                style={{ width: FILTER_WIDTH }}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </Form.Item>
            <Form.Item name="salePriceMax">
              <Input
                placeholder="Precio máx."
                type="number"
                min={0}
                size="small"
                style={{ width: FILTER_WIDTH }}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary" size="small">
                Aplicar
              </Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={onClearFilters} size="small">
                Limpiar
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Card>

      {/* Tabla de productos */}
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
        rowClassName={(record) =>
          record.stock <= (record.minStock ?? 0) ? "bg-red-50" : ""
        }
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["7", "10", "20", "50"],
          size: "small",
          onChange: (newPage, newPageSize) => {
            dispatch(setPage({ page: newPage, pageSize: newPageSize || 7 }));
          },
        }}
      />

      {/* Modal genérico con el form */}
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

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ProductList;
