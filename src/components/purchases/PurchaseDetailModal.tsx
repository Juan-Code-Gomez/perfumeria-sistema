// src/components/purchases/PurchaseDetailModal.tsx
import React from "react";
import { Modal, Table, Descriptions, Tag } from "antd";

interface Props {
  visible: boolean;
  onClose: () => void;
  purchase: any | null;
}

const PurchaseDetailModal: React.FC<Props> = ({ visible, onClose, purchase }) => {
  if (!purchase) return null;

  const columns = [
    { title: "Producto", dataIndex: ["product", "name"], key: "product" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    { title: "Precio unitario", dataIndex: "unitCost", key: "unitCost", render: (v: number) => `$${v.toLocaleString()}` },
    { title: "Total", dataIndex: "totalCost", key: "totalCost", render: (v: number) => `$${v.toLocaleString()}` },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title="Detalle de compra"
      width={700}
    >
      <Descriptions bordered size="small" column={1} className="mb-4">
        <Descriptions.Item label="Proveedor">{purchase.supplier?.name}</Descriptions.Item>
        <Descriptions.Item label="Fecha">{new Date(purchase.date).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Total compra">{`$${purchase.totalAmount.toLocaleString()}`}</Descriptions.Item>
        <Descriptions.Item label="Pagado">{`$${purchase.paidAmount.toLocaleString()}`}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag color={purchase.isPaid ? "green" : "orange"}>{purchase.isPaid ? "Pagada" : "Pendiente"}</Tag>
        </Descriptions.Item>
      </Descriptions>
      <Table
        dataSource={purchase.details || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
      />
    </Modal>
  );
};

export default PurchaseDetailModal;
