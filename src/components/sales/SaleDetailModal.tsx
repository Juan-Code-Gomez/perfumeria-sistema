import React, { useState } from "react";
import { Modal, Table, Tag, Descriptions, Button } from "antd";
import dayjs from "dayjs";
import type { Sale } from "../../features/sales/types";
import SaleTicketPrint from "./SaleTicketPrint";

interface SaleDetailModalProps {
  open: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailModal: React.FC<SaleDetailModalProps> = ({
  open,
  onClose,
  sale,
}) => {
  const [printModalOpen, setPrintModalOpen] = useState(false);

  if (!sale) return null;

  const utilidadTotal = sale.details.reduce(
    (acc, d) => acc + (d.unitPrice - d.product.purchasePrice) * d.quantity,
    0
  );
  const margen = sale.totalAmount
    ? (utilidadTotal / sale.totalAmount) * 100
    : 0;

  const columns = [
    { title: "Producto", dataIndex: ["product", "name"], key: "product" },
    { title: "Cantidad", dataIndex: "quantity", key: "quantity" },
    {
      title: "P. compra",
      dataIndex: ["product", "purchasePrice"],
      key: "purchasePrice",
      render: (v: number) => `$${v?.toLocaleString() ?? "-"}`,
    },
    {
      title: "P. venta",
      dataIndex: "unitPrice",
      key: "unitPrice",
      render: (v: number) => `$${v?.toLocaleString() ?? "-"}`,
    },
    {
      title: "Utilidad",
      key: "utilidad",
      render: (_: any, detail: any) =>
        `$${(
          (detail.unitPrice - detail.product.purchasePrice) *
          detail.quantity
        ).toLocaleString()}`,
    },
    {
      title: "Subtotal",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        title={`Detalle de venta #${sale.id}`}
        width={700}
      >
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <Button
            type="primary"
            onClick={() => setPrintModalOpen(true)}
            size="small"
          >
            Imprimir ticket
          </Button>
        </div>
        <Descriptions bordered column={2} size="small" className="mb-4">
          <Descriptions.Item label="Fecha">
            {dayjs(sale.date).format("YYYY-MM-DD")}
          </Descriptions.Item>
          <Descriptions.Item label="Cliente">
            {sale.customerName || <Tag color="default">Sin nombre</Tag>}
          </Descriptions.Item>
          
          {/* Información de descuento */}
          {sale.discountAmount && sale.discountAmount > 0 ? (
            <>
              <Descriptions.Item label="Subtotal">
                <span style={{ color: '#666' }}>
                  ${sale.subtotalAmount?.toLocaleString() || '-'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Descuento aplicado">
                <div>
                  <Tag color="red" style={{ marginBottom: 4 }}>
                    {sale.discountType === 'percentage' 
                      ? `${sale.discountValue}% de descuento`
                      : 'Descuento fijo'
                    }
                  </Tag>
                  <div style={{ fontSize: '14px', color: '#f5222d', fontWeight: 'bold' }}>
                    -${sale.discountAmount.toLocaleString()}
                  </div>
                </div>
              </Descriptions.Item>
            </>
          ) : (
            <Descriptions.Item label="Subtotal" span={2}>
              <span style={{ color: '#666' }}>
                ${sale.totalAmount.toLocaleString()} (sin descuento)
              </span>
            </Descriptions.Item>
          )}
          
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
          <Descriptions.Item label="Utilidad total" span={2}>
            <b>${utilidadTotal.toLocaleString()}</b>
          </Descriptions.Item>
          <Descriptions.Item label="Margen" span={2}>
            <Tag
              color={margen >= 40 ? "green" : margen >= 20 ? "orange" : "red"}
            >
              {margen.toFixed(2)}%
            </Tag>
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

      <Modal
        open={printModalOpen}
        onCancel={() => setPrintModalOpen(false)}
        footer={null}
        title="Ticket de venta"
        width={340}
        style={{ top: 30, padding: 0 }}
        bodyStyle={{ padding: 0 }}
        destroyOnClose
      >
        <SaleTicketPrint sale={sale} onClose={() => setPrintModalOpen(false)} />
      </Modal>
    </>
  );
};

export default SaleDetailModal;
