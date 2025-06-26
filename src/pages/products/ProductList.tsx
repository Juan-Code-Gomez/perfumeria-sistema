// src/pages/products/ProductList.tsx
import React, { useEffect } from "react";
import {
  Button,
  Input,
  InputNumber,
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
} from "antd";
import { useAppDispatch, useAppSelector } from "../../store/index";
import {
  fetchProducts,
  setFilters,
  clearFilters,
} from "../../features/products/productSlice";
// import {
//   deleteProduct,
//   updateProduct,
//   addProduct,
// } from "@/features/products/productSlice";
import type { Product } from "../../features/products/types";
import type { RootState } from "../../store";
import ProductForm from "../../components/products/ProductForm"; // extrae el formulario a su propio componente

const { Option } = Select;

const ProductList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector(
    (state: RootState) => state.products
  );
  // const { categories } = useAppSelector((state: RootState) => state.categories);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  );

  // Carga inicial y cuando cambian los filtros
  useEffect(() => {
    dispatch(fetchProducts(filters));
  }, [dispatch, filters]);

  // Control de filtros
  const onFinishFilters = (values: any) => {
    dispatch(setFilters(values));
  };
  const onClearFilters = () => {
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
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Unidad",
      dataIndex: "unit",
      key: "unit",
      render: (u: string) => <Tag>{u}</Tag>,
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
          <Button type="primary" onClick={() => handleShowModal()} size="small">
            Agregar Producto
          </Button>
        </Col>
      </Row>

      {/* Formulario de filtros */}
      <Card className="mb-12 mt-1.5 shadow-sm">
        <Form
          layout="inline"
          initialValues={filters}
          onFinish={onFinishFilters}
          className="mb-4 mt-2.5"
        >
          <Form.Item name="name">
            <Input
              placeholder="Filtrar por nombre"
              allowClear
              size="small"
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="stockMin">
            <Input
              placeholder="Stock"
              size="small"
              style={{ width: 200 }}
              onKeyDown={(e) => {
                // Solo permite números, backspace, delete, tab, escape, enter y teclas de navegación
                if (
                  !/[0-9]/.test(e.key) && 
                  !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                ) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary" size="small">
              Aplicar
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={onClearFilters} size="small">Limpiar</Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Tabla de productos */}
      <Table
        dataSource={items}
        columns={columns}
        rowKey="id"
        loading={loading}
        scroll={{ x: true }}
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
            dispatch(fetchProducts(filters));
          }}
        />
      </Modal>

      {error && <div className="text-red-500 mt-2">{error}</div>}
    </div>
  );
};

export default ProductList;
