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
    { 
      title: "Proveedor", 
      dataIndex: ["supplier", "name"], 
      key: "supplier",
      width: 150,
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      width: 100,
      render: (d: string) => new Date(d).toLocaleDateString(),
    },
    {
      title: "N° Factura",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      width: 120,
      render: (v: string) => v || <span className="text-gray-400">-</span>,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      width: 100,
      render: (v: number) => `$${v?.toLocaleString() || 0}`,
    },
    {
      title: "Descuento",
      dataIndex: "discount",
      key: "discount",
      width: 100,
      render: (v: number) => v > 0 ? (
        <span className="text-red-600">-${v.toLocaleString()}</span>
      ) : (
        <span className="text-gray-400">$0</span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 100,
      render: (v: number) => <span className="font-semibold">${v?.toLocaleString() || 0}</span>,
    },
    {
      title: "Pagado",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 100,
      render: (v: number) => `$${v?.toLocaleString() || 0}`,
    },
    {
      title: "Saldo",
      key: "saldo",
      width: 100,
      render: (_: any, record: any) => {
        const saldo = (record.totalAmount || 0) - (record.paidAmount || 0);
        return saldo > 0 ? (
          <span className="text-orange-600 font-semibold">${saldo.toLocaleString()}</span>
        ) : (
          <span className="text-green-600">$0</span>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "isPaid",
      key: "isPaid",
      width: 100,
      render: (isPaid: boolean, record: any) => {
        // Verificar si está vencida
        const isOverdue = record.dueDate && !isPaid && new Date(record.dueDate) < new Date();
        
        if (isPaid) {
          return <Tag color="green">✓ Pagada</Tag>;
        } else if (isOverdue) {
          return <Tag color="red">⚠ Vencida</Tag>;
        } else {
          return <Tag color="orange">⏳ Pendiente</Tag>;
        }
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 100,
      fixed: 'right' as const,
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
