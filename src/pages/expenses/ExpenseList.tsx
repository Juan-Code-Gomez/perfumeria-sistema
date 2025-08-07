// src/pages/expenses/ExpenseList.tsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Row,
  Col,
  DatePicker,
  Select,
  Card,
  Divider,
  message,
} from "antd";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/lib/table";

import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchExpenses,
  fetchExpenseSummary,
  createExpense,
  editExpense,
  removeExpense,
  setFilters,
} from "../../features/expenses/expenseSlice";

import type { Expense } from "../../features/expenses/expenseSlice";

import ExpenseForm from "../../components/expenses/ExpenseForm";
import ExpenseSummaryChart from "../../components/expenses/ExpenseSummaryChart";

const { RangePicker } = DatePicker;
const { Option } = Select;

export default function ExpenseList() {
  const dispatch = useAppDispatch();
  const { items, total, loading, error, filters, summary } = useAppSelector(
    (s) => s.expenses
  );

  // Estado modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // Carga inicial y al cambiar filtros
  useEffect(() => {
    dispatch(fetchExpenses(filters));
    dispatch(fetchExpenseSummary(filters));
  }, [dispatch, filters]);

  // Tabla
  const columns: ColumnsType<Expense> = [
    {
      title: "Fecha",
      dataIndex: "date",
      render: (v) => dayjs(v).format("YYYY-MM-DD"),
    },
    { title: "Concepto", dataIndex: "description" },
    { title: "Categoría", dataIndex: "category" },
    {
      title: "Monto",
      dataIndex: "amount",
      render: (v) => <b>${v.toLocaleString()}</b>,
    },
    { title: "Notas", dataIndex: "notes", ellipsis: true },
    {
      title: "Acciones",
      render: (_: any, rec: Expense) => (
        <>
          <Button
            size="small"
            type="link"
            onClick={() => {
              setEditing(rec);
              setModalOpen(true);
            }}
          >
            ✏️
          </Button>
          <Button
            size="small"
            danger
            type="link"
            onClick={async () => {
              await dispatch(removeExpense(rec.id!)).unwrap();
              message.success("Gasto eliminado");
              // refresca
              dispatch(fetchExpenses(filters));
              dispatch(fetchExpenseSummary(filters));
            }}
          >
            🗑️
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h2>Gastos</h2>
        </Col>
        <Col>
          <Button
            type="primary"
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            Nuevo gasto
          </Button>
        </Col>
      </Row>

      <Card className="mb-4">
        <Row gutter={16}>
          <Col>
            Filtrar por fecha:{" "}
            <RangePicker
              value={
                filters.dateFrom && filters.dateTo
                  ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                  : undefined
              }
              onChange={(_, [from, to]) =>
                dispatch(setFilters({ dateFrom: from, dateTo: to, page: 1 }))
              }
              format="YYYY-MM-DD"
            />
          </Col>
          <Col>
            Categoría:{" "}
            <Select
              allowClear
              style={{ width: 150 }}
              value={filters.category}
              onChange={(v) =>
                dispatch(setFilters({ category: v, page: 1 }))
              }
            >
              <Option value="SERVICIOS">Servicios</Option>
              <Option value="SUMINISTROS">Suministros</Option>
              <Option value="ALQUILER">Alquiler</Option>
              <Option value="OTRO">Otro</Option>
            </Select>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={8}>
            <Card title="Total periodo">
              ${summary.total.toLocaleString()}
            </Card>
          </Col>
          <Col span={16}>
            <ExpenseSummaryChart data={summary.byCategory} />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total,
          onChange: (p, ps) => dispatch(setFilters({ page: p, pageSize: ps })),
        }}
      />

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <ExpenseForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        expense={editing}
        onSave={async (vals) => {
          if (editing) {
            await dispatch(editExpense({ id: editing.id!, payload: vals }))
              .unwrap();
            message.success("Gasto actualizado");
          } else {
            await dispatch(createExpense(vals)).unwrap();
            message.success("Gasto creado");
          }
          dispatch(fetchExpenses(filters));
          dispatch(fetchExpenseSummary(filters));
        }}
      />
    </div>
  );
}
