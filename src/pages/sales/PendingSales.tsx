import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Modal, InputNumber, message, Select, Input } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchPendingSales,
  fetchSalePayments,
  addSalePayment,
} from "../../features/sales/salesSlice";
import dayjs from "dayjs";
import SalePaymentsModal from "../../components/sales/SalePaymentsModal";

const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

const PendingSales: React.FC = () => {
  const dispatch = useAppDispatch();
  const [abonoModal, setAbonoModal] = useState<{
    open: boolean;
    sale: any | null;
  }>({ open: false, sale: null });
  const [abono, setAbono] = useState<number>(0);
  const [method, setMethod] = useState<string>("Efectivo");
  const [note, setNote] = useState<string>("");

  const [paymentsModal, setPaymentsModal] = useState<{ open: boolean, sale: any | null }>({ open: false, sale: null });

  // Corrección: extrae payments del state
  const { pendingItems,  payments, paymentsLoading } = useAppSelector((s) => s.sales);

  useEffect(() => {
    dispatch(fetchPendingSales());
  }, [dispatch]);

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: "Cliente",
      dataIndex: "customerName",
      render: (v: string) => v || <Tag>Sin nombre</Tag>,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Pagado",
      dataIndex: "totalPaid",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Pendiente",
      dataIndex: "pending",
      render: (v: number) => (
        <Tag color={v === 0 ? "green" : "red"}>${v.toLocaleString()}</Tag>
      ),
    },
    {
      title: "Acciones",
      render: (_: any, sale: any) => (
      <>
        <Button
          type="primary"
          size="small"
          onClick={() => setAbonoModal({ open: true, sale })}
          style={{ marginRight: 8 }}
        >
          Abonar
        </Button>
        <Button
          type="default"
          size="small"
          onClick={() => {
            dispatch(fetchSalePayments(sale.id));
            setPaymentsModal({ open: true, sale });
          }}
        >
          Historial
        </Button>
      </>
      ),
    },
  ];

  // Modal de abono
  const handleAbonar = async () => {
    if (!abonoModal.sale || abono <= 0) {
      message.warning("Ingresa un valor válido");
      return;
    }
    try {
      await dispatch(
        addSalePayment({
          saleId: abonoModal.sale.id,
          amount: abono,
          date: dayjs().format("YYYY-MM-DD"),
          method,
          note,
        })
      ).unwrap();
      message.success("Abono registrado");
      setAbono(0);
      setMethod("Efectivo");
      setNote("");
      setAbonoModal({ open: false, sale: null });
      dispatch(fetchPendingSales());
    } catch (err: any) {
      message.error(err.message || "Error al abonar");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-3">Ventas pendientes de pago</h2>
      <Table
        dataSource={pendingItems}
        columns={columns}
        rowKey="id"
        loading={paymentsLoading}
      />
      {/* Modal de abono */}
      <Modal
        open={abonoModal.open}
        title={`Registrar abono a venta #${abonoModal.sale?.id}`}
        onCancel={() => setAbonoModal({ open: false, sale: null })}
        onOk={handleAbonar}
        okText="Registrar"
        destroyOnClose
      >
        <p><b>Cliente:</b> {abonoModal.sale?.customerName || "Sin nombre"}</p>
        <p><b>Pendiente:</b> ${abonoModal.sale?.pending?.toLocaleString()}</p>
        <InputNumber
          min={1}
          max={abonoModal.sale?.pending || 1}
          value={abono}
          onChange={(val) => setAbono(Number(val))}
          placeholder="Valor del abono"
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 8 }}>
          <Select value={method} onChange={setMethod} style={{ width: "100%" }}>
            {paymentMethods.map((m) => (
              <Select.Option key={m} value={m}>
                {m}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div style={{ marginTop: 8 }}>
          <Input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Observaciones (opcional)"
          />
        </div>
      </Modal>
      {/* Modal de historial */}
      <SalePaymentsModal
        open={paymentsModal.open}
        onClose={() => setPaymentsModal({ open: false, sale: null })}
        payments={payments}
        sale={paymentsModal.sale}
        loading={paymentsLoading}
      />
    </div>
  );
};

export default PendingSales;
