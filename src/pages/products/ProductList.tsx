import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Table,
  Tag,
  Popconfirm,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import type { RootState } from "../../store";
import type { Product } from "../../features/products/types";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../../features/products/productSlice";

const ProductList = () => {
  const products = useSelector((state: RootState) => state.products);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form] = Form.useForm();

  const showCreateModal = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const showEditModal = (product: Product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteProduct(id));
    message.success("Producto eliminado");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const onFinish = (values: any) => {
    if (editingProduct) {
      dispatch(updateProduct({ ...editingProduct, ...values }));
    } else {
      dispatch(addProduct({ ...values, id: Date.now() }));
    }
    handleCancel();
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Unidad",
      dataIndex: "unit",
      key: "unit",
      render: (unit: string) => <Tag>{unit}</Tag>,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      render: (stock: number) =>
        stock < 10 ? <Tag color="red">{stock} ⚠</Tag> : stock,
    },
    {
      title: "Precio Compra",
      dataIndex: "purchasePrice",
      key: "purchasePrice",
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: "Precio Venta",
      dataIndex: "salePrice",
      key: "salePrice",
      render: (value: number) => `$${value.toLocaleString()}`,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Product) => (
        <div className="flex gap-2">
          <Button type="link" onClick={() => showEditModal(record)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Estás seguro de eliminar este producto?"
            okText="Sí"
            cancelText="No"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger type="link">
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Gestión de Productos</h1>
        <Button type="primary" onClick={showCreateModal}>
          Agregar Producto
        </Button>
      </div>

      <Table dataSource={products} columns={columns} rowKey="id" />

      <Modal
        title={editingProduct ? "Editar Producto" : "Agregar Producto"}
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Descripción" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Unidad" name="unit" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "Mililitros (ml)", value: "ml" },
                { label: "Gramos (gr)", value: "gr" },
                { label: "Unidad", value: "unit" },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Stock inicial"
            name="stock"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            label="Precio de compra"
            name="purchasePrice"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            label="Precio de venta"
            name="salePrice"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Guardar producto
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductList;
