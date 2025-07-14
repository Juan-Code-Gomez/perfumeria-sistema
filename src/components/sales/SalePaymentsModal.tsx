import React from "react";
import { Modal, Table, Tag, Spin } from "antd";
import dayjs from "dayjs";

interface SalePaymentsModalProps {
  open: boolean;
  onClose: () => void;
  payments: any[];
  sale?: any;
  loading?: boolean;
}

const columns = [
  { title: "Fecha", dataIndex: "date", render: (v: string) => dayjs(v).format("YYYY-MM-DD HH:mm") },
  { title: "Método", dataIndex: "method", render: (v: string) => <Tag>{v || "Sin método"}</Tag> },
  { title: "Monto", dataIndex: "amount", render: (v: number) => `$${v.toLocaleString()}` },
  { title: "Nota", dataIndex: "note", render: (v: string) => v || "-" },
];

const SalePaymentsModal: React.FC<SalePaymentsModalProps> = ({
  open,
  onClose,
  payments,
  sale,
  loading
}) => (
    
  <Modal
    open={open}
    onCancel={onClose}
    title={`Historial de abonos de venta #${sale?.id ?? ""}`}
    footer={null}
    width={500}
  >
    <Spin spinning={loading}>
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Spin>
  </Modal>
);

export default SalePaymentsModal;
