import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Row,
  Col,
  message,
  Popconfirm,
  Card,
  DatePicker,
  Modal,
  InputNumber,
  Select,
  Input,
  Space,
  Badge,
  Statistic,
  Typography,
  Tooltip,
  Divider,
  Dropdown,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  DollarOutlined,
  PrinterOutlined,
  ExportOutlined,
  ReloadOutlined,
  CreditCardOutlined,
  DownOutlined,
  FileExcelOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchSales,
  setFilters,
  addSalePayment,
} from "../../features/sales/salesSlice";
import type { RootState } from "../../store";
import SaleForm from "../../components/sales/SaleForm";
import dayjs from "dayjs";
import SaleDetailModal from "../../components/sales/SaleDetailModal";
import { downloadInvoice, printInvoice } from "../../utils/pdfGenerator";
import { exportSalesToExcel, exportDetailedSalesToExcel } from "../../utils/excelExporter";
import { COMPANY_INFO } from "../../config/companyInfo";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const paymentMethodsForPayments = ["Efectivo", "Transferencia", "Tarjeta", "Otro"]; // Sin "Crédito" para abonos

const SaleList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector(
    (s: RootState) => s.sales
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Estado para modal de abono
  const [abonoModal, setAbonoModal] = useState<{
    open: boolean;
    sale: any | null;
  }>({ open: false, sale: null });
  const [abono, setAbono] = useState<number>(0);
  const [method, setMethod] = useState<string>("Efectivo");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!filters.dateFrom || !filters.dateTo) {
      const today = dayjs().format("YYYY-MM-DD");
      dispatch(fetchSales({ dateFrom: today, dateTo: today }));
      dispatch(setFilters({ dateFrom: today, dateTo: today }));
    }
  }, [dispatch]);

  const handleViewDetail = (sale: any) => {
    setSelectedSale(sale);
    setDetailModalOpen(true);
  };
  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedSale(null);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAfterSave = () => {
    dispatch(fetchSales());
    handleCloseModal();
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dateStrings[0] && dateStrings[1]) {
      // Convertir las fechas DD/MM/YYYY a formato ISO YYYY-MM-DD
      const fromDate = dayjs(dateStrings[0], "DD/MM/YYYY").format("YYYY-MM-DD");
      const toDate = dayjs(dateStrings[1], "DD/MM/YYYY").format("YYYY-MM-DD");
      
      dispatch(
        fetchSales({ dateFrom: fromDate, dateTo: toDate })
      );
      dispatch(
        setFilters({ dateFrom: dateStrings[0], dateTo: dateStrings[1] })
      );
    }
  };

  // Verificación defensiva para evitar errores si items no es un array
  const safeItems = Array.isArray(items) ? items : [];
  
  const totalVentas = safeItems.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  const totalPagado = safeItems.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
  const totalPendiente = totalVentas - totalPagado;

  // Función para imprimir
  const handlePrint = async (sale: any) => {
    try {
      await printInvoice(sale, COMPANY_INFO);
      message.success('Abriendo vista previa de impresión...');
    } catch (error) {
      message.error('Error al generar la factura para impresión');
      console.error('Error:', error);
    }
  };

  // Función para descargar PDF
  const handleDownloadPDF = async (sale: any) => {
    try {
      await downloadInvoice(sale, COMPANY_INFO);
      message.success('Factura descargada correctamente');
    } catch (error) {
      message.error('Error al generar la factura PDF');
      console.error('Error:', error);
    }
  };

  // Función para exportar
  const handleExport = async () => {
    try {
      const success = await exportSalesToExcel(items);
      if (success) {
        message.success('Ventas exportadas a Excel correctamente');
      } else {
        message.error('Error al exportar las ventas');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
      message.error('Error al exportar las ventas');
    }
  };

  // Función para exportar reporte detallado
  const handleDetailedExport = async () => {
    try {
      const success = await exportDetailedSalesToExcel(items);
      if (success) {
        message.success('Reporte detallado exportado correctamente');
      } else {
        message.error('Error al exportar el reporte detallado');
      }
    } catch (error) {
      console.error('Error al exportar reporte detallado:', error);
      message.error('Error al exportar el reporte detallado');
    }
  };

  const handleDelete = async (_id: number) => {
    try {
      // await dispatch(deleteSale(id)).unwrap();
      message.success("Venta eliminada");
      dispatch(fetchSales());
    } catch (err: any) {
      message.error(err.message || "Error al eliminar venta");
    }
  };

  // ----- NUEVO: Función de abono -----
  const handleAbonar = async () => {
    if (!abonoModal.sale || abono <= 0) {
      message.warning("Ingresa un valor válido mayor a cero");
      return;
    }

    // Validar que no exceda el saldo pendiente
    const maxAmount = (abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0);
    if (abono > maxAmount) {
      message.error(`El monto ($${abono.toLocaleString()}) no puede ser mayor al saldo pendiente ($${maxAmount.toLocaleString()})`);
      setAbono(maxAmount); // Corregir automáticamente
      return;
    }

    // Validar que se haya seleccionado un método de pago
    if (!method) {
      message.warning("Selecciona un método de pago");
      return;
    }

    // Validar que el método no sea "Crédito"
    if (method === "Crédito") {
      message.error("No se puede registrar un abono con método 'Crédito'");
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
      message.success(`Abono de $${abono.toLocaleString()} registrado correctamente`);
      setAbono(0);
      setNote("");
      setMethod("Efectivo");
      setAbonoModal({ open: false, sale: null });
      dispatch(fetchSales(filters)); // Refresca ventas según filtros actuales
    } catch (err: any) {
      message.error(err.message || "Error al registrar abono");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Cliente",
      dataIndex: "customerName",
      key: "customerName",
      ellipsis: true,
      render: (v: string | null) => v || <Tag color="default">Ocasional</Tag>,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 120,
      render: (v: number) => <Text strong>${v.toLocaleString()}</Text>,
    },
    {
      title: "Pagado",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 120,
      render: (v: number) => <Text type="success">${v.toLocaleString()}</Text>,
    },
    {
      title: "Pendiente",
      key: "pendiente",
      width: 120,
      render: (_: any, record: any) => {
        const pendiente = (record.totalAmount || 0) - (record.paidAmount || 0);
        return pendiente > 0 ? (
          <Text type="danger">${pendiente.toLocaleString()}</Text>
        ) : (
          <Text type="success">$0</Text>
        );
      },
    },
    {
      title: "Estado",
      dataIndex: "isPaid",
      key: "isPaid",
      width: 100,
      render: (isPaid: boolean, record: any) => {
        const pendiente = (record.totalAmount || 0) - (record.paidAmount || 0);
        if (isPaid || pendiente === 0) {
          return <Badge status="success" text="Pagado" />;
        }
        return <Badge status="warning" text="Pendiente" />;
      },
    },
    {
      title: "Método",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 120,
      render: (v: string) => {
        const colors: { [key: string]: string } = {
          Efectivo: "green",
          Tarjeta: "blue",
          Transferencia: "purple",
          Crédito: "orange",
          Otro: "default",
        };
        return <Tag color={colors[v] || "default"}>{v || "N/A"}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "actions",
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: any) => {
        const pendiente = (record.totalAmount || 0) - (record.paidAmount || 0);
        return (
          <Space size="small">
            <Tooltip title="Ver detalle">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            
            {pendiente > 0 && (
              <Tooltip title="Registrar abono">
                <Button
                  type="text"
                  size="small"
                  icon={<DollarOutlined />}
                  onClick={() => setAbonoModal({ open: true, sale: record })}
                />
              </Tooltip>
            )}
            
            <Tooltip title="Imprimir factura">
              <Button
                type="text"
                size="small"
                icon={<PrinterOutlined />}
                onClick={() => handlePrint(record)}
              />
            </Tooltip>
            
            <Tooltip title="Descargar PDF">
              <Button
                type="text"
                size="small"
                icon={<ExportOutlined />}
                onClick={() => handleDownloadPDF(record)}
              />
            </Tooltip>
            
            <Popconfirm
              title="¿Eliminar venta?"
              description="Esta acción no se puede deshacer"
              onConfirm={() => handleDelete(record.id)}
              okText="Sí"
              cancelText="No"
            >
              <Tooltip title="Eliminar">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            📊 Administración de Ventas
          </Title>
          <Text type="secondary">
            Gestión completa de ventas, pagos y reportes
          </Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => dispatch(fetchSales(filters))}
            >
              Actualizar
            </Button>
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'excel-summary',
                    label: 'Exportar Resumen',
                    icon: <FileExcelOutlined />,
                    onClick: handleExport,
                  },
                  {
                    key: 'excel-detailed',
                    label: 'Exportar Detallado',
                    icon: <BarChartOutlined />,
                    onClick: handleDetailedExport,
                  },
                ],
              }}
              placement="bottomRight"
            >
              <Button icon={<ExportOutlined />}>
                Exportar <DownOutlined />
              </Button>
            </Dropdown>
            <Button 
              type="primary" 
              icon={<CreditCardOutlined />} 
              onClick={handleOpenModal}
            >
              Nueva Venta
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Panel de estadísticas */}
      <Row gutter={16} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Ventas"
              value={totalVentas}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pagado"
              value={totalPagado}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pendiente"
              value={totalPendiente}
              precision={0}
              prefix="$"
              valueStyle={{ color: totalPendiente > 0 ? '#f5222d' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Número de Ventas"
              value={safeItems.length}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Row gutter={16} align="middle">
          <Col>
            <Text strong>Filtros:</Text>
          </Col>
          <Col>
            <RangePicker
              allowClear={false}
              value={[
                filters.dateFrom ? dayjs(filters.dateFrom) : undefined,
                filters.dateTo ? dayjs(filters.dateTo) : undefined,
              ]}
              onChange={handleDateChange}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col>
            <Space>
              <Badge count={safeItems.filter(s => !s.isPaid).length} color="orange">
                <Button>Pendientes</Button>
              </Badge>
              <Badge count={safeItems.filter(s => s.isPaid).length} color="green">
                <Button>Pagadas</Button>
              </Badge>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de ventas */}
      <Card className="shadow-sm">
        <Table
          dataSource={safeItems}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          size="middle"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} de ${total} ventas`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>

      {/* Modal de nueva venta */}
      <SaleForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSaved={handleAfterSave}
      />

      {/* Modal de detalle */}
      <SaleDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        sale={selectedSale}
      />

      {/* Modal de abono mejorado */}
      <Modal
        open={abonoModal.open}
        title={
          <Space>
            <DollarOutlined />
            <span>Registrar Abono - Venta #{abonoModal.sale?.id}</span>
          </Space>
        }
        onCancel={() => setAbonoModal({ open: false, sale: null })}
        onOk={handleAbonar}
        okText="Registrar Abono"
        cancelText="Cancelar"
        destroyOnClose
        width={500}
        okButtonProps={{
          disabled: !abonoModal.sale || 
                   abono <= 0 || 
                   !method || 
                   method === "Crédito" ||
                   abono > ((abonoModal.sale?.totalAmount || 0) - (abonoModal.sale?.paidAmount || 0))
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Text strong>Cliente:</Text>
              <br />
              <Text>{abonoModal.sale?.customerName || "Cliente ocasional"}</Text>
            </Col>
            <Col span={12}>
              <Text strong>Fecha de venta:</Text>
              <br />
              <Text>{abonoModal.sale ? dayjs(abonoModal.sale.date).format("DD/MM/YYYY") : ""}</Text>
            </Col>
          </Row>
        </div>

        <Divider />

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Text strong>Total venta:</Text>
            <br />
            <Text type="secondary">
              ${abonoModal.sale?.totalAmount?.toLocaleString() || "0"}
            </Text>
          </Col>
          <Col span={8}>
            <Text strong>Ya pagado:</Text>
            <br />
            <Text type="success">
              ${abonoModal.sale?.paidAmount?.toLocaleString() || "0"}
            </Text>
          </Col>
          <Col span={8}>
            <Text strong>Pendiente:</Text>
            <br />
            <Text type="danger" style={{ fontSize: '16px', fontWeight: 'bold' }}>
              ${abonoModal.sale
                ? ((abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)).toLocaleString()
                : "0"}
            </Text>
          </Col>
        </Row>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Monto del abono:</Text>
          {abonoModal.sale && (
            <Text type="secondary" style={{ display: 'block', fontSize: '12px', marginBottom: 4 }}>
              Máximo permitido: ${((abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)).toLocaleString()}
            </Text>
          )}
          <InputNumber
            min={1}
            max={
              abonoModal.sale
                ? (abonoModal.sale.totalAmount || 1) - (abonoModal.sale.paidAmount || 0)
                : 1
            }
            value={abono}
            onChange={(val) => {
              const maxAmount = abonoModal.sale 
                ? (abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)
                : 0;
              
              // Validar el valor ingresado
              const numericValue = Number(val) || 0;
              
              if (numericValue > maxAmount) {
                message.warning(`El monto no puede ser mayor al saldo pendiente: $${maxAmount.toLocaleString()}`);
                setAbono(maxAmount);
              } else if (numericValue < 1 && numericValue > 0) {
                setAbono(1); // Mínimo 1
              } else {
                setAbono(numericValue);
              }
            }}
            onBlur={() => {
              // Validación adicional al perder el foco
              const maxAmount = abonoModal.sale 
                ? (abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)
                : 0;
              
              if (abono > maxAmount) {
                setAbono(maxAmount);
                message.warning(`Monto ajustado al máximo permitido: $${maxAmount.toLocaleString()}`);
              }
            }}
            placeholder="Valor del abono"
            style={{ width: "100%", marginTop: 4 }}
            formatter={(value) => {
              if (!value) return '';
              return `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
            }}
            parser={(value) => {
              if (!value) return 0;
              // Remover todos los caracteres que no sean dígitos
              const cleanValue = value.replace(/[^0-9]/g, '');
              return cleanValue ? parseInt(cleanValue, 10) : 0;
            }}
            status={abono > 0 && abonoModal.sale && abono > ((abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)) ? 'error' : ''}
            precision={0}
            step={1000}
          />
          {abono > 0 && abonoModal.sale && abono > ((abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0)) && (
            <Text type="danger" style={{ fontSize: '12px', marginTop: 4, display: 'block' }}>
              ⚠️ El monto excede el saldo pendiente
            </Text>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <Text strong>Método de pago:</Text>
          <Select 
            value={method} 
            onChange={setMethod} 
            style={{ width: "100%", marginTop: 4 }}
            placeholder="Seleccione método"
          >
            {paymentMethodsForPayments.map((m) => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <Text strong>Observaciones:</Text>
          <Input.TextArea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observaciones opcionales..."
            rows={3}
            style={{ marginTop: 4 }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default SaleList;
