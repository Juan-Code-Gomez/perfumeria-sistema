// src/components/purchases/PurchaseDetailModal.tsx
import React from "react";
import { Modal, Table, Descriptions, Tag, Divider } from "antd";

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
    { title: "Precio unitario", dataIndex: "unitCost", key: "unitCost", render: (v: number) => `$${v?.toLocaleString() || 0}` },
    { title: "Total", dataIndex: "totalCost", key: "totalCost", render: (v: number) => `$${v?.toLocaleString() || 0}` },
  ];

  const hasInvoiceData = purchase.invoiceNumber || purchase.invoiceDate || purchase.dueDate;
  const saldo = (purchase.totalAmount || 0) - (purchase.paidAmount || 0);
  const isOverdue = purchase.dueDate && !purchase.isPaid && new Date(purchase.dueDate) < new Date();

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      title="Detalle de compra"
      width={800}
    >
      <Descriptions bordered size="small" column={2} className="mb-4">
        <Descriptions.Item label="Proveedor" span={2}>{purchase.supplier?.name || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Fecha de compra">{new Date(purchase.date).toLocaleDateString()}</Descriptions.Item>
        <Descriptions.Item label="Estado">
          {purchase.isPaid ? (
            <Tag color="green">✓ Pagada</Tag>
          ) : isOverdue ? (
            <Tag color="red">⚠ Vencida</Tag>
          ) : (
            <Tag color="orange">⏳ Pendiente</Tag>
          )}
        </Descriptions.Item>
      </Descriptions>

      {/* Información de factura */}
      {hasInvoiceData && (
        <>
          <Divider orientation="left" orientationMargin={0}>Datos de factura</Divider>
          <Descriptions bordered size="small" column={2} className="mb-4">
            {purchase.invoiceNumber && (
              <Descriptions.Item label="Número de factura" span={2}>
                <span className="font-mono font-semibold">{purchase.invoiceNumber}</span>
              </Descriptions.Item>
            )}
            {purchase.invoiceDate && (
              <Descriptions.Item label="Fecha de factura">
                {new Date(purchase.invoiceDate).toLocaleDateString()}
              </Descriptions.Item>
            )}
            {purchase.dueDate && (
              <Descriptions.Item label="Fecha de vencimiento">
                <span className={isOverdue ? "text-red-600 font-semibold" : ""}>
                  {new Date(purchase.dueDate).toLocaleDateString()}
                  {isOverdue && " ⚠"}
                </span>
              </Descriptions.Item>
            )}
            {purchase.notes && (
              <Descriptions.Item label="Notas" span={2}>
                {purchase.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </>
      )}

      {/* Productos */}
      <Divider orientation="left" orientationMargin={0}>Productos</Divider>
      <Table
        dataSource={purchase.details || []}
        columns={columns}
        rowKey="id"
        pagination={false}
        size="small"
        className="mb-4"
      />

      {/* Totales */}
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Subtotal">
          <span className="font-semibold">${purchase.subtotal?.toLocaleString() || 0}</span>
        </Descriptions.Item>
        <Descriptions.Item label="Descuento">
          <span className="text-red-600 font-semibold">
            {purchase.discount > 0 ? `-$${purchase.discount.toLocaleString()}` : '$0'}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Total a pagar">
          <span className="text-lg font-bold text-blue-600">
            ${purchase.totalAmount?.toLocaleString() || 0}
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="Monto pagado">
          <span className="font-semibold text-green-600">
            ${purchase.paidAmount?.toLocaleString() || 0}
          </span>
        </Descriptions.Item>
        {saldo > 0 && (
          <Descriptions.Item label="Saldo pendiente" span={2}>
            <span className="text-lg font-bold text-orange-600">
              ${saldo.toLocaleString()}
            </span>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Modal>
  );
};

export default PurchaseDetailModal;
