import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CheckOutlined,
  DeleteOutlined,
  HistoryOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { OrderStatus } from "../../types/OrderTypes";
import type { Order, OrderStatistics } from "../../types/OrderTypes";
import { getOrders, getOrderStatistics, cancelOrder } from "../../services/orderService";
import CreateOrderModal from "./CreateOrderModal";
import OrderDetailModal from "./OrderDetailModal";
import ApproveOrderModal from "./ApproveOrderModal";
import EditOrderModal from "./EditOrderModal";
import OrderInvoiceModal from "./OrderInvoiceModal";
import { useAppSelector, useAppDispatch } from "../../store/index";
import { fetchCompanyConfig } from "../../features/company-config/companyConfigSlice";

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrdersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Modales
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Obtener roles del usuario desde Redux
  const { user } = useAppSelector((state) => state.auth);
  const { config: companyConfig } = useAppSelector((state) => state.companyConfig);
  const userRoles = user?.roles?.map((ur: any) => ur.role.name) ?? [];
  
  // Permisos del usuario basados en roles
  const isAdmin = userRoles.includes("ADMIN") || userRoles.includes("SUPER_ADMIN");
  const isCajero = userRoles.includes("CAJERO");
  const isBodega = userRoles.includes("BODEGA");
  const isVendedor = userRoles.includes("VENDEDOR");
  
  const canCreate = isVendedor || isCajero || isAdmin || isBodega;
  const canEdit = isCajero || isAdmin;
  const canApprove = isBodega || isCajero || isAdmin;
  const canDelete = isAdmin;
  const canViewStats = isBodega || isCajero || isAdmin;

  useEffect(() => {
    // Cargar configuración de la compañía
    dispatch(fetchCompanyConfig());
    
    loadOrders();
    if (canViewStats) {
      loadStatistics();
    }
  }, [selectedStatus, dateRange]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      
      if (selectedStatus) {
        filters.status = selectedStatus;
      }
      
      if (dateRange) {
        filters.dateFrom = dateRange[0].format("YYYY-MM-DD");
        filters.dateTo = dateRange[1].format("YYYY-MM-DD");
      }

      const data = await getOrders(filters);
      setOrders(data);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error al cargar pedidos");
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getOrderStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      message.success("Pedido cancelado exitosamente");
      loadOrders();
      if (canViewStats) {
        loadStatistics();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || "Error al cancelar pedido");
    }
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleApprove = (order: Order) => {
    setSelectedOrder(order);
    setApproveModalOpen(true);
  };

  const handlePrintInvoice = (order: Order) => {
    console.log('handlePrintInvoice llamado con order:', order);
    console.log('companyConfig:', companyConfig);
    setSelectedOrder(order);
    setInvoiceModalOpen(true);
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

  const columns = [
    {
      title: "# Pedido",
      dataIndex: "orderNumber",
      key: "orderNumber",
      width: 120,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: "Fecha",
      dataIndex: "orderDate",
      key: "orderDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Cliente",
      key: "customer",
      width: 200,
      render: (_: any, record: Order) => (
        <span>{record.customerName || record.client?.name || "Sin cliente"}</span>
      ),
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: OrderStatus) => getStatusTag(status),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      align: "right" as const,
      render: (amount: number) => `$${amount.toLocaleString('es-CO')}`,
    },
    {
      title: "Creado por",
      key: "createdBy",
      width: 150,
      render: (_: any, record: Order) => (
        <span>{record.createdBy?.name || "N/A"}</span>
      ),
    },
    {
      title: "Aprobado por",
      key: "approvedBy",
      width: 150,
      render: (_: any, record: Order) => (
        <span>{record.approvedBy?.name || "-"}</span>
      ),
    },
    {
      title: "Productos",
      key: "products",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Order) => (
        <Tag color="blue">{record.details?.length || 0}</Tag>
      ),
    },
    {
      title: "Acciones",
      key: "actions",
      width: 200,
      fixed: "right" as const,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>

          <Tooltip title="Imprimir">
            <Button
              type="text"
              icon={<PrinterOutlined />}
              onClick={() => handlePrintInvoice(record)}
            />
          </Tooltip>

          {record.status === OrderStatus.PENDING && canEdit && (
            <Tooltip title="Editar">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
          )}

          {record.status === OrderStatus.PENDING && canApprove && (
            <Tooltip title="Aprobar">
              <Button
                type="text"
                icon={<CheckOutlined />}
                style={{ color: "#52c41a" }}
                onClick={() => handleApprove(record)}
              />
            </Tooltip>
          )}

          {record.status === OrderStatus.PENDING && canDelete && (
            <Popconfirm
              title="¿Cancelar este pedido?"
              description="Esta acción liberará el stock reservado."
              onConfirm={() => handleCancelOrder(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Tooltip title="Cancelar">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* Estadísticas */}
      {canViewStats && statistics && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Total Pedidos"
                value={statistics.total}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Pendientes"
                value={statistics.pending}
                valueStyle={{ color: "#faad14" }}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Aprobados"
                value={statistics.approved}
                valueStyle={{ color: "#52c41a" }}
                prefix={<CheckOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Monto Pendiente"
                value={statistics.pendingOrders.totalAmount}
                precision={0}
                prefix="$"
                valueStyle={{ color: "#faad14" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros y acciones */}
      <Card
        title="Gestión de Pedidos"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadOrders}
            >
              Actualizar
            </Button>
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
              >
                Nuevo Pedido
              </Button>
            )}
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Select
            placeholder="Filtrar por estado"
            style={{ width: 200 }}
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
          >
            <Option value={OrderStatus.PENDING}>Pendiente</Option>
            <Option value={OrderStatus.APPROVED}>Aprobado</Option>
            <Option value={OrderStatus.CANCELLED}>Cancelado</Option>
          </Select>

          <RangePicker
            placeholder={["Fecha desde", "Fecha hasta"]}
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
            format="DD/MM/YYYY"
          />
        </Space>

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} pedidos`,
          }}
        />
      </Card>

      {/* Modales */}
      <CreateOrderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          loadOrders();
          if (canViewStats) {
            loadStatistics();
          }
          setCreateModalOpen(false);
        }}
      />

      {selectedOrder && (
        <>
          <OrderDetailModal
            open={detailModalOpen}
            order={selectedOrder}
            onClose={() => {
              setDetailModalOpen(false);
              setSelectedOrder(null);
            }}
          />

          <EditOrderModal
            open={editModalOpen}
            order={selectedOrder}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedOrder(null);
            }}
            onSuccess={() => {
              loadOrders();
              setEditModalOpen(false);
              setSelectedOrder(null);
            }}
          />

          <ApproveOrderModal
            open={approveModalOpen}
            order={selectedOrder}
            onClose={() => {
              setApproveModalOpen(false);
              setSelectedOrder(null);
            }}
            onSuccess={() => {
              loadOrders();
              if (canViewStats) {
                loadStatistics();
              }
              setApproveModalOpen(false);
              setSelectedOrder(null);
            }}
          />

          {companyConfig && (
            <OrderInvoiceModal
              visible={invoiceModalOpen}
              order={selectedOrder}
              companyConfig={companyConfig}
              onClose={() => {
                setInvoiceModalOpen(false);
                setSelectedOrder(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OrdersList;
