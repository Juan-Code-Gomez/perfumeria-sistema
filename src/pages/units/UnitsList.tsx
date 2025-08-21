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
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createUnit,
  getUnits,
  updateUnit,
  deleteUnit,
  getUnitStatistics,
  toggleUnitStatus,
} from "../../features/units/unitsSlice";

const UnitList = () => {
  const dispatch = useAppDispatch();
  const { listUnits, statistics, loading } = useAppSelector((state) => state.units);
  const [searchText, setSearchText] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [unitType, setUnitType] = useState<string | undefined>(undefined);
  const [statisticsVisible, setStatisticsVisible] = useState(false);

  useEffect(() => {
    dispatch(getUnits({ search: searchText, includeInactive, unitType }));
  }, [dispatch, searchText, includeInactive, unitType]);

  useEffect(() => {
    dispatch(getUnitStatistics());
  }, [dispatch]);

  const [editingKey, setEditingKey] = useState("");
  const [form] = Form.useForm();

  const isEditing = (record: any) => record.id.toString() === editingKey;

  const edit = (record: any) => {
    form.setFieldsValue({ 
      name: record.name,
      symbol: record.symbol,
      description: record.description,
      unitType: record.unitType,
      isDecimal: record.isDecimal
    });
    setEditingKey(record.id.toString());
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (id: string) => {
    try {
      const row = await form.validateFields();

      if (id === "new") {
        // Crear nueva unidad
        await dispatch(createUnit({ 
          name: row.name,
          symbol: row.symbol,
          description: row.description,
          unitType: row.unitType,
          isDecimal: row.isDecimal
        })).unwrap();
        message.success("Unidad creada exitosamente");
      } else {
        // Editar unidad existente
        await dispatch(
          updateUnit({ 
            id: parseInt(id), 
            name: row.name,
            symbol: row.symbol,
            description: row.description,
            unitType: row.unitType,
            isDecimal: row.isDecimal
          })
        ).unwrap();
        message.success("Unidad actualizada exitosamente");
      }

      setEditingKey("");
      form.resetFields();
      dispatch(getUnits({ search: searchText, includeInactive, unitType }));
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al guardar la unidad");
    }
  };

  const addNewUnit = () => {
    setEditingKey("new");
    form.setFieldsValue({ 
      name: "",
      symbol: "",
      description: "",
      unitType: "WEIGHT",
      isDecimal: true
    });
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUnit(id)).unwrap();
      message.success("Unidad eliminada exitosamente");
      dispatch(getUnits({ search: searchText, includeInactive, unitType }));
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al eliminar la unidad");
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleUnitStatus(id)).unwrap();
      message.success("Estado de unidad actualizado");
      dispatch(getUnits({ search: searchText, includeInactive, unitType }));
    } catch (error: any) {
      message.error("Error al cambiar estado de la unidad");
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const dataSource =
    editingKey === "new"
      ? [{ id: "new", name: "", symbol: "", description: "", unitType: "WEIGHT", isActive: true, isDecimal: true }, ...(listUnits || [])]
      : listUnits || [];

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="name"
            style={{ margin: 0 }}
            rules={[
              { required: true, message: "Ingresa el nombre de la unidad" },
            ]}
          >
            <Input size="small" autoFocus placeholder="Ej: Kilogramo, Litro" />
          </Form.Item>
        ) : (
          <span>{record.name}</span>
        );
      },
    },
    {
      title: "Símbolo",
      dataIndex: "symbol",
      key: "symbol",
      width: 120,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="symbol"
            style={{ margin: 0 }}
            rules={[
              { required: true, message: "Ingresa el símbolo" },
            ]}
          >
            <Input size="small" placeholder="kg, L, ml" />
          </Form.Item>
        ) : (
          <Tag color="blue">{record.symbol}</Tag>
        );
      },
    },
    {
      title: "Tipo",
      dataIndex: "unitType",
      key: "unitType",
      width: 120,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="unitType"
            style={{ margin: 0 }}
          >
            <Select size="small" placeholder="Seleccionar tipo">
              <Select.Option value="WEIGHT">Peso</Select.Option>
              <Select.Option value="VOLUME">Volumen</Select.Option>
              <Select.Option value="LENGTH">Longitud</Select.Option>
              <Select.Option value="AREA">Área</Select.Option>
              <Select.Option value="TIME">Tiempo</Select.Option>
              <Select.Option value="QUANTITY">Cantidad</Select.Option>
            </Select>
          </Form.Item>
        ) : (
          <Tag color="purple">{record.unitType || 'Sin tipo'}</Tag>
        );
      },
    },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="description"
            style={{ margin: 0 }}
          >
            <Input size="small" placeholder="Descripción opcional" />
          </Form.Item>
        ) : (
          <span>{record.description || '-'}</span>
        );
      },
    },
    {
      title: "Decimal",
      dataIndex: "isDecimal",
      key: "isDecimal",
      width: 100,
      render: (_: any, record: any) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item
            name="isDecimal"
            style={{ margin: 0 }}
            valuePropName="checked"
          >
            <Switch size="small" />
          </Form.Item>
        ) : (
          <Tag color={record.isDecimal ? "green" : "orange"}>
            {record.isDecimal ? "Sí" : "No"}
          </Tag>
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
      width: 300,
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
              title="¿Eliminar unidad?"
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
          <h1 className="text-2xl font-semibold">Gestión de Unidades</h1>
          <p className="text-gray-600">Administra las unidades de medida para tus productos</p>
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
              onClick={addNewUnit}
              disabled={editingKey !== ""}
            >
              Nueva Unidad
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
                title="Total Unidades"
                value={statistics.totalUnits}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Activas"
                value={statistics.activeUnits}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Con Productos"
                value={statistics.unitsWithProducts}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Inactivas"
                value={statistics.inactiveUnits}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros */}
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Input.Search
            placeholder="Buscar unidades..."
            allowClear
            onSearch={handleSearch}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </Col>
        <Col span={6}>
          <Select
            placeholder="Filtrar por tipo"
            allowClear
            style={{ width: '100%' }}
            onChange={setUnitType}
          >
            <Select.Option value="WEIGHT">Peso</Select.Option>
            <Select.Option value="VOLUME">Volumen</Select.Option>
            <Select.Option value="LENGTH">Longitud</Select.Option>
            <Select.Option value="AREA">Área</Select.Option>
            <Select.Option value="TIME">Tiempo</Select.Option>
            <Select.Option value="QUANTITY">Cantidad</Select.Option>
          </Select>
        </Col>
        <Col span={10}>
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
              `${range[0]}-${range[1]} de ${total} unidades`,
          }}
        />
      </Form>

      {/* Modal de Estadísticas Detalladas */}
      <Modal
        title="Estadísticas Detalladas de Unidades"
        open={statisticsVisible}
        onCancel={() => setStatisticsVisible(false)}
        footer={null}
        width={800}
      >
        {statistics && (
          <div>
            <Row gutter={16} className="mb-4">
              <Col span={12}>
                <Card title="Unidades Más Usadas">
                  {statistics.mostUsedUnits && statistics.mostUsedUnits.length > 0 ? (
                    statistics.mostUsedUnits.map((unit, index) => (
                      <div key={unit.id} className="flex justify-between mb-2">
                        <span>{index + 1}. {unit.name} ({unit.symbol})</span>
                        <Tag color="blue">{unit.productCount} productos</Tag>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay datos disponibles</p>
                  )}
                </Card>
              </Col>
              <Col span={12}>
                <Card title="Unidades por Tipo">
                  {statistics.unitsByType && statistics.unitsByType.length > 0 ? (
                    statistics.unitsByType.map((type, index) => (
                      <div key={index} className="flex justify-between mb-2">
                        <span>{type.type}</span>
                        <Tag color="green">{type.count} unidades</Tag>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay datos disponibles</p>
                  )}
                </Card>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Card title="Unidades Recientes">
                  {statistics.recentUnits && statistics.recentUnits.length > 0 ? (
                    statistics.recentUnits.slice(0, 5).map((unit) => (
                      <div key={unit.id} className="flex justify-between mb-2">
                        <span>{unit.name} ({unit.symbol})</span>
                        <Tag color={unit.isActive ? "green" : "red"}>
                          {unit.isActive ? "Activa" : "Inactiva"}
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

export default UnitList;