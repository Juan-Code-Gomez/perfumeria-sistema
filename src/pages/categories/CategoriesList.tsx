import {
  Button,
  Col,
  Row,
  Table,
  Input,
  Form,
  Space,
  Popconfirm,
  message,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../../features/categories/categoriesSlice";

const CategoryList = () => {
  const dispatch = useAppDispatch();
  const { listCategories } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();

  const isEditing = (record: any) => record.id.toString() === editingKey;

  const edit = (record: any) => {
    form.setFieldsValue({ name: record.name });
    setEditingKey(record.id.toString());
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (id: string) => {
    try {
      const row = await form.validateFields();

      if (id === "new") {
        // Crear nueva categoría
        await dispatch(createCategory({ name: row.name })).unwrap();
        message.success("Categoría creada exitosamente");
      } else {
        // Editar categoría existente
        await dispatch(
          updateCategory({ id: parseInt(id), name: row.name })
        ).unwrap();
        message.success("Categoría actualizada exitosamente");
      }

      setEditingKey("");
      form.resetFields();
      dispatch(getCategories());
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al guardar la categoría");
    }
  };

  const addNewCategory = () => {
    setEditingKey("new");
    form.setFieldsValue({ name: "" });
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success("Categoría eliminada exitosamente");
      dispatch(getCategories()); // Refrescar la lista
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al eliminar la categoría");
    }
  };

  const dataSource =
    editingKey === "new"
      ? [{ id: "new", name: "" }, ...(listCategories || [])]
      : listCategories || [];

  const columns = [
    {
      title: "Nombre de la Categoría",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="name"
            style={{ margin: 0 }}
            rules={[
              { required: true, message: "Ingresa el nombre de la categoría" },
            ]}
          >
            <Input size="small" autoFocus />
          </Form.Item>
        ) : (
          <span>{record.name}</span>
        );
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 200,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              icon={<SaveOutlined />}
              type="link"
              size="small"
              onClick={() => save(record.id)}
            >
              Guardar
            </Button>
            <Button
              icon={<CloseOutlined />}
              type="link"
              size="small"
              onClick={cancel}
            >
              Cancelar
            </Button>
          </Space>
        ) : (
          <Space>
            <Button
              icon={<EditOutlined />}
              type="link"
              size="small"
              onClick={() => edit(record)}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Eliminar categoría?"
              onConfirm={() => {
                handleDelete(record.id);
              }}
            >
              <Button icon={<DeleteOutlined />} type="link" danger size="small">
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <h1 className="text-2xl font-semibold">Gestión de Categorías</h1>
          <p className="text-gray-600">Organiza tus productos por categorías</p>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addNewCategory}
            disabled={editingKey !== ""}
          >
            Nueva Categoría
          </Button>
        </Col>
      </Row>

      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Form>
    </div>
  );
};

export default CategoryList;
