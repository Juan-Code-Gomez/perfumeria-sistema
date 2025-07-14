// src/components/dashboard/SalesExpensesChart.tsx
import React from "react";
import { Column } from "@ant-design/charts";
import { Card } from "antd";

interface Props {
  data: Array<{ date: string; sales: number; expenses: number }>;
}

const SalesExpensesChart: React.FC<Props> = ({ data }) => {
  // Convertimos el array a un formato "long" para comparar series
  const chartData = [
    ...data.map((d) => ({
      date: d.date,
      value: d.sales,
      type: "Ventas",
    })),
    ...data.map((d) => ({
      date: d.date,
      value: d.expenses,
      type: "Egresos",
    })),
  ];

  const config = {
    data: chartData,
    isGroup: true,
    xField: "date",
    yField: "value",
    seriesField: "type",
    color: ["#1677ff", "#ffa940"],
    label: {
      // Muestra el valor encima de la barra
      position: "middle",
      style: { fill: "#fff" },
      formatter: (v: any) => `$${v.value.toLocaleString()}`
    },
    legend: { position: "top" },
    tooltip: {
      formatter: (datum: any) => ({
        name: datum.type,
        value: `$${datum.value.toLocaleString()}`
      }),
    },
  } as const;

  return (
    <Card title="Ventas vs Egresos (diario)" className="mb-6">
      <Column {...config} height={320} />
    </Card>
  );
};

export default SalesExpensesChart;
