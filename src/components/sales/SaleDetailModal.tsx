import React from "react";
import { Modal, Table, Tag, Descriptions } from "antd";
import dayjs from "dayjs";
import type { Sale } from "../../features/sales/types";

interface SaleDetailModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({ open, onClose, sale }) => {
  if (!sale) return null;

  const columns = [
    {
      title: "Producto",
      dataIndex: ["product", "name"],
      key: "product",
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Precio unitario",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Subtotal",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={`Detalle de venta #${sale.id}`}
      width={700}
    >
      <Descriptions bordered column={2} size="small" className="mb-4">
        <Descriptions.Item label="Fecha">
          {dayjs(sale.date).format("YYYY-MM-DD")}
        </Descriptions.Item>
        <Descriptions.Item label="Cliente">
          {sale.customerName || <Tag color="default">Sin nombre</Tag>}
        </Descriptions.Item>
        <Descriptions.Item label="Total" span={2}>
          <b>${sale.totalAmount.toLocaleString()}</b>
        </Descriptions.Item>
        <Descriptions.Item label="Pagado" span={2}>
          {sale.isPaid ? (
            <Tag color="green">Pagada</Tag>
          ) : (
            <Tag color="orange">Pendiente</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>
      <Table
        dataSource={sale.details}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
      />
    </Modal>
  );
};

export default SaleDetailModal;
