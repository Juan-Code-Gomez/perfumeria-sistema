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
  createUnit,
  getUnits,
  updateUnit,
  deleteUnit,
} from "../../features/units/unitsSlice";

const UnitList = () => {
  const dispatch = useAppDispatch();
  const { listUnits } = useAppSelector((state) => state.units);

  useEffect(() => {
    dispatch(getUnits());
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
        // Crear nueva unidad
        await dispatch(createUnit({ name: row.name })).unwrap();
        message.success("Unidad creada exitosamente");
      } else {
        // Editar unidad existente
        await dispatch(
          updateUnit({ id: parseInt(id), name: row.name })
        ).unwrap();
        message.success("Unidad actualizada exitosamente");
      }

      setEditingKey("");
      form.resetFields();
      dispatch(getUnits());
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al guardar la unidad");
    }
  };

  const addNewUnit = () => {
    setEditingKey("new");
    form.setFieldsValue({ name: "" });
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUnit(id)).unwrap();
      message.success("Unidad eliminada exitosamente");
      dispatch(getUnits()); // Refrescar la lista
    } catch (error: any) {
      console.log("Error:", error);
      message.error(error.message || "Error al eliminar la unidad");
    }
  };

  const dataSource =
    editingKey === "new"
      ? [{ id: "new", name: "" }, ...(listUnits || [])]
      : listUnits || [];

  const columns = [
    {
      title: "Nombre de la Unidad",
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
            <Input size="small" autoFocus placeholder="Ej: ml, gr, oz, unidad" />
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
              disabled={editingKey !== ""}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Eliminar unidad?"
              description="Esta acción no se puede deshacer. ¿Estás seguro?"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okType="danger"
            >
              <Button
                icon={<DeleteOutlined />}
                type="link"
                danger
                size="small"
                disabled={editingKey !== ""}
              >
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
          <p className="text-gray-600">
            Administra las unidades de medida para tus productos
          </p>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={addNewUnit}
            disabled={editingKey !== ""}
          >
            Nueva Unidad
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

export default UnitList;