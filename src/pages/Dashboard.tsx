// src/pages/Dashboard.tsx
import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, DatePicker, message } from "antd";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchDashboard } from "../features/dashboard/dashboardSlice";

import dayjs from "dayjs";

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { summary, loading, error } = useAppSelector((s) => s.dashboard);

  // Filtros de fecha
  const [dates, setDates] = React.useState<[any, any]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ]);

  useEffect(() => {
    dispatch(
      fetchDashboard({
        dateFrom: dates[0].format("YYYY-MM-DD"),
        dateTo: dates[1].format("YYYY-MM-DD"),
      })
    );
  }, [dispatch, dates]);

  if (loading || !summary)
    return <Spin size="large" className="block mx-auto mt-10" />;
  if (error) message.error(error);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Dashboard General</h2>
      <Row gutter={16} className="mb-4">
        <Col>
          <DatePicker.RangePicker
            value={dates}
            onChange={(val) => {
              if (val) setDates(val as [any, any]);
            }}
            allowClear={false}
            format="YYYY-MM-DD"
          />
        </Col>
      </Row>
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Ventas"
              value={summary.totalSales}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Utilidad Total"
              value={summary.totalProfit}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Egresos"
              value={summary.totalExpenses}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Cierre Caja"
              value={summary.cashClosing || 0}
              prefix="$"
            />
          </Card>
        </Col>
      </Row>
      {/* <SalesExpensesChart data={summary.salesChart} /> */}
      {/* Aquí puedes agregar gráficas, rankings, etc */}
      {/* <SalesChart data={summary.salesChart} /> */}
      {/* <TopProducts data={summary.topProducts} /> */}
      {/* <Alerts data={summary.alerts} /> */}
    </div>
  );
};

export default Dashboard;
