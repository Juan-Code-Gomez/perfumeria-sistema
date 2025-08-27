import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Space,
  Tag,
  message,
  Modal,
  Divider,
  InputNumber,
  Select,
  Input,
} from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrendingUpOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  PlusOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchSales,
  addSalePayment,
  setSalesFilters,
} from '../../features/sales/salesSlice';
import SaleDetailModal from '../../components/sales/SaleDetailModal';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { downloadInvoice, printInvoice } from '../../utils/pdfGenerator';
import { COMPANY_INFO } from '../../config/companyInfo';
import POSTicketModal from '../../components/sales/POSTicketModal';

dayjs.locale('es');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// Métodos de pago disponibles para abonos (sin Crédito)
const paymentMethodsForPayments = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

const SaleList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector(
    (state) => state.sales
  );

  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [posTicketModal, setPosTicketModal] = useState<{
    open: boolean;
    sale: any;
  }>({ open: false, sale: null });

  const [abonoModal, setAbonoModal] = useState<{
    open: boolean;
    sale: any;
  }>({ open: false, sale: null });

  const [abono, setAbono] = useState<number>(0);
  const [method, setMethod] = useState<string>("Efectivo");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    if (!filters.dateFrom || !filters.dateTo) {
      const today = dayjs();
      dispatch(setSalesFilters({
        dateFrom: today.startOf('month').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD')
      }));
    }
  }, [dispatch, filters]);

  const handleViewDetail = (sale: any) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedSale(null);
    setIsDetailModalOpen(false);
  };

  const handleAfterSave = () => {
    dispatch(fetchSales(filters));
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dateStrings[0] && dateStrings[1]) {
      dispatch(
        setSalesFilters({
          dateFrom: dateStrings[0],
          dateTo: dateStrings[1],
        })
      );
      dispatch(
        fetchSales({
          dateFrom: dateStrings[0],
          dateTo: dateStrings[1],
        })
      );
    }
  };

  const handlePrint = async (sale: any) => {
    try {
      await printInvoice(sale, COMPANY_INFO);
      message.success('Factura enviada a impresión');
    } catch (error) {
      console.error('Error al imprimir:', error);
      message.error('Error al imprimir factura');
    }
  };

  const handlePrintPOSTicket = (sale: any) => {
    setPosTicketModal({ open: true, sale });
  };

  const handleDownloadPDF = async (sale: any) => {
    try {
      await downloadInvoice(sale, COMPANY_INFO);
      message.success('Factura descargada correctamente');
    } catch (error) {
      console.error('Error al descargar:', error);
      message.error('Error al descargar factura');
    }
  };

  const handleOpenAbonoModal = (sale: any) => {
    const maxAmount = (sale.totalAmount || 0) - (sale.paidAmount || 0);
    if (maxAmount <= 0) {
      message.info('Esta venta ya está completamente pagada');
      return;
    }
    setAbonoModal({ open: true, sale });
    setAbono(0);
    setNote("");
    setMethod("Efectivo");
  };

  const handleAbonar = async () => {
    if (!abonoModal.sale || abono <= 0) {
      message.warning("Ingresa un valor válido mayor a cero");
      return;
    }

    const maxAmount = (abonoModal.sale.totalAmount || 0) - (abonoModal.sale.paidAmount || 0);
    if (abono > maxAmount) {
      message.error(`El monto ($${abono.toLocaleString()}) no puede ser mayor al saldo pendiente ($${maxAmount.toLocaleString()})`);
      setAbono(maxAmount);
      return;
    }

    if (!method) {
      message.warning("Selecciona un método de pago");
      return;
    }

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
      dispatch(fetchSales(filters));
    } catch (err: any) {
      message.error(err.message || "Error al registrar abono");
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text: any) => (
        <Text code style={{ fontSize: '12px' }}>
          #{text}
        </Text>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (text: any) => (
        <Text style={{ fontSize: '13px' }}>
          {dayjs(text).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200,
      render: (text: any) => (
        <Text style={{ fontSize: '13px', fontWeight: 500 }}>
          {text || 'Cliente ocasional'}
        </Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right' as const,
      render: (text: any) => (
        <Text strong style={{ fontSize: '14px', color: '#1890ff' }}>
          ${text?.toLocaleString() || '0'}
        </Text>
      ),
    },
    {
      title: 'Método de Pago',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 140,
      render: (text: any) => {
        const colors: Record<string, string> = {
          Efectivo: "green",
          "Tarjeta": "blue",
          Transferencia: "purple",
          Crédito: "orange",
          Otro: "default",
        };
        return <Tag color={colors[text] || "default"}>{text}</Tag>;
      },
    },
    {
      title: 'Estado',
      key: 'status',
      width: 120,
      render: (record: any) => {
        const pendiente = (record.totalAmount || 0) - (record.paidAmount || 0);
        const isCredit = record.paymentMethod === 'Crédito' || pendiente > 0;
        
        if (record.isPaid || pendiente <= 0) {
          return <Tag color="success">Pagado</Tag>;
        } else if (isCredit && (record.paidAmount || 0) > 0) {
          return (
            <div>
              <Tag color="warning">Abonado</Tag>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                Saldo: ${pendiente.toLocaleString()}
              </Text>
            </div>
          );
        } else {
          return <Tag color="error">Pendiente</Tag>;
        }
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: any) => {
        const pendiente = (record.totalAmount || 0) - (record.paidAmount || 0);
        const isCredit = record.paymentMethod === 'Crédito' || pendiente > 0;
        
        return (
          <Space size={4}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size="small"
              style={{ padding: '4px 8px' }}
            />
            
            {/* Lógica de botones: Factura para créditos, Ticket para ventas pagadas */}
            {isCredit ? (
              <Button
                type="link"
                icon={<FileTextOutlined />}
                onClick={() => handlePrint(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#1890ff' }}
                title="Imprimir Factura"
              />
            ) : (
              <Button
                type="link"
                icon={<PrinterOutlined />}
                onClick={() => handlePrintPOSTicket(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#52c41a' }}
                title="Imprimir Ticket POS"
              />
            )}
            
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadPDF(record)}
              size="small"
              style={{ padding: '4px 8px', color: '#722ed1' }}
              title="Descargar PDF"
            />
            
            {pendiente > 0 && (
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => handleOpenAbonoModal(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#fa8c16' }}
                title="Registrar Abono"
              />
            )}
          </Space>
        );
      },
    },
  ];

  const totalVentas = items.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalPagado = items.reduce((sum, sale) => sum + (sale.paidAmount || sale.totalAmount || 0), 0);
  const totalPendiente = totalVentas - totalPagado;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <div style={{ padding: '0 16px' }}>
        {/* Header mejorado con diseño gradient */}
        <div className="mb-8">
          <Row justify="space-between" align="middle" className="mb-6">
            <Col xs={24} lg={12}>
              <div>
                <Title 
                  level={1} 
                  className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ fontWeight: 700, fontSize: '2.5rem', margin: 0 }}
                >
                  💼 Administración de Ventas
                </Title>
                <Text className="text-lg text-gray-600">
                  Gestiona y supervisa todas las ventas del sistema
                </Text>
              </div>
            </Col>
            <Col xs={24} lg={12} style={{ textAlign: 'right' }}>
              <Space size="middle">
                <RangePicker
                  value={[
                    filters.dateFrom ? dayjs(filters.dateFrom) : null,
                    filters.dateTo ? dayjs(filters.dateTo) : null,
                  ]}
                  onChange={handleDateChange}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '2px solid #e6f7ff'
                  }}
                />
                <Link to="/sales/new">
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      height: '48px',
                      fontWeight: 600,
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                    }}
                  >
                    Nueva Venta
                  </Button>
                </Link>
              </Space>
            </Col>
          </Row>

          {/* Tarjetas de estadísticas con diseño gradient mejorado */}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 15px 35px rgba(102, 126, 234, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 500 }}>Total Ventas</span>}
                  value={items.length}
                  prefix={<ShoppingCartOutlined style={{ color: 'white', fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 15px 35px rgba(240, 147, 251, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 500 }}>Ingresos Totales</span>}
                  value={totalVentas}
                  prefix={<DollarOutlined style={{ color: 'white', fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 15px 35px rgba(79, 172, 254, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 500 }}>Pagado</span>}
                  value={totalPagado}
                  prefix={<TrendingUpOutlined style={{ color: 'white', fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  border: 'none',
                  borderRadius: '20px',
                  boxShadow: '0 15px 35px rgba(250, 112, 154, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: 500 }}>Por Cobrar</span>}
                  value={totalPendiente}
                  prefix={<CalendarOutlined style={{ color: 'white', fontSize: '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Tabla con diseño mejorado */}
        <Card
          style={{
            borderRadius: '20px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            border: 'none',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
          }}
          bodyStyle={{ padding: '32px' }}
        >
          <Table
            columns={columns}
            dataSource={items}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Total ${total} ventas`,
              style: { marginTop: '24px' },
            }}
            scroll={{ x: 1000 }}
            style={{
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          />
        </Card>

        {/* Modal de detalles */}
        <SaleDetailModal
          sale={selectedSale}
          open={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          onAfterSave={handleAfterSave}
        />

        {/* Modal de ticket POS */}
        <POSTicketModal
          open={posTicketModal.open}
          onClose={() => setPosTicketModal({ open: false, sale: null })}
          sale={posTicketModal.sale}
        />

        {/* Modal de abono mejorado */}
        <Modal
          open={abonoModal.open}
          title={
            <Space>
              <DollarOutlined style={{ color: '#52c41a' }} />
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
                     abono > ((abonoModal.sale?.totalAmount || 0) - (abonoModal.sale?.paidAmount || 0)),
            style: {
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              border: 'none',
              borderRadius: '8px'
            }
          }}
          style={{
            borderRadius: '16px'
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

          <div style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Total venta:</Text>
                <br />
                <Text style={{ fontSize: '16px', color: '#1890ff' }}>
                  ${abonoModal.sale?.totalAmount?.toLocaleString() || "0"}
                </Text>
              </Col>
              <Col span={8}>
                <Text strong>Pagado:</Text>
                <br />
                <Text style={{ fontSize: '16px', color: '#52c41a' }}>
                  ${(abonoModal.sale?.paidAmount || 0).toLocaleString()}
                </Text>
              </Col>
              <Col span={8}>
                <Text strong>Saldo:</Text>
                <br />
                <Text style={{ fontSize: '16px', color: '#fa541c', fontWeight: 'bold' }}>
                  ${((abonoModal.sale?.totalAmount || 0) - (abonoModal.sale?.paidAmount || 0)).toLocaleString()}
                </Text>
              </Col>
            </Row>
          </div>

          <Divider />

          <div style={{ marginBottom: 16 }}>
            <Text strong>Monto del abono:</Text>
            <InputNumber
              value={abono}
              onChange={(value) => setAbono(value || 0)}
              style={{ width: "100%", marginTop: 4, borderRadius: '8px' }}
              placeholder="Ingrese el monto"
              min={0}
              max={(abonoModal.sale?.totalAmount || 0) - (abonoModal.sale?.paidAmount || 0)}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => Number(value?.replace(/\$\s?|(,*)/g, '') || 0)}
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
              style={{ width: "100%", marginTop: 4, borderRadius: '8px' }}
              placeholder="Seleccione método"
            >
              {paymentMethodsForPayments.map((m) => (
                <Select.Option key={m} value={m}>
                  {m}
                </Select.Option>
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
              style={{ marginTop: 4, borderRadius: '8px' }}
            />
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default SaleList;
