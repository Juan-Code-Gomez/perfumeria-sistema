import React, { useEffect, useState } from "react";
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Timeline,
  Tabs,
  Spin,
  Empty,
  Divider,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { OrderStatus } from "../../types/OrderTypes";
import type { Order, OrderHistoryEntry } from "../../types/OrderTypes";
import { getOrderHistory } from "../../services/orderService";

interface Props {
  open: boolean;
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<Props> = ({ open, order, onClose }) => {
  const [history, setHistory] = useState<OrderHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (open && activeTab === "history") {
      loadHistory();
    }
  }, [open, activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getOrderHistory(order.id);
      setHistory(data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusTag = (status: OrderStatus) => {
    const statusConfig = {
      PENDING: { color: "orange", text: "Pendiente" },
      APPROVED: { color: "green", text: "Aprobado" },
      CANCELLED: { color: "red", text: "Cancelado" },
    };

    const config = statusConfig[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "CREATED":
        return <PlusCircleOutlined style={{ color: "#1890ff" }} />;
      case "EDITED":
        return <EditOutlined style={{ color: "#faad14" }} />;
      case "APPROVED":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "CANCELLED":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return null;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATED":
        return "blue";
      case "EDITED":
        return "orange";
      case "APPROVED":
        return "green";
      case "CANCELLED":
        return "red";
      default:
        return "default";
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case "CREATED":
        return "CREADO";
      case "EDITED":
        return "EDITADO";
      case "APPROVED":
        return "APROBADO";
      case "CANCELLED":
        return "CANCELADO";
      default:
        return action;
    }
  };

  const renderChanges = (changes: any) => {
    if (!changes || typeof changes !== "object") return null;

    if (Array.isArray(changes)) {
      return (
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {changes.map((change: any, index: number) => (
            <li key={index}>
              <strong>{change.productName || `Producto #${change.productId}`}</strong>
              {change.action === "ADDED" && ` agregado (cantidad: ${change.quantity})`}
              {change.action === "REMOVED" && ` eliminado (cantidad: ${change.quantity})`}
              {change.action === "MODIFIED" && ` modificado de ${change.from} a ${change.to} unidades`}
            </li>
          ))}
        </ul>
      );
    }

    return <pre style={{ margin: 0 }}>{JSON.stringify(changes, null, 2)}</pre>;
  };

  const productColumns = [
    {
      title: "Producto",
      key: "product",
      render: (_: any, record: any) => (
        <div>
          <div><strong>{record.product?.name || "N/A"}</strong></div>
          {record.product?.sku && (
            <div style={{ fontSize: 12, color: "#999" }}>SKU: {record.product.sku}</div>
          )}
        </div>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number, record: any) => (
        <div>
          <div>{qty.toFixed(0)}</div>
          {record.originalQty && record.originalQty !== qty && (
            <div style={{ fontSize: 12, color: "#faad14" }}>
              Original: {record.originalQty.toFixed(0)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Precio Unitario",
      dataIndex: "unitPrice",
      key: "unitPrice",
      align: "right" as const,
      render: (price: number) => `$${price.toLocaleString('es-CO')}`,
    },
    {
      title: "Total",
      dataIndex: "totalPrice",
      key: "totalPrice",
      align: "right" as const,
      render: (total: number) => <strong>${total.toLocaleString('es-CO')}</strong>,
    },
  ];

  const detailsTab = (
    <div>
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="# Pedido" span={2}>
          <strong>{order.orderNumber}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          {getStatusTag(order.status)}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha de Creación">
          {dayjs(order.orderDate).format("DD/MM/YYYY HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Cliente">
          {order.customerName || order.client?.name || "Sin cliente"}
        </Descriptions.Item>
        <Descriptions.Item label="Total">
          <strong style={{ fontSize: 16 }}>${order.totalAmount.toLocaleString('es-CO')}</strong>
        </Descriptions.Item>
        <Descriptions.Item label="Creado por">
          {order.createdBy?.name || "N/A"}
        </Descriptions.Item>
        {order.approvedBy && (
          <Descriptions.Item label="Aprobado por">
            {order.approvedBy.name}
          </Descriptions.Item>
        )}
        {order.approvedAt && (
          <Descriptions.Item label="Fecha de Aprobación">
            {dayjs(order.approvedAt).format("DD/MM/YYYY HH:mm")}
          </Descriptions.Item>
        )}
        {order.sale && (
          <Descriptions.Item label="Venta Generada" span={2}>
            <Tag color="green">Venta #{order.sale.id}</Tag>
          </Descriptions.Item>
        )}
        {order.notes && (
          <Descriptions.Item label="Observaciones" span={2}>
            {order.notes}
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider>Productos del Pedido</Divider>

      <Table
        columns={productColumns}
        dataSource={order.details}
        rowKey="id"
        pagination={false}
        size="small"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={3}>
                <strong>Total</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <strong style={{ fontSize: 16 }}>
                  ${order.totalAmount.toLocaleString('es-CO')}
                </strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </div>
  );

  const historyTab = (
    <div style={{ minHeight: 300 }}>
      {loadingHistory ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin tip="Cargando historial..." />
        </div>
      ) : history.length === 0 ? (
        <Empty description="No hay historial disponible" />
      ) : (
        <Timeline mode="left">
          {history.map((entry) => (
            <Timeline.Item
              key={entry.id}
              dot={getActionIcon(entry.action)}
              color={getActionColor(entry.action)}
            >
              <div>
                <div style={{ marginBottom: 8 }}>
                  <Tag color={getActionColor(entry.action)}>{getActionText(entry.action)}</Tag>
                  <span style={{ marginLeft: 8, color: "#666" }}>
                    {dayjs(entry.timestamp).format("DD/MM/YYYY HH:mm:ss")}
                  </span>
                </div>
                <div style={{ marginBottom: 4 }}>
                  <strong>Usuario:</strong> {entry.user?.name || "N/A"}
                </div>
                {entry.notes && (
                  <div style={{ marginBottom: 4 }}>
                    <strong>Nota:</strong> {entry.notes}
                  </div>
                )}
                {entry.changes && (
                  <div>
                    <strong>Cambios:</strong>
                    {renderChanges(entry.changes)}
                  </div>
                )}
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      )}
    </div>
  );

  return (
    <Modal
      title={`Detalle del Pedido ${order.orderNumber}`}
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "details",
            label: "Detalles",
            children: detailsTab,
          },
          {
            key: "history",
            label: "Historial",
            children: historyTab,
          },
        ]}
      />
    </Modal>
  );
};

export default OrderDetailModal;
