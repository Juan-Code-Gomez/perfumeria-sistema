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
  Card,
  Statistic,
  Tag,
  Switch,
  Modal,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  BarChartOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  getCategoryStatistics,
  toggleCategoryStatus,
} from "../../features/categories/categoriesSlice";

const CategoryList = () => {
  const dispatch = useAppDispatch();
  const { listCategories, statistics, loading } = useAppSelector((state) => state.categories);
  const [searchText, setSearchText] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [statisticsVisible, setStatisticsVisible] = useState(false);

  useEffect(() => {
    dispatch(getCategories({ search: searchText, includeInactive }));
  }, [dispatch, searchText, includeInactive]);

  useEffect(() => {
    dispatch(getCategoryStatistics());
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
      dispatch(getCategories({ search: searchText, includeInactive }));
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
      dispatch(getCategories({ search: searchText, includeInactive })); // Refrescar la lista
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al eliminar la categoría");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleCategoryStatus(id)).unwrap();
      message.success("Estado de categoría actualizado");
      dispatch(getCategories({ search: searchText, includeInactive }));
    } catch (error: any) {
      message.error("Error al cambiar estado de la categoría");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
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
      title: "Estado",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Activo" : "Inactivo"}
        </Tag>
      ),
    },
    {
      title: "Productos",
      dataIndex: "_count",
      key: "productCount",
      width: 100,
      render: (count: any) => count?.products || 0,
    },
    {
      title: "Acciones",
      key: "actions",
      width: 250,
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
            <Switch
              size="small"
              checked={record.isActive}
              onChange={() => handleToggleStatus(record.id)}
              checkedChildren="Activo"
              unCheckedChildren="Inactivo"
            />
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
          <Space>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => setStatisticsVisible(true)}
            >
              Estadísticas
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={addNewCategory}
              disabled={editingKey !== ""}
            >
              Nueva Categoría
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Estadísticas */}
      {statistics && (
        <Row gutter={16} className="mb-6">
          <Col span={6}>
            <Card>
              <Statistic
                title="Total Categorías"
                value={statistics.totalCategories}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Activas"
                value={statistics.activeCategories}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Con Productos"
                value={statistics.categoriesWithProducts}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Inactivas"
                value={statistics.inactiveCategories}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Row gutter={16} className="mb-4">
        <Col span={12}>
          <Input.Search
            placeholder="Buscar categorías..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
        <Col span={12}>
          <Space>
            <span>Incluir inactivas:</span>
            <Switch
              checked={includeInactive}
              onChange={setIncludeInactive}
            />
          </Space>
        </Col>
      </Row>

      <Form form={form} component={false}>
        <Table
          bordered
          dataSource={dataSource}
          columns={columns}
          rowKey="id"
          loading={loading}
          size="small"
          pagination={{
            total: dataSource.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} de ${total} categorías`,
          }}
        />
      </Form>

      {/* Modal de Estadísticas Detalladas */}
      <Modal
        title="Estadísticas Detalladas de Categorías"
        open={statisticsVisible}
        onCancel={() => setStatisticsVisible(false)}
        footer={null}
        width={800}
      >
        {statistics && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card title="Categorías Más Usadas">
                  {statistics.mostUsedCategories && statistics.mostUsedCategories.length > 0 ? (
                    statistics.mostUsedCategories.map((cat, index) => (
                      <div key={cat.id} className="flex justify-between mb-2">
                        <span>{index + 1}. {cat.name}</span>
                        <Tag color="blue">{cat.productCount} productos</Tag>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay datos disponibles</p>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Categorías Recientes">
                  {statistics.recentCategories && statistics.recentCategories.length > 0 ? (
                    statistics.recentCategories.slice(0, 5).map((cat) => (
                      <div key={cat.id} className="flex justify-between mb-2">
                        <span>{cat.name}</span>
                        <Tag color={cat.isActive ? "green" : "red"}>
                          {cat.isActive ? "Activa" : "Inactiva"}
                        </Tag>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay datos disponibles</p>
                  )}
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoryList;
