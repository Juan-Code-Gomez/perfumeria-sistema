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
  Drawer,
  List,
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
  MoreOutlined,
  UserOutlined,
  CreditCardOutlined,
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
import SaleInvoiceModal from '../../components/sales/SaleInvoiceModal';
import { fetchCompanyConfig } from '../../features/company-config/companyConfigSlice';

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
  const { config: companyConfig } = useAppSelector((state: any) => state.companyConfig);

  // Responsive states
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);

  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all'); // all, paid, pending, partial
  const [posTicketModal, setPosTicketModal] = useState<{
    open: boolean;
    sale: any;
  }>({ open: false, sale: null });
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const [abonoModal, setAbonoModal] = useState<{
    open: boolean;
    sale: any;
  }>({ open: false, sale: null });

  const [abono, setAbono] = useState<number>(0);
  const [method, setMethod] = useState<string>("Efectivo");
  const [note, setNote] = useState<string>("");
  
  // Drawer para acciones en móvil
  const [actionDrawer, setActionDrawer] = useState<{
    open: boolean;
    sale: any;
  }>({ open: false, sale: null });

  // Responsive handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar ventas al montar el componente y cuando cambien los filtros
  useEffect(() => {
    // Cargar configuración de la compañía
    dispatch(fetchCompanyConfig());
    
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
    // En móvil y tablet, usar el modal en lugar de jsPDF
    if (isMobile || isTablet) {
      setSelectedSale(sale);
      setInvoiceModalOpen(true);
      message.info('Usa el botón "Imprimir" en el modal. Para guardar como PDF, elige "Guardar como PDF" en las opciones de impresión.');
      return;
    }
    // En desktop, usar la función antigua
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

  const handlePrintInvoice = (sale: any) => {
    console.log('handlePrintInvoice llamado con sale:', sale);
    console.log('companyConfig:', companyConfig);
    setSelectedSale(sale);
    setInvoiceModalOpen(true);
  };

  const handleDownloadPDF = async (sale: any) => {
    // En móvil y tablet, abrir el modal (desde ahí puede imprimir o guardar como PDF)
    if (isMobile || isTablet) {
      setSelectedSale(sale);
      setInvoiceModalOpen(true);
      message.info('Para descargar como PDF: presiona "Imprimir" y selecciona "Guardar como PDF" en las opciones.');
      return;
    }
    // En desktop, usar la función de descarga directa
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
      width: isMobile ? 60 : 80,
      render: (text: any) => (
        <Text code style={{ fontSize: isMobile ? '11px' : '12px' }}>
          #{text}
        </Text>
      ),
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: isMobile ? 90 : 120,
      render: (text: any) => (
        <Text style={{ fontSize: isMobile ? '11px' : '13px' }}>
          {isMobile ? dayjs(text).format('DD/MM') : dayjs(text).format('DD/MM/YYYY')}
        </Text>
      ),
    },
    ...(!isMobile ? [{
      title: 'Cliente',
      dataIndex: 'customerName',
      key: 'customerName',
      width: isTablet ? 150 : 200,
      ellipsis: true,
      render: (text: any) => (
        <Text style={{ fontSize: '13px', fontWeight: 500 }}>
          {text || 'Cliente ocasional'}
        </Text>
      ),
    }] : []),
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: isMobile ? 80 : 120,
      align: 'right' as const,
      render: (text: any) => (
        <Text strong style={{ fontSize: isMobile ? '12px' : '14px', color: '#1890ff' }}>
          ${text?.toLocaleString() || '0'}
        </Text>
      ),
    },
    ...(!isMobile && !isTablet ? [{
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
    }] : []),
    {
      title: 'Estado',
      key: 'status',
      width: isMobile ? 80 : 120,
      render: (record: any) => {
        // Usar Math.round para evitar problemas de decimales
        const totalAmount = Math.round((record.totalAmount || 0) * 100) / 100;
        const paidAmount = Math.round((record.paidAmount || 0) * 100) / 100;
        const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
        
        // Si está pagado completamente (incluyendo tolerancia para decimales menores a 1)
        if (record.isPaid || pendiente <= 1) {
          return <Tag color="success">{isMobile ? '✓' : 'Pagado'}</Tag>;
        } 
        // Si tiene abonos pero no está completamente pagado
        else if (paidAmount > 0 && pendiente > 1) {
          return (
            <div>
              <Tag color="warning">{isMobile ? '◐' : 'Abonado'}</Tag>
              {!isMobile && (
                <Text type="secondary" style={{ fontSize: '11px', display: 'block' }}>
                  Saldo: ${pendiente.toLocaleString()}
                </Text>
              )}
            </div>
          );
        } 
        // Si no tiene abonos
        else {
          return <Tag color="error">{isMobile ? '✗' : 'Pendiente'}</Tag>;
        }
      },
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: isMobile ? 90 : isTablet ? 150 : 200,
      fixed: isMobile ? ('right' as const) : undefined,
      render: (record: any) => {
        // Usar Math.round para evitar problemas de decimales
        const totalAmount = Math.round((record.totalAmount || 0) * 100) / 100;
        const paidAmount = Math.round((record.paidAmount || 0) * 100) / 100;
        const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
        const isCredit = record.paymentMethod === 'Crédito' || pendiente > 1;
        
        return (
          <Space size={isMobile ? 2 : 4} direction={isMobile ? "vertical" : "horizontal"}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
              size={isMobile ? "middle" : "small"}
              style={{ padding: isMobile ? '4px' : '4px 8px' }}
            />
            
            {!isMobile && (
              <>
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
                  icon={<FileTextOutlined />}
                  onClick={() => handlePrintInvoice(record)}
                  size="small"
                  style={{ padding: '4px 8px', color: '#722ed1' }}
                  title="Factura Tamaño Carta"
                />
                
                <Button
                  type="link"
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadPDF(record)}
                  size="small"
                  style={{ padding: '4px 8px', color: '#fa8c16' }}
                  title="Descargar PDF"
                />
              </>
            )}
            
            {/* Solo mostrar botón de abono si hay saldo pendiente mayor a 1 peso */}
            {pendiente > 1 && !record.isPaid && (
              <Button
                type="link"
                icon={<DollarOutlined />}
                onClick={() => handleOpenAbonoModal(record)}
                size={isMobile ? "middle" : "small"}
                style={{ padding: isMobile ? '4px' : '4px 8px', color: '#fa8c16' }}
                title="Registrar Abono"
              />
            )}
            
            {/* Botón para saldar deudas pequeñas (menores a 1 peso) */}
            {!isMobile && pendiente > 0 && pendiente <= 1 && !record.isPaid && (
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                onClick={() => handleSaldarDeudaPequena(record)}
                size="small"
                style={{ padding: '4px 8px', color: '#52c41a' }}
                title={`Saldar $${pendiente.toLocaleString()} automáticamente`}
              />
            )}

            {/* Botón ELIMINAR - Solo visible para ADMIN y SUPER_ADMIN y no en mobile */}
            {!isMobile && isAdminOrSuperAdmin() && (
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
      <div style={{ padding: isMobile ? '0 8px' : '0 16px' }}>
        {/* Header mejorado con diseño gradient */}
        <div className="mb-8">
          <Row justify="space-between" align="middle" className="mb-6" gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <div>
                <Title 
                  level={1} 
                  className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                  style={{ 
                    fontWeight: 700, 
                    fontSize: isMobile ? '1.75rem' : '2.5rem', 
                    margin: 0 
                  }}
                >
                  💼 {isMobile ? 'Ventas' : 'Administración de Ventas'}
                </Title>
                {!isMobile && (
                  <Text className="text-lg text-gray-600">
                    Gestiona y supervisa todas las ventas del sistema
                  </Text>
                )}
              </div>
            </Col>
            <Col xs={24} lg={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <Space size={isMobile ? "small" : "middle"} wrap style={{ width: '100%', justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
                <RangePicker
                  value={[
                    filters.dateFrom ? dayjs(filters.dateFrom) : null,
                    filters.dateTo ? dayjs(filters.dateTo) : null,
                  ]}
                  onChange={handleDateChange}
                  size={isMobile ? "middle" : "large"}
                  style={{ 
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '2px solid #e6f7ff'
                  }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size={isMobile ? "middle" : "large"}
                  onClick={handleGoToPOS}
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    height: isMobile ? '40px' : '48px',
                    fontWeight: 600,
                    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                  }}
                >
                  {isMobile ? 'POS' : 'Ir al POS'}
                </Button>
                
                {!isMobile && (
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
                )}
              </Space>
            </Col>
          </Row>

          {/* Tarjetas de estadísticas con diseño gradient mejorado */}
          <Row gutter={isMobile ? [12, 12] : [24, 24]} className="mb-8">
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: isMobile ? '16px' : '20px',
                  boxShadow: '0 15px 35px rgba(102, 126, 234, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: isMobile ? '20px' : '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>Total Ventas</span>}
                  value={items.length}
                  prefix={<ShoppingCartOutlined style={{ color: 'white', fontSize: isMobile ? '20px' : '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                  borderRadius: isMobile ? '16px' : '20px',
                  boxShadow: '0 15px 35px rgba(240, 147, 251, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: isMobile ? '20px' : '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>Ingresos Totales</span>}
                  value={totalVentas}
                  prefix={<DollarOutlined style={{ color: 'white', fontSize: isMobile ? '20px' : '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                  borderRadius: isMobile ? '16px' : '20px',
                  boxShadow: '0 15px 35px rgba(79, 172, 254, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: isMobile ? '20px' : '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>Pagado</span>}
                  value={totalPagado}
                  prefix={<RiseOutlined style={{ color: 'white', fontSize: isMobile ? '20px' : '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  border: 'none',
                  borderRadius: isMobile ? '16px' : '20px',
                  boxShadow: '0 15px 35px rgba(250, 112, 154, 0.2)',
                  color: 'white',
                }}
                bodyStyle={{ padding: isMobile ? '20px' : '28px' }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.8)', fontSize: isMobile ? '14px' : '16px', fontWeight: 500 }}>Por Cobrar</span>}
                  value={totalPendiente}
                  prefix={<CalendarOutlined style={{ color: 'white', fontSize: isMobile ? '20px' : '24px' }} />}
                  valueStyle={{ color: 'white', fontSize: isMobile ? '22px' : '28px', fontWeight: 'bold' }}
                  formatter={(value) => `$${Number(value).toLocaleString()}`}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Filtros de estado */}
        <Card
          style={{
            borderRadius: isMobile ? '12px' : '16px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            border: 'none',
            marginBottom: '24px',
            background: 'rgba(255,255,255,0.9)',
          }}
          bodyStyle={{ padding: isMobile ? '12px' : '20px' }}
        >
          <Row justify="space-between" align="middle" gutter={[8, 8]}>
            <Col xs={24} md={18}>
              <Space align="center" wrap>
                <FilterOutlined style={{ color: '#667eea', fontSize: isMobile ? '14px' : '16px' }} />
                {!isMobile && <Text strong style={{ color: '#667eea' }}>Filtrar por estado:</Text>}
                <Radio.Group
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  buttonStyle="solid"
                  size={isMobile ? "small" : "middle"}
                >
                  <Radio.Button value="all">Todas</Radio.Button>
                  <Radio.Button value="paid">Pagadas</Radio.Button>
                  <Radio.Button value="pending">Pendientes</Radio.Button>
                  <Radio.Button value="partial">{isMobile ? 'Abonos' : 'Con Abonos'}</Radio.Button>
                </Radio.Group>
              </Space>
            </Col>
            <Col xs={24} md={6} style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <Text type="secondary" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                {getFilteredSales().length} de {items.length} ventas
              </Text>
            </Col>
          </Row>
        </Card>

        {/* Tabla o Cards según dispositivo */}
        {isMobile ? (
          /* Vista de Cards para móvil */
          <div style={{ marginBottom: '80px' }}>
            <List
              dataSource={filteredSales}
              loading={loading}
              pagination={{
                pageSize: 10,
                showTotal: (total) => `${total} ventas`,
                simple: true,
              }}
              renderItem={(sale: any) => {
                const totalAmount = Math.round((sale.totalAmount || 0) * 100) / 100;
                const paidAmount = Math.round((sale.paidAmount || 0) * 100) / 100;
                const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
                const isPaid = sale.isPaid || pendiente <= 1;
                const isPartial = paidAmount > 0 && pendiente > 1;
                
                return (
                  <Card
                    key={sale.id}
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
                            <Text code style={{ fontSize: '12px' }}>#{sale.id}</Text>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {dayjs(sale.date).format('DD/MM/YYYY')}
                            </Text>
                          </Space>
                          <Space>
                            <UserOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
                            <Text strong style={{ fontSize: '13px' }}>
                              {sale.customerName || 'Cliente ocasional'}
                            </Text>
                          </Space>
                        </Space>
                      </Col>
                      <Col span={6} style={{ textAlign: 'right' }}>
                        <Button
                          type="text"
                          icon={<MoreOutlined />}
                          onClick={() => setActionDrawer({ open: true, sale })}
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
                            ${totalAmount.toLocaleString()}
                          </Text>
                        </Space>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <Space direction="vertical" size={0} style={{ alignItems: 'flex-end' }}>
                          <Text type="secondary" style={{ fontSize: '11px' }}>Estado</Text>
                          {isPaid ? (
                            <Tag color="success" style={{ margin: 0 }}>✓ Pagado</Tag>
                          ) : isPartial ? (
                            <Tag color="warning" style={{ margin: 0 }}>◐ Abonado</Tag>
                          ) : (
                            <Tag color="error" style={{ margin: 0 }}>✗ Pendiente</Tag>
                          )}
                        </Space>
                      </Col>
                    </Row>
                    
                    {isPartial && (
                      <div style={{ 
                        marginTop: '8px', 
                        padding: '8px', 
                        background: '#fff7e6', 
                        borderRadius: '6px',
                        border: '1px solid #ffd591'
                      }}>
                        <Text style={{ fontSize: '11px', color: '#fa8c16' }}>
                          💰 Pagado: ${paidAmount.toLocaleString()} | Saldo: ${pendiente.toLocaleString()}
                        </Text>
                      </div>
                    )}
                    
                    <Row gutter={8} style={{ marginTop: '12px' }}>
                      <Col span={12}>
                        <Tag 
                          icon={<CreditCardOutlined />} 
                          color={
                            sale.paymentMethod === 'Efectivo' ? 'green' :
                            sale.paymentMethod === 'Tarjeta' ? 'blue' :
                            sale.paymentMethod === 'Transferencia' ? 'purple' :
                            sale.paymentMethod === 'Crédito' ? 'orange' : 'default'
                          }
                          style={{ fontSize: '11px', margin: 0 }}
                        >
                          {sale.paymentMethod}
                        </Tag>
                      </Col>
                      <Col span={12} style={{ textAlign: 'right' }}>
                        <Space size={4}>
                          <Button
                            type="primary"
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(sale)}
                            style={{ fontSize: '11px', borderRadius: '6px' }}
                          >
                            Ver
                          </Button>
                          {pendiente > 1 && !isPaid && (
                            <Button
                              size="small"
                              icon={<DollarOutlined />}
                              onClick={() => handleOpenAbonoModal(sale)}
                              style={{ 
                                fontSize: '11px', 
                                borderRadius: '6px',
                                color: '#fa8c16',
                                borderColor: '#fa8c16'
                              }}
                            >
                              Abono
                            </Button>
                          )}
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                );
              }}
            />
          </div>
        ) : (
          /* Tabla para desktop y tablet */
          <Card
            style={{
              borderRadius: isTablet ? '12px' : '20px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              border: 'none',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
            }}
            bodyStyle={{ padding: isTablet ? '16px' : '32px' }}
          >
            <Table
              columns={columns}
              dataSource={filteredSales}
              rowKey="id"
              loading={loading}
              size={isTablet ? "small" : "middle"}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} ventas`,
                style: { marginTop: '24px' },
              }}
              scroll={{ 
                x: isTablet ? 900 : 1000,
              }}
              style={{
                borderRadius: isTablet ? '12px' : '16px',
                overflow: 'hidden',
              }}
            />
          </Card>
        )}

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

        {/* Modal de factura tamaño carta */}
        {companyConfig && selectedSale && (
          <SaleInvoiceModal
            visible={invoiceModalOpen}
            sale={selectedSale}
            companyConfig={companyConfig}
            onClose={() => {
              setInvoiceModalOpen(false);
              setSelectedSale(null);
            }}
          />
        )}

        {/* Drawer de acciones para móvil */}
        <Drawer
          title={
            <Space>
              <ShoppingCartOutlined />
              <span>Venta #{actionDrawer.sale?.id}</span>
            </Space>
          }
          placement="bottom"
          height="auto"
          open={actionDrawer.open}
          onClose={() => setActionDrawer({ open: false, sale: null })}
          bodyStyle={{ padding: '16px' }}
          style={{ borderRadius: '20px 20px 0 0' }}
        >
          {actionDrawer.sale && (
            <>
              {/* Información de la venta */}
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
                        {actionDrawer.sale.customerName || 'Cliente ocasional'}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Total</Text>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        ${actionDrawer.sale.totalAmount?.toLocaleString()}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Pagado</Text>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        ${actionDrawer.sale.paidAmount?.toLocaleString()}
                      </Text>
                    </Space>
                  </Col>
                  <Col span={8}>
                    <Space direction="vertical" size={0}>
                      <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '11px' }}>Saldo</Text>
                      <Text strong style={{ color: 'white', fontSize: '16px' }}>
                        ${(
                          (actionDrawer.sale.totalAmount || 0) - 
                          (actionDrawer.sale.paidAmount || 0)
                        ).toLocaleString()}
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
                      setActionDrawer({ open: false, sale: null });
                      handleViewDetail(actionDrawer.sale);
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
                    Ver Detalles
                  </Button>
                  
                  {(() => {
                    const totalAmount = Math.round((actionDrawer.sale.totalAmount || 0) * 100) / 100;
                    const paidAmount = Math.round((actionDrawer.sale.paidAmount || 0) * 100) / 100;
                    const pendiente = Math.round((totalAmount - paidAmount) * 100) / 100;
                    
                    return pendiente > 1 && !actionDrawer.sale.isPaid && (
                      <Button
                        block
                        size="large"
                        icon={<DollarOutlined />}
                        onClick={() => {
                          setActionDrawer({ open: false, sale: null });
                          handleOpenAbonoModal(actionDrawer.sale);
                        }}
                        style={{
                          height: '48px',
                          borderRadius: '12px',
                          fontWeight: 500,
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          background: '#fff7e6',
                          borderColor: '#ffa940',
                          color: '#fa8c16'
                        }}
                      >
                        Registrar Abono (${pendiente.toLocaleString()} pendiente)
                      </Button>
                    );
                  })()}
                </Space>
              </div>

              {/* Acciones de impresión/descarga */}
              <div>
                <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                  Imprimir y Descargar
                </Text>
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  <Button
                    block
                    size="large"
                    icon={<PrinterOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, sale: null });
                      handlePrintPOSTicket(actionDrawer.sale);
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
                    Imprimir Ticket POS
                  </Button>
                  
                  <Button
                    block
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, sale: null });
                      handlePrintInvoice(actionDrawer.sale);
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
                    Factura Tamaño Carta
                  </Button>
                  
                  <Button
                    block
                    size="large"
                    icon={<DownloadOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, sale: null });
                      handleDownloadPDF(actionDrawer.sale);
                    }}
                    style={{
                      height: '48px',
                      borderRadius: '12px',
                      fontWeight: 500,
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      background: '#fff7e6',
                      borderColor: '#ffd591',
                      color: '#fa8c16'
                    }}
                  >
                    Descargar PDF
                  </Button>
                  
                  <Button
                    block
                    size="large"
                    icon={<FileTextOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, sale: null });
                      handlePrint(actionDrawer.sale);
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
                    Imprimir Factura
                  </Button>
                </Space>
              </div>

              {/* Acciones administrativas */}
              {isAdminOrSuperAdmin() && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                  <Text type="secondary" style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>
                    Acciones administrativas
                  </Text>
                  <Button
                    block
                    size="large"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setActionDrawer({ open: false, sale: null });
                      handleDeleteSale(actionDrawer.sale);
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
                    Eliminar Venta
                  </Button>
                </div>
              )}
            </>
          )}
        </Drawer>
      </div>
    </div>
  );
};

export default SaleList;


