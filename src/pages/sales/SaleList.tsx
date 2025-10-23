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
  Radio,
} from 'antd';
import {
  CalendarOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  RiseOutlined,
  EyeOutlined,
  FileTextOutlined,
  PrinterOutlined,
  PlusOutlined,
  DownloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  fetchSales,
  addSalePayment,
  setFilters,
  deleteSale,
} from '../../features/sales/salesSlice';
import SaleDetailModal from '../../components/sales/SaleDetailModal';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { items, loading, filters } = useAppSelector(
    (state: any) => state.sales
  );
  const { user } = useAppSelector((state: any) => state.auth);

  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, paid, pending, partial
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

  // Cargar ventas al montar el componente y cuando cambien los filtros
  useEffect(() => {
    if (!filters.dateFrom || !filters.dateTo) {
      const today = dayjs();
      const dateFilters = {
        dateFrom: today.startOf('month').format('YYYY-MM-DD'),
        dateTo: today.format('YYYY-MM-DD')
      };
      dispatch(setFilters(dateFilters));
      dispatch(fetchSales(dateFilters));
    } else {
      dispatch(fetchSales(filters));
    }
  }, [dispatch, filters.dateFrom, filters.dateTo]);

  // Función para ir al POS
  const handleGoToPOS = () => {
    navigate('/pos');
  };

  // Función para filtrar ventas según el estado
  const getFilteredSales = () => {
    if (!items) return [];
    
    switch (statusFilter) {
      case 'paid':
        return items.filter((sale: any) => {
          const pendiente = (sale.totalAmount || 0) - (sale.paidAmount || 0);
          return sale.isPaid || pendiente <= 0;
        });
      case 'pending':
        return items.filter((sale: any) => {
          const pendiente = (sale.totalAmount || 0) - (sale.paidAmount || 0);
          return !sale.isPaid && pendiente > 0 && (sale.paidAmount || 0) === 0;
        });
      case 'partial':
        return items.filter((sale: any) => {
          const pendiente = (sale.totalAmount || 0) - (sale.paidAmount || 0);
          return !sale.isPaid && pendiente > 0 && (sale.paidAmount || 0) > 0;
        });
      default:
        return items;
    }
  };

  const handleViewDetail = (sale: any) => {
    setSelectedSale(sale);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedSale(null);
    setIsDetailModalOpen(false);
  };

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dateStrings[0] && dateStrings[1]) {
      dispatch(
        setFilters({
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

  const handleSaldarTodasDeudasPequenas = async () => {
    const ventasConDeudasPequenas = filteredSales.filter((sale: any) => {
      const totalAmount = Math.round((sale.totalAmount || 0) * 100) / 100;
      const paidAmount = Math.round((sale.paidAmount || 0) * 100) / 100;
      const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
      return pendiente > 0 && pendiente <= 1 && !sale.isPaid;
    });

    if (ventasConDeudasPequenas.length === 0) {
      message.info('No hay deudas pequeñas (menores a $1) para saldar');
      return;
    }

    try {
      for (const sale of ventasConDeudasPequenas) {
        const totalAmount = Math.round((sale.totalAmount || 0) * 100) / 100;
        const paidAmount = Math.round((sale.paidAmount || 0) * 100) / 100;
        const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
        
        await dispatch(
          addSalePayment({
            saleId: sale.id,
            amount: pendiente,
            date: dayjs().format("YYYY-MM-DD"),
            method: "Ajuste",
            note: `Saldo de centavos: $${pendiente} - Ajuste automático masivo`,
          })
        ).unwrap();
      }
      
      message.success(`${ventasConDeudasPequenas.length} deudas pequeñas saldadas automáticamente`);
      dispatch(fetchSales(filters));
    } catch (err: any) {
      message.error(err.message || "Error al saldar deudas");
    }
  };

  const handleSaldarDeudaPequena = async (sale: any) => {
    const totalAmount = Math.round((sale.totalAmount || 0) * 100) / 100;
    const paidAmount = Math.round((sale.paidAmount || 0) * 100) / 100;
    const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
    
    if (pendiente <= 0) {
      message.info('Esta venta ya está pagada');
      return;
    }
    
    if (pendiente > 1) {
      message.warning('Solo se pueden saldar automáticamente deudas menores a $1');
      return;
    }

    try {
      await dispatch(
        addSalePayment({
          saleId: sale.id,
          amount: pendiente,
          date: dayjs().format("YYYY-MM-DD"),
          method: "Ajuste",
          note: `Saldo de centavos: $${pendiente} - Ajuste automático`,
        })
      ).unwrap();
      
      message.success(`Deuda de $${pendiente.toLocaleString()} saldada automáticamente`);
      dispatch(fetchSales(filters));
    } catch (err: any) {
      message.error(err.message || "Error al saldar deuda");
    }
  };

  const handleOpenAbonoModal = (sale: any) => {
    // Usar Math.round para evitar problemas de decimales
    const totalAmount = Math.round((sale.totalAmount || 0) * 100) / 100;
    const paidAmount = Math.round((sale.paidAmount || 0) * 100) / 100;
    const maxAmount = Math.round((totalAmount - paidAmount) * 100) / 100;
    
    // Considerar como pagado si la diferencia es menor a 1 peso
    if (maxAmount <= 1) {
      message.info('Esta venta está completamente pagada');
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

    // Usar Math.round para manejar decimales correctamente
    const totalAmount = Math.round((abonoModal.sale.totalAmount || 0) * 100) / 100;
    const paidAmount = Math.round((abonoModal.sale.paidAmount || 0) * 100) / 100;
    const maxAmount = Math.round((totalAmount - paidAmount) * 100) / 100;
    const abonoRounded = Math.round(abono * 100) / 100;

    if (abonoRounded > maxAmount) {
      message.error(`El monto ($${abonoRounded.toLocaleString()}) no puede ser mayor al saldo pendiente ($${maxAmount.toLocaleString()})`);
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
          amount: abonoRounded,
          date: dayjs().format("YYYY-MM-DD"),
          method,
          note,
        })
      ).unwrap();
      
      // Verificar si la venta queda completamente pagada (tolerancia de 1 peso)
      const newPaidAmount = paidAmount + abonoRounded;
      const remainingBalance = Math.round((totalAmount - newPaidAmount) * 100) / 100;
      const isFullyPaid = remainingBalance <= 1;
      
      if (isFullyPaid) {
        message.success(`¡Venta completamente pagada! Abono final de $${abonoRounded.toLocaleString()}`);
      } else {
        message.success(`Abono de $${abonoRounded.toLocaleString()} registrado correctamente`);
      }
      
      setAbono(0);
      setNote("");
      setMethod("Efectivo");
      setAbonoModal({ open: false, sale: null });
      dispatch(fetchSales(filters));
    } catch (err: any) {
      message.error(err.message || "Error al registrar abono");
    }
  };

  // Función para eliminar una venta (solo ADMIN y SUPER_ADMIN)
  const handleDeleteSale = (sale: any) => {
    Modal.confirm({
      title: '¿Estás seguro de eliminar esta venta?',
      content: (
        <div>
          <p><strong>Venta #</strong>{sale.id}</p>
          <p><strong>Cliente:</strong> {sale.customerName || 'Cliente ocasional'}</p>
          <p><strong>Total:</strong> ${sale.totalAmount?.toLocaleString()}</p>
          <p style={{ color: '#52c41a', marginTop: 12 }}>
            ✅ El inventario será restaurado automáticamente
          </p>
        </div>
      ),
      icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await dispatch(deleteSale(sale.id)).unwrap();
          message.success(`Venta #${sale.id} eliminada y stock restaurado`);
          dispatch(fetchSales(filters));
        } catch (err: any) {
          message.error(err.message || 'Error al eliminar venta');
        }
      },
    });
  };

  // Verificar si el usuario es ADMIN o SUPER_ADMIN
  const isAdminOrSuperAdmin = () => {
    if (!user?.roles) return false;
    const userRoles = user.roles.map((ur: any) => ur.role.name);
    return userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
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
        // Usar Math.round para evitar problemas de decimales
        const totalAmount = Math.round((record.totalAmount || 0) * 100) / 100;
        const paidAmount = Math.round((record.paidAmount || 0) * 100) / 100;
        const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
        
        // Si está pagado completamente (incluyendo tolerancia para decimales menores a 1)
        if (record.isPaid || pendiente <= 1) {
          return <Tag color="success">Pagado</Tag>;
        } 
        // Si tiene abonos pero no está completamente pagado
        else if (paidAmount > 0 && pendiente > 1) {
          return (
            <div>
              <Tag color="warning">Abonado</Tag>
              <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                Saldo: ${pendiente.toLocaleString()}
              </Text>
            </div>
          );
        } 
        // Si no tiene abonos
        else {
          return <Tag color="error">Pendiente</Tag>;
        }
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (record: any) => {
        // Usar Math.round para evitar problemas de decimales
        const totalAmount = Math.round((record.totalAmount || 0) * 100) / 100;
        const paidAmount = Math.round((record.paidAmount || 0) * 100) / 100;
        const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
        const isCredit = record.paymentMethod === 'Crédito' || pendiente > 1;
        
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
            
            {/* Solo mostrar botón de abono si hay saldo pendiente mayor a 1 peso */}
            {pendiente > 1 && !record.isPaid && (
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => handleOpenAbonoModal(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#fa8c16' }}
                title="Registrar Abono"
              />
            )}
            
            {/* Botón para saldar deudas pequeñas (menores a 1 peso) */}
            {pendiente > 0 && pendiente <= 1 && !record.isPaid && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleSaldarDeudaPequena(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#52c41a' }}
                title={`Saldar $${pendiente.toLocaleString()} automáticamente`}
              />
            )}

            {/* Botón ELIMINAR - Solo visible para ADMIN y SUPER_ADMIN */}
            {isAdminOrSuperAdmin() && (
              <Button
                type="link"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteSale(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#ff4d4f' }}
                title="Eliminar venta y restaurar inventario"
                danger
              />
            )}
          </Space>
        );
      },
    },
  ];

  const totalVentas = Math.round(
    items.reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0) * 100
  ) / 100;
  
  const totalPagado = Math.round(
    items.reduce((sum: number, sale: any) => sum + (sale.paidAmount || sale.totalAmount || 0), 0) * 100
  ) / 100;
  
  const totalPendiente = Math.round((totalVentas - totalPagado) * 100) / 100;

  // Ventas filtradas para la tabla
  const filteredSales = getFilteredSales();

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
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="large"
                  onClick={handleGoToPOS}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px',
                    fontWeight: 600,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  Ir al POS
                </Button>
                
                <Button
                  icon={<CheckCircleOutlined />}
                  size="large"
                  onClick={handleSaldarTodasDeudasPequenas}
                  style={{
                    background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: '48px',
                    fontWeight: 600,
                    color: 'white',
                    boxShadow: '0 8px 25px rgba(82, 196, 26, 0.3)',
                  }}
                  title="Saldar todas las deudas menores a $1"
                >
                  Saldar Centavos
                </Button>
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
                  prefix={<RiseOutlined style={{ color: 'white', fontSize: '24px' }} />}
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

        {/* Filtros de estado */}
        <Card
          style={{
            borderRadius: '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: 'none',
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.9)',
          }}
          bodyStyle={{ padding: '20px' }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Space align="center">
                <FilterOutlined style={{ color: '#667eea', fontSize: '16px' }} />
                <Text strong style={{ color: '#667eea' }}>Filtrar por estado:</Text>
                <Radio.Group
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  buttonStyle="solid"
                  size="small"
                >
                  <Radio.Button value="all">Todas</Radio.Button>
                  <Radio.Button value="paid">Pagadas</Radio.Button>
                  <Radio.Button value="pending">Pendientes</Radio.Button>
                  <Radio.Button value="partial">Con Abonos</Radio.Button>
                </Radio.Group>
              </Space>
            </Col>
            <Col>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {getFilteredSales().length} de {items.length} ventas
              </Text>
            </Col>
          </Row>
        </Card>

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
            dataSource={filteredSales}
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


