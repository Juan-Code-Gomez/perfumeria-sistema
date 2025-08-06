// src/components/sales/ReturnModal.tsx
import { useEffect, useState } from "react";
import { Modal, Table, InputNumber, Button, message } from "antd";
import type { SaleDetail } from "../../types/SaleTypes";
import { useAppDispatch } from "../../store";
import {
  createCreditNote,
  fetchPendingSales,
} from "../../features/sales/salesSlice";

interface Props {
  open: boolean;
  saleId: number;
  details: SaleDetail[];
  onClose: () => void;
}

export default function ReturnModal({ open, saleId, details, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState<Record<number, number>>({}); // {detailId: qty}

  useEffect(() => {
    if (open) setSelected({});
  }, [open]);

  const cols = [
    { title: "Producto", dataIndex: ["product", "name"], key: "prod" },
    { title: "Cant. Vendida", dataIndex: "quantity", key: "qty" },
    {
      title: "Cantidad a devolver",
      key: "ret",
      render: (_: any, row: SaleDetail) => (
        <InputNumber
          min={0}
          max={row.quantity}
          value={selected[row.id!] || 0}
          onChange={(val) => setSelected((s) => ({ ...s, [row.id!]: val! }))}
        />
      ),
    },
  ];

  const handleReturn = async () => {
    const toReturn = Object.entries(selected)
      .filter(([_, qty]) => qty > 0)
      .map(([id, qty]) => ({
        productId: details.find((d) => d.id === +id)!.productId,
        quantity: qty,
      }));
    if (toReturn.length === 0) {
      return message.warning("Selecciona al menos 1 producto");
    }
    try {
      await dispatch(createCreditNote({ saleId, details: toReturn })).unwrap();
      message.success("Nota de crédito creada");
      onClose();
      dispatch(fetchPendingSales());
    } catch (e: any) {
      message.error(e.message || "Error al devolver");
    }
  };

  return (
    <Modal
      open={open}
      title={`Devolución / Nota crédito #${saleId}`}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="ok" type="primary" onClick={handleReturn}>
          Confirmar devolución
        </Button>,
      ]}
      width={700}
    >
      <Table
        dataSource={details}
        columns={cols}
        rowKey="id"
        pagination={false}
      />
    </Modal>
  );
}
