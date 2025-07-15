import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Row, Col, DatePicker, Card, Form } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchExpenses,  setFilters } from "../../features/expenses/expenseSlice";
import dayjs from "dayjs";
import ExpenseForm from "../../components/expenses/ExpenseForm";

const { RangePicker } = DatePicker;

const ExpenseList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector((s) => s.expenses);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchExpenses(filters));
  }, [dispatch, filters]);

  // Filtros por fecha
  const handleDateFilter = (_dates: any, dateStrings: [string, string]) => {
    dispatch(setFilters({
      dateFrom: dateStrings[0] || undefined,
      dateTo: dateStrings[1] || undefined,
    }));
  };

  // Columnas de la tabla
  const columns = [
    { title: "Fecha", dataIndex: "date", key: "date", render: (v: string) => dayjs(v).format("YYYY-MM-DD") },
    { title: "Concepto", dataIndex: "concept", key: "concept" },
    { title: "Monto", dataIndex: "amount", key: "amount", render: (v: number) => <b>${v.toLocaleString()}</b> },
    { title: "Forma de pago", dataIndex: "paymentMethod", key: "paymentMethod", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Notas", dataIndex: "notes", key: "notes" },
    // Si quieres, aquí podrías agregar editar/eliminar
  ];

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h1 className="text-2xl font-semibold">Egresos / Gastos</h1>
          <p className="text-gray-600">Controla todos los gastos diarios</p>
        </Col>
        <Col>
          <Button type="primary" onClick={() => setIsModalOpen(true)} size="small">
            Nuevo gasto
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
        <Form layout="inline">
          <Form.Item label="Filtrar por fecha">
            <RangePicker
              onChange={handleDateFilter}
              value={
                filters.dateFrom && filters.dateTo
                  ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                  : undefined
              }
              allowClear
              format="YYYY-MM-DD"
            />
          </Form.Item>
        </Form>
      </Card>

      <Card className="shadow-sm">
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          size="middle"
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>

      <ExpenseForm
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ExpenseList;
