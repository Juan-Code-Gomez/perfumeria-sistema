// src/pages/purchases/PurchaseList.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Card, Tag } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchPurchases,
} from "../../features/purchases/purchaseSlice";
import PurchaseDetailModal from "../../components/purchases/PurchaseDetailModal";
import type { RootState } from "../../store";
import PurchaseForm from "../../components/purchases/PurchaseForm";

const PurchaseList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector(
    (state: RootState) => state.purchases
  );
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchPurchases(filters));
  }, [dispatch, filters]);

  const columns = [
    { title: "Proveedor", dataIndex: ["supplier", "name"], key: "supplier" },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Pagado",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Estado",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) => (
        <Tag color={isPaid ? "green" : "orange"}>
          {isPaid ? "Pagada" : "Pendiente"}
        </Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <Button type="link" onClick={() => setSelectedPurchase(record)}>
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card title="Compras" className="mb-6">
        <Button
          type="primary"
          onClick={() => setShowForm(true)}
          style={{ marginBottom: 16 }}
        >
          Registrar compra
        </Button>
        {/* Aquí puedes agregar formulario de filtros */}
        <PurchaseForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            dispatch(fetchPurchases({})); // o con filtros si tienes
            setShowForm(false);
          }}
        />
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>
      <PurchaseDetailModal
        visible={!!selectedPurchase}
        onClose={() => setSelectedPurchase(null)}
        purchase={selectedPurchase}
      />
    </div>
  );
};

export default PurchaseList;
