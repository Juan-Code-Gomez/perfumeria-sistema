import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Tag, DatePicker, Row, Col, Card, Form, InputNumber, Input, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchCashClosings, createCashClosing } from "../../features/cashClosing/cashClosingSlice";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const CashClosingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s) => s.cashClosing);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros de fechas
  const [dateRange, setDateRange] = useState<[any, any]>();

  useEffect(() => {
    const params =
      dateRange && dateRange[0] && dateRange[1]
        ? {
            dateFrom: dateRange[0].format("YYYY-MM-DD"),
            dateTo: dateRange[1].format("YYYY-MM-DD"),
          }
        : undefined;
    dispatch(fetchCashClosings(params));
  }, [dispatch, dateRange]);

  const columns = [
    { title: "Fecha", dataIndex: "date", key: "date", render: (v: string) => dayjs(v).format("YYYY-MM-DD") },
    { title: "Ventas", dataIndex: "totalSales", key: "totalSales", render: (v: number) => `$${v.toLocaleString()}` },
    { title: "Gastos", dataIndex: "totalExpense", key: "totalExpense", render: (v: number) => `$${v.toLocaleString()}` },
    { title: "Cierre contado", dataIndex: "closingCash", key: "closingCash", render: (v: number) => `$${v.toLocaleString()}` },
    { title: "Cierre sistema", dataIndex: "systemCash", key: "systemCash", render: (v: number) => `$${v.toLocaleString()}` },
    {
      title: "Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: (v: number) =>
        v === 0 ? (
          <Tag color="green">Sin diferencia</Tag>
        ) : (
          <Tag color="red">{v > 0 ? "+" : ""}${v.toLocaleString()}</Tag>
        ),
    },
    { title: "Notas", dataIndex: "notes", key: "notes" },
  ];

  // Formulario de registro de cierre
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await dispatch(
        createCashClosing({
          ...values,
          date: values.date.format("YYYY-MM-DD"),
        })
      ).unwrap();
      message.success("Cierre registrado correctamente");
      handleCloseModal();
      dispatch(fetchCashClosings());
    } catch (err: any) {
      message.error(err.message || "Error al registrar cierre");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h1 className="text-2xl font-semibold">Cierres de Caja</h1>
          <p className="text-gray-600">Historial de cierres diarios</p>
        </Col>
        <Col>
          <Button type="primary" onClick={handleOpenModal} size="small">
            Registrar cierre de caja
          </Button>
        </Col>
      </Row>
      <Card className="mb-4">
        <Form layout="inline">
          <Form.Item label="Filtrar por fecha">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [any, any])}
              allowClear
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Form>
      </Card>
      <Card>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        title="Registrar cierre de caja"
        width={500}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            date: dayjs(),
            openingCash: 0,
            closingCash: 0,
            notes: "",
          }}
        >
          <Form.Item
            label="Fecha"
            name="date"
            rules={[{ required: true, message: "Selecciona la fecha" }]}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Saldo inicial"
            name="openingCash"
            rules={[{ required: true, message: "Ingresa el saldo inicial" }]}
          >
            <InputNumber
              min={0}
              formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Saldo contado (final)"
            name="closingCash"
            rules={[{ required: true, message: "Ingresa el saldo contado" }]}
          >
            <InputNumber
              min={0}
              formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item label="Notas" name="notes">
            <Input.TextArea placeholder="Observaciones del cierre (opcional)" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={saving} block>
              Guardar cierre
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CashClosingList;
