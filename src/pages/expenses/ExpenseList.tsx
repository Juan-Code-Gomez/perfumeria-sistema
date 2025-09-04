// src/pages/expenses/ExpenseList.tsx

import { useEffect, useState } from "react";
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
  Input,
  Statistic,
  Tag,
  Space,
  Tooltip,
} from "antd";
import { DownloadOutlined, FileExcelOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/lib/table";

import { useAppDispatch, useAppSelector } from "../../store";
import { usePermissions } from "../../hooks/usePermissions";
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
import { exportExpensesToExcel, exportExpenseSummaryToExcel } from "../../utils/expenseExporter";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

export default function ExpenseList() {
  const dispatch = useAppDispatch();
  const { items, total, loading, error, filters, summary } = useAppSelector(
    (s) => s.expenses
  );
  const { hasPermission } = usePermissions();

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
      title: "🗓️ Fecha",
      dataIndex: "date",
      render: (v) => dayjs(v).format("DD/MM/YYYY"),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
      width: 100,
    },
    {
      title: "📝 Descripción",
      dataIndex: "description",
      ellipsis: true,
      width: 200,
    },
    {
      title: "🏷️ Categoría",
      dataIndex: "category",
      render: (category) => {
        const colors = {
          SERVICIOS: 'blue',
          SUMINISTROS: 'green',
          ALQUILER: 'orange',
          OTRO: 'purple'
        };
        const icons = {
          SERVICIOS: '📞',
          SUMINISTROS: '📦',
          ALQUILER: '🏠',
          OTRO: '📝'
        };
        return (
          <Tag color={colors[category as keyof typeof colors] || 'default'}>
            {icons[category as keyof typeof icons]} {category}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: "💰 Monto",
      dataIndex: "amount",
      render: (v) => (
        <Statistic
          value={v}
          prefix="$"
          precision={0}
          valueStyle={{ fontSize: '14px', color: '#ff4d4f' }}
        />
      ),
      sorter: (a, b) => a.amount - b.amount,
      width: 100,
    },
    {
      title: "💳 Método de Pago",
      dataIndex: "paymentMethod",
      render: (method) => {
        const colors = {
          Efectivo: 'green',
          Transferencia: 'blue',
          Tarjeta: 'purple',
          Otro: 'default'
        };
        const icons = {
          Efectivo: '💵',
          Transferencia: '🏦',
          Tarjeta: '💳',
          Otro: '🔄'
        };
        return (
          <Tag color={colors[method as keyof typeof colors] || 'default'}>
            {icons[method as keyof typeof icons]} {method}
          </Tag>
        );
      },
      width: 130,
    },
    {
      title: "📝 Notas",
      dataIndex: "notes",
      ellipsis: true,
      width: 150,
    },
    {
      title: "⚙️ Acciones",
      render: (_: any, rec: Expense) => (
        <Space>
          {hasPermission('gastos', 'edit') && (
            <Tooltip title="Editar gasto">
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
            </Tooltip>
          )}
          {hasPermission('gastos', 'delete') && (
            <Tooltip title="Eliminar gasto">
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
            </Tooltip>
          )}
        </Space>
      ),
      width: 100,
      fixed: 'right',
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
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} md={6}>
            <label className="block text-sm font-medium mb-1">Filtrar por fecha:</label>
            <RangePicker
              style={{ width: '100%' }}
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
          <Col xs={12} md={3}>
            <label className="block text-sm font-medium mb-1">Categoría:</label>
            <Select
              allowClear
              style={{ width: '100%' }}
              value={filters.category}
              onChange={(v) =>
                dispatch(setFilters({ category: v, page: 1 }))
              }
              placeholder="Todas"
            >
              <Option value="SERVICIOS">📞 Servicios</Option>
              <Option value="SUMINISTROS">📦 Suministros</Option>
              <Option value="ALQUILER">🏠 Alquiler</Option>
              <Option value="OTRO">📝 Otro</Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <label className="block text-sm font-medium mb-1">Método de Pago:</label>
            <Select
              allowClear
              style={{ width: '100%' }}
              value={filters.paymentMethod}
              onChange={(v) =>
                dispatch(setFilters({ paymentMethod: v, page: 1 }))
              }
              placeholder="Todos"
            >
              <Option value="Efectivo">💵 Efectivo</Option>
              <Option value="Transferencia">🏦 Transferencia</Option>
              <Option value="Tarjeta">💳 Tarjeta</Option>
              <Option value="Otro">🔄 Otro</Option>
            </Select>
          </Col>
          <Col xs={12} md={3}>
            <label className="block text-sm font-medium mb-1">Tipo:</label>
            <Select
              allowClear
              style={{ width: '100%' }}
              value={filters.isRecurring}
              onChange={(v) =>
                dispatch(setFilters({ isRecurring: v, page: 1 }))
              }
              placeholder="Todos"
            >
              <Option value={true}>🔄 Recurrentes</Option>
              <Option value={false}>📝 Manuales</Option>
            </Select>
          </Col>
          <Col xs={12} md={4}>
            <label className="block text-sm font-medium mb-1">Buscar:</label>
            <Search
              placeholder="Buscar en descripción..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value, page: 1 }))}
              onSearch={(value) => dispatch(setFilters({ search: value, page: 1 }))}
            />
          </Col>
          <Col xs={24} md={5}>
            <label className="block text-sm font-medium mb-1">Exportar:</label>
            <Space direction="horizontal" style={{ width: '100%' }}>
              <Tooltip title="Exportar detalle completo">
                <Button 
                  icon={<FileExcelOutlined />}
                  onClick={() => exportExpensesToExcel(items, summary, filters)}
                  size="small"
                >
                  Detalle
                </Button>
              </Tooltip>
              <Tooltip title="Exportar solo resumen">
                <Button 
                  icon={<DownloadOutlined />}
                  onClick={() => exportExpenseSummaryToExcel(summary, filters)}
                  size="small"
                >
                  Resumen
                </Button>
              </Tooltip>
            </Space>
          </Col>
        </Row>
        <Divider />
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="💰 Total del Período"
                value={summary?.total || 0}
                prefix="$"
                precision={0}
                valueStyle={{ color: '#ff4d4f' }}
              />
              <div className="mt-2 text-xs text-gray-500">
                Promedio diario: ${summary?.dailyAverage?.toLocaleString() || '0'}
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="📈 Mes Anterior"
                value={summary?.previousMonthTotal || 0}
                prefix="$"
                precision={0}
                valueStyle={{ color: '#722ed1' }}
              />
              {summary?.previousMonthTotal && summary?.total ? (
                <div className="mt-2">
                  {summary.total > summary.previousMonthTotal ? (
                    <Tag color="red">
                      +{(((summary.total - summary.previousMonthTotal) / summary.previousMonthTotal) * 100).toFixed(1)}%
                    </Tag>
                  ) : (
                    <Tag color="green">
                      {(((summary.total - summary.previousMonthTotal) / summary.previousMonthTotal) * 100).toFixed(1)}%
                    </Tag>
                  )}
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-500">Sin datos previos</div>
              )}
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="💳 Por Método de Pago" size="small">
              <div className="space-y-1">
                {Object.entries(summary?.byPaymentMethod || {}).map(([method, amount]) => (
                  <div key={method} className="flex justify-between text-xs">
                    <span>{method}</span>
                    <span className="font-bold">${amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={24}>
            <ExpenseSummaryChart data={summary?.byCategory || {}} />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: filters.page,
          pageSize: filters.pageSize,
          total,
          onChange: (p, ps) => dispatch(setFilters({ page: p, pageSize: ps })),
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} de ${total} gastos`,
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
