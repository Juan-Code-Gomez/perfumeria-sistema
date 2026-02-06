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
  Drawer,
  List,
  Typography,
  Divider,
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
  MoreOutlined,
  UserOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Text } = Typography;
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

  // Responsive states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  // Drawer para acciones en móvil
  const [actionDrawer, setActionDrawer] = useState<{
    open: boolean;
    order: Order | null;
  }>({ open: false, order: null });

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

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      width: isTablet ? 100 : 120,
      render: (text: string) => <strong style={{ fontSize: isTablet ? '12px' : '14px' }}>{text}</strong>,
    },
    {
      title: "Fecha",
      dataIndex: "orderDate",
      key: "orderDate",
      width: isTablet ? 100 : 120,
      render: (date: string) => (
        <Text style={{ fontSize: isTablet ? '12px' : '13px' }}>
          {isTablet ? dayjs(date).format("DD/MM") : dayjs(date).format("DD/MM/YYYY")}
        </Text>
      ),
    },
    ...(!isTablet ? [{
      title: "Cliente",
      key: "customer",
      width: 200,
      render: (_: any, record: Order) => (
        <span>{record.customerName || record.client?.name || "Sin cliente"}</span>
      ),
    }] : []),
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: isTablet ? 100 : 120,
      render: (status: OrderStatus) => getStatusTag(status),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: isTablet ? 100 : 120,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong style={{ fontSize: isTablet ? '12px' : '14px', color: '#1890ff' }}>
          ${amount.toLocaleString('es-CO')}
        </Text>
      ),
    },
    ...(!isTablet ? [{
      title: "Creado por",
      key: "createdBy",
      width: 150,
      render: (_: any, record: Order) => (
        <span>{record.createdBy?.name || "N/A"}</span>
      ),
    }] : []),
    ...(!isTablet ? [{
      title: "Aprobado por",
      key: "approvedBy",
      width: 150,
      render: (_: any, record: Order) => (
        <span>{record.approvedBy?.name || "-"}</span>
      ),
    }] : []),
    ...(!isTablet ? [{
      title: "Productos",
      key: "products",
      width: 100,
      align: "center" as const,
      render: (_: any, record: Order) => (
        <Tag color="blue">{record.details?.length || 0}</Tag>
      ),
    }] : []),
    {
      title: "Acciones",
      key: "actions",
      width: isTablet ? 120 : 200,
      fixed: isTablet ? ("right" as const) : undefined,
      render: (_: any, record: Order) => (
        <Space size="small">
          <Tooltip title="Ver detalle">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size={isTablet ? "small" : "middle"}
            />
          </Tooltip>

          {!isTablet && (
            <>
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
            </>
          )}

          {isTablet && (
            <Button
              type="text"
              icon={<MoreOutlined />}
              onClick={() => setActionDrawer({ open: true, order: record })}
              style={{ fontSize: '16px' }}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: isMobile ? "12px" : isTablet ? "16px" : "24px",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* Estadísticas */}
      {canViewStats && statistics && (
        <Row gutter={isMobile ? [12, 12] : [16, 16]} style={{ marginBottom: isMobile ? 16 : 24 }}>
          <Col xs={12} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: isMobile ? '12px' : '16px',
                color: 'white',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '12px' : '14px' }}>Total Pedidos</span>}
                value={statistics.total}
                valueStyle={{ color: 'white', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}
                prefix={<HistoryOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                border: 'none',
                borderRadius: isMobile ? '12px' : '16px',
                color: 'white',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '12px' : '14px' }}>Pendientes</span>}
                value={statistics.pending}
                valueStyle={{ color: 'white', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}
                prefix={<HistoryOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: isMobile ? '12px' : '16px',
                color: 'white',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '12px' : '14px' }}>Aprobados</span>}
                value={statistics.approved}
                valueStyle={{ color: 'white', fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold' }}
                prefix={<CheckOutlined style={{ color: 'white' }} />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={12} md={6}>
            <Card
              style={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                border: 'none',
                borderRadius: isMobile ? '12px' : '16px',
                color: 'white',
              }}
              bodyStyle={{ padding: isMobile ? '16px' : '20px' }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '12px' : '14px' }}>Monto Pendiente</span>}
                value={statistics.pendingOrders.totalAmount}
                precision={0}
                prefix={<span style={{ color: 'white' }}>$</span>}
                valueStyle={{ color: 'white', fontSize: isMobile ? '18px' : '22px', fontWeight: 'bold' }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros y acciones */}
      <Card
        title={isMobile ? "Pedidos" : "Gestión de Pedidos"}
        extra={
          <Space size={isMobile ? "small" : "middle"}>
            {!isMobile && (
              <Button
                icon={<ReloadOutlined />}
                onClick={loadOrders}
                size={isTablet ? "middle" : "large"}
              >
                {isTablet ? "" : "Actualizar"}
              </Button>
            )}
            {canCreate && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateModalOpen(true)}
                size={isMobile ? "middle" : isTablet ? "middle" : "large"}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                }}
              >
                {isMobile ? "" : "Nuevo"}
              </Button>
            )}
          </Space>
        }
        style={{
          borderRadius: isMobile ? '12px' : '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: 'none',
          marginBottom: isMobile ? 12 : 16,
        }}
        bodyStyle={{ padding: isMobile ? '12px' : '16px' }}
      >
        <Space style={{ marginBottom: 16 }} wrap size={isMobile ? "small" : "middle"}>
          <Select
            placeholder="Estado"
            style={{ width: isMobile ? 120 : 200 }}
            allowClear
            value={selectedStatus}
            onChange={setSelectedStatus}
            size={isMobile ? "middle" : "large"}
          >
            <Option value={OrderStatus.PENDING}>Pendiente</Option>
            <Option value={OrderStatus.APPROVED}>Aprobado</Option>
            <Option value={OrderStatus.CANCELLED}>Cancelado</Option>
          </Select>

          <RangePicker
            placeholder={isMobile ? ["Desde", "Hasta"] : ["Fecha desde", "Fecha hasta"]}
            value={dateRange}
            onChange={(dates) => setDateRange(dates as any)}
            format="DD/MM/YYYY"
            size={isMobile ? "middle" : "large"}
            style={{ width: isMobile ? '100%' : 'auto' }}
          />
        </Space>

        {/* Vista condicional: Cards para móvil, Tabla para desktop/tablet */}
        {isMobile ? (
          /* Vista de Cards para móvil */
          <div style={{ marginBottom: '80px' }}>
            <List
              dataSource={orders}
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `${total} pedidos`,
                simple: true,
              }}
              renderItem={(order: Order) => {
                const isPending = order.status === OrderStatus.PENDING;
                
                return (
                  <Card
                    key={order.id}
                    style={{
                      marginBottom: '12px',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      border: '1px solid #f0f0f0',
                    }}
                    bodyStyle={{ padding: '16px' }}
                  >
                    <Row justify="space-between" align="top" style={{ marginBottom: '12px' }}>
                      <Col span={18}>
                        <Space direction="vertical" size={4} style={{ width: '100%' }}>
                          <Space>
                            <Text code style={{ fontSize: '12px' }}>{order.orderNumber}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(order.orderDate).format('DD/MM/YYYY')}
                            </Text>
                          </Space>
                          <Space>
                            <UserOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
                            <Text strong style={{ fontSize: '13px' }}>
                              {order.customerName || order.client?.name || 'Sin cliente'}
                            </Text>
                          </Space>
                        </Space>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          onClick={() => setActionDrawer({ open: true, order })}
                          style={{ 
                            padding: '4px 8px',
                            fontSize: '20px',
                            color: '#1890ff'
                          }}
                        />
                      </Col>
                    </Row>
                    
                    <Divider style={{ margin: '12px 0' }} />
                    
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Total</Text>
                          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                            ${order.totalAmount.toLocaleString('es-CO')}
                          </Text>
                        </Space>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <Space direction="vertical" size={0} style={{ alignItems: 'flex-end' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Estado</Text>
                          {getStatusTag(order.status)}
                        </Space>
                      </Col>
                    </Row>
                    
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '8px', 
                      background: '#f0f5ff', 
                      borderRadius: '6px',
                      border: '1px solid #adc6ff'
                    }}>
                      <Space size={4}>
                        <ShoppingOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
                        <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                          {order.details?.length || 0} productos
                        </Text>
                      </Space>
                    </div>
                    
                    <Row gutter={8} style={{ marginTop: '12px' }}>
                      <Col span={12}>
                        <Button
                          type="primary"
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleViewDetail(order)}
                          style={{ fontSize: '11px', borderRadius: '6px', width: '100%' }}
                        >
                          Ver
                        </Button>
                      </Col>
                      <Col span={12}>
                        {isPending && canApprove && (
                          <Button
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleApprove(order)}
                            style={{ 
                              fontSize: '11px', 
                              borderRadius: '6px',
                              width: '100%',
                              color: '#52c41a',
                              borderColor: '#52c41a'
                            }}
                          >
                            Aprobar
                          </Button>
                        )}
                      </Col>
                    </Row>
                  </Card>
                );
              }}
            />
          </div>
        ) : (
          /* Tabla para desktop y tablet */
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={loading}
            size={isTablet ? "small" : "middle"}
            scroll={{ x: isTablet ? 800 : 1200 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: !isTablet,
              showQuickJumper: !isTablet,
              showTotal: (total) => `Total ${total} pedidos`,
            }}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          />
        )}
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

      {/* Drawer de acciones para móvil/tablet */}
      <Drawer
        title={
          <Space>
            <ShoppingOutlined />
            <span>Pedido {actionDrawer.order?.orderNumber}</span>
          </Space>
        }
        placement="bottom"
        height="auto"
        open={actionDrawer.open}
        onClose={() => setActionDrawer({ open: false, order: null })}
        bodyStyle={{ padding: '16px' }}
        style={{ borderRadius: '20px 20px 0 0' }}
      >
        {actionDrawer.order && (
          <>
            {/* Información del pedido */}
            <Card
              size="small"
              style={{ 
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none'
              }}
            >
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>Cliente</Text>
                    <Text strong style={{ color: 'white', fontSize: '14px' }}>
                      {actionDrawer.order.customerName || actionDrawer.order.client?.name || 'Sin cliente'}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Total</Text>
                    <Text strong style={{ color: 'white', fontSize: '16px' }}>
                      ${actionDrawer.order.totalAmount?.toLocaleString('es-CO')}
                    </Text>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Estado</Text>
                    <div style={{ marginTop: '4px' }}>
                      {getStatusTag(actionDrawer.order.status)}
                    </div>
                  </Space>
                </Col>
                <Col span={8}>
                  <Space direction="vertical" size={0}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Productos</Text>
                    <Text strong style={{ color: 'white', fontSize: '16px' }}>
                      {actionDrawer.order.details?.length || 0}
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Acciones principales */}
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                Acciones principales
              </Text>
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                <Button
                  block
                  size="large"
                  icon={<EyeOutlined />}
                  onClick={() => {
                    setActionDrawer({ open: false, order: null });
                    handleViewDetail(actionDrawer.order!);
                  }}
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                  }}
                >
                  Ver Detalles Completos
                </Button>
                
                {actionDrawer.order.status === OrderStatus.PENDING && canApprove && (
                  <Button
                    block
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, order: null });
                      handleApprove(actionDrawer.order!);
                    }}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      background: '#f6ffed',
                      borderColor: '#b7eb8f',
                      color: '#52c41a'
                    }}
                  >
                    Aprobar Pedido y Crear Venta
                  </Button>
                )}

                {actionDrawer.order.status === OrderStatus.PENDING && canEdit && (
                  <Button
                    block
                    size="large"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, order: null });
                      handleEdit(actionDrawer.order!);
                    }}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      background: '#e6f7ff',
                      borderColor: '#91d5ff',
                      color: '#1890ff'
                    }}
                  >
                    Editar Pedido
                  </Button>
                )}
              </Space>
            </div>

            {/* Acciones de impresión */}
            <div>
              <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                Imprimir
              </Text>
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                <Button
                  block
                  size="large"
                  icon={<PrinterOutlined />}
                  onClick={() => {
                    setActionDrawer({ open: false, order: null });
                    handlePrintInvoice(actionDrawer.order!);
                  }}
                  style={{
                    height: '48px',
                    borderRadius: '12px',
                    fontWeight: 500,
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    background: '#f9f0ff',
                    borderColor: '#d3adf7',
                    color: '#722ed1'
                  }}
                >
                  Imprimir Factura del Pedido
                </Button>
              </Space>
            </div>

            {/* Acciones administrativas */}
            {actionDrawer.order.status === OrderStatus.PENDING && canDelete && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                  Acciones administrativas
                </Text>
                <Popconfirm
                  title="¿Cancelar este pedido?"
                  description="Esta acción liberará el stock reservado."
                  onConfirm={() => {
                    setActionDrawer({ open: false, order: null });
                    handleCancelOrder(actionDrawer.order!.id);
                  }}
                  okText="Sí"
                  cancelText="No"
                >
                  <Button
                    block
                    size="large"
                    danger
                    icon={<DeleteOutlined />}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start'
                    }}
                  >
                    Cancelar Pedido
                  </Button>
                </Popconfirm>
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
};

export default OrdersList;
