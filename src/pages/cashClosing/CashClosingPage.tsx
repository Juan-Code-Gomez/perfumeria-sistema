import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  Button,
  Typography,
  Card,
  Space,
  Row,
  Col,
  Form,
  DatePicker,
  Alert,
  Tooltip,
  Tag,
  message,
} from "antd";
import {
  ReloadOutlined,
  CalculatorOutlined,
  FilePdfOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchCashClosings,
  fetchCashClosingSummary,
  createCashClosing,
} from "../../features/cashClosing/cashClosingSlice";
import { useResponsive } from "../../hooks/useResponsive";
import DetailedCashClosingModal from "../../components/cashClosing/DetailedCashClosingModal";
import CashSessionManager from "../../components/cashClosing/CashSessionManager";
import type { CashSessionManagerRef } from "../../components/cashClosing/CashSessionManager";
import CashClosingDetailViewModal from "../../components/cashClosing/CashClosingDetailViewModal";
import api from "../../services/api";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const CashClosingPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    items: cashClosings = [],
    loading,
    error,
    summary,
    loadingSummary,
  } = useAppSelector((state) => state.cashClosing);

  const { isMobile, isTablet } = useResponsive();
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [activeSession, setActiveSession] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedClosing, setSelectedClosing] = useState<any>(null);
  
  // Ref para controlar el componente CashSessionManager
  const sessionManagerRef = useRef<CashSessionManagerRef>(null);

  // Filtrar datos por rango de fechas
  const filteredData = cashClosings.filter((item) => {
    if (!dateRange) return true;
    const itemDate = dayjs(item.date);
    return (
      itemDate.isAfter(dateRange[0]?.startOf("day")) &&
      itemDate.isBefore(dateRange[1]?.endOf("day"))
    );
  });

  const safeItems = Array.isArray(filteredData) ? filteredData : [];

  useEffect(() => {
    dispatch(fetchCashClosings());
  }, [dispatch]);

  // Definir columnas de la tabla
  const columns = [
    {
      title: "📅 Fecha y Hora",
      dataIndex: "date",
      key: "date",
      render: (date: string, record: any) => (
        <div>
          <div>{dayjs(date).format("DD/MM/YYYY")}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.createdAt ? dayjs(record.createdAt).format("HH:mm:ss") : ''}
          </Text>
        </div>
      ),
      sorter: (a: any, b: any) => dayjs(a.createdAt || a.date).unix() - dayjs(b.createdAt || b.date).unix(),
      defaultSortOrder: "descend" as const,
    },
    {
      title: "💰 Saldo Inicial",
      dataIndex: "openingCash",
      key: "openingCash",
      render: (value: number) => `$${value?.toLocaleString() || 0}`,
      align: "right" as const,
    },
    {
      title: "💵 Saldo Final",
      dataIndex: "closingCash",
      key: "closingCash",
      render: (value: number) => `$${value?.toLocaleString() || 0}`,
      align: "right" as const,
    },
    {
      title: "⚖️ Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: (value: number) => (
        <Tag
          color={
            value === 0 ? "success" : value > 0 ? "warning" : "error"
          }
        >
          {value === 0
            ? "Cuadrada"
            : value > 0
            ? `+$${value.toLocaleString()}`
            : `-$${Math.abs(value).toLocaleString()}`}
        </Tag>
      ),
      align: "center" as const,
    },
    ...(isMobile ? [] : [
      {
        title: "📝 Observaciones",
        dataIndex: "notes",
        key: "notes",
        ellipsis: true,
        render: (notes: string) => notes ? (
          <Tooltip title={notes}>
            <Text ellipsis style={{ maxWidth: 150 }}>
              {notes}
            </Text>
          </Tooltip>
        ) : (
          <Text type="secondary">Sin notas</Text>
        ),
      }
    ]),
    {
      title: "🔧 Acciones",
      key: "actions",
      align: "center" as const,
      width: isMobile ? 80 : 120,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Ver resumen PDF">
            <Button
              type="primary"
              size="small"
              icon={<FilePdfOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadPDF(record);
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Función para descargar el PDF de un cierre específico
  const handleDownloadPDF = async (record: any) => {
    try {
      const dateStr = dayjs(record.date).format('YYYY-MM-DD');
      
      // Usar axios para descargar el PDF
      const response = await api.get(`/cash-closing/report/pdf/${dateStr}`, {
        responseType: 'blob',
      });
      
      // Crear un blob desde la respuesta
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `cierre-caja-${dateStr}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('PDF descargado exitosamente');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      message.error(error.response?.data?.message || 'Error al descargar el PDF');
    }
  };

  // Formulario de registro de cierre
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedDate] = useState(dayjs());

  // Maneja la carga de resumen al abrir modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('Current state - Summary:', summary, 'LoadingSummary:', loadingSummary, 'SelectedDate:', selectedDate.format('YYYY-MM-DD'));

  // Función para manejar el clic en una fila de cierre
  const handleRowClick = (record: any) => {
    setSelectedClosing(record);
    setDetailModalOpen(true);
  };

  const handleOpenModal = () => {
    console.log('Opening cash closing modal...');
    
    // Validar que haya una sesión activa antes de permitir cierre
    if (!activeSession) {
      message.warning('⚠️ Debes abrir la caja primero antes de hacer el cierre');
      return;
    }
    
    // Se permite múltiples cierres por día (diferentes turnos/sesiones)
    // La validación de cierre duplicado fue removida para permitir flexibilidad operativa
    
    setIsModalOpen(true);
    
    // Al abrir, trae el resumen del día seleccionado
    const fecha = selectedDate.format("YYYY-MM-DD");
    console.log('Fetching summary for date:', fecha);
    
    dispatch(fetchCashClosingSummary(fecha));
    form.setFieldsValue({
      date: selectedDate,
      openingCash: activeSession?.openingCash || 0,
      closingCash: 0,
      notes: "",
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Callback para manejar cambios de sesión de caja
  const handleSessionChange = (session: any) => {
    setActiveSession(session);
    console.log('Session changed:', session);
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      // 1. Crear el cierre de caja
      await dispatch(
        createCashClosing({
          ...values,
          date: values.date.format("YYYY-MM-DD"),
        })
      ).unwrap();
      
      // 2. Cerrar la sesión de caja activa
      if (activeSession) {
        try {
          const response = await api.post('/cash-session/close', {
            closingCash: values.closingCash,
            notes: values.notes || ''
          });
          
          console.log('✅ Sesión de caja cerrada exitosamente:', response.data);
          setActiveSession(null); // Limpiar la sesión activa
          
          // Refrescar el CashSessionManager para que muestre el estado correcto
          await sessionManagerRef.current?.refreshSession();
        } catch (error: any) {
          console.error('❌ Error cerrando sesión de caja:', error);
          console.error('Error response:', error.response?.data);
          
          // Mostrar error al usuario
          message.error(
            `Error al cerrar sesión: ${error.response?.data?.message || error.message || 'Error desconocido'}. ` +
            `El cierre se guardó correctamente pero la sesión sigue activa.`
          );
        }
      }
      
      message.success("Cierre registrado correctamente");
      handleCloseModal();
      dispatch(fetchCashClosings());
    } catch (err: any) {
      console.error('Error en cierre de caja:', err);
      message.error(err.message || "Error al registrar cierre");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6" style={{ padding: isMobile ? '12px' : '24px' }}>
      <Row justify="space-between" align="middle" className="mb-6" gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Title level={2} style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '1.75rem' }}>
            💰 {isMobile ? 'Cierres' : 'Cierres de Caja'}
          </Title>
          {!isMobile && (
            <Text type="secondary">
              Control y seguimiento de cierres por turno/sesión - Puedes registrar múltiples cierres al día
            </Text>
          )}
        </Col>
        <Col xs={24} md={12} style={{ textAlign: isMobile ? 'left' : 'right' }}>
          <Space wrap>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => dispatch(fetchCashClosings())}
              size={isMobile ? "middle" : undefined}
            >
              {!isMobile && "Actualizar"}
            </Button>
            <Button 
              type="primary" 
              icon={<CalculatorOutlined />}
              onClick={handleOpenModal}
              size={isMobile ? "middle" : undefined}
            >
              {isMobile ? "Registrar" : "Registrar Cierre"}
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Indicador de Estado de Caja */}
      {activeSession ? (
        <Alert
          message={`🔓 Caja Abierta - Turno #${activeSession.sessionNumber}`}
          description={`Sesión iniciada por: ${activeSession.openedBy?.name || 'Sistema'} • ${dayjs(activeSession.openedAt).format('DD/MM/YYYY HH:mm')} • Saldo inicial: $${activeSession.openingCash?.toLocaleString()}`}
          type="success"
          showIcon
          style={{ marginBottom: '16px' }}
          action={
            <Button type="primary" size="small" onClick={handleOpenModal}>
              Hacer Cierre
            </Button>
          }
        />
      ) : (
        <Alert
          message="🔒 Caja Cerrada"
          description="Debes abrir una sesión de caja antes de poder registrar un cierre. Usa el control de abajo para abrir la caja."
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {/* Control de Sesiones de Caja */}
      <div style={{ marginBottom: '24px' }}>
        <CashSessionManager 
          ref={sessionManagerRef}
          onSessionChange={handleSessionChange}
        />
      </div>

      {/* Botones de Cierre Mensual */}
      <Card style={{ marginBottom: '24px' }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              📊 Reportes Avanzados
            </Title>
            <Text type="secondary">Cierres mensuales y reportes detallados</Text>
          </Col>
          <Col>
            <Space wrap>
              <Button 
                type="default"
                icon={<BarChartOutlined />}
                onClick={() => {
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  window.open(`/api/cash-closing/monthly/${currentYear}/${currentMonth}`, '_blank');
                }}
              >
                Ver Cierre Mensual
              </Button>
              <Button 
                type="primary"
                icon={<FilePdfOutlined />}
                onClick={() => {
                  const currentMonth = new Date().getMonth() + 1;
                  const currentYear = new Date().getFullYear();
                  window.open(`/api/cash-closing/monthly/pdf/${currentYear}/${currentMonth}`, '_blank');
                }}
              >
                PDF Mensual
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Filtros */}
      <Card className="mb-6" size="small">
        <Form layout={isMobile ? "vertical" : "inline"}>
          <Form.Item label="📅 Filtrar por fecha">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [any, any])}
              allowClear
              format="DD/MM/YYYY"
              size={isMobile ? "middle" : undefined}
              placeholder={['Fecha inicial', 'Fecha final']}
              style={{ width: isMobile ? '100%' : 'auto' }}
            />
          </Form.Item>
        </Form>
      </Card>

      {/* Tabla de cierres */}
      <Card>
        {safeItems.length === 0 && !loading && !error ? (
          <div className="text-center py-8">
            <Title level={4} type="secondary">
              📊 No hay cierres de caja registrados
            </Title>
            <Text type="secondary">
              Comienza registrando tu primer cierre de caja del día
            </Text>
          </div>
        ) : (
          <Table
            dataSource={safeItems}
            columns={columns}
            rowKey="id"
            loading={loading}
            size={isMobile ? "small" : "middle"}
            scroll={{ 
              x: isMobile ? 500 : isTablet ? 800 : true,
              y: isMobile ? 'calc(60vh - 200px)' : undefined
            }}
            pagination={{
              showSizeChanger: !isMobile,
              showQuickJumper: !isMobile,
              pageSize: isMobile ? 5 : 10,
              showTotal: (total, range) => 
                isMobile 
                  ? `${range[0]}-${range[1]}/${total}`
                  : `${range[0]}-${range[1]} de ${total} registros`,
            }}
            locale={{
              emptyText: loading ? 'Cargando...' : 'No hay cierres registrados'
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
              style: { cursor: 'pointer' }
            })}
          />
        )}
        {error && (
          <Alert
            message="Error al cargar cierres"
            description={error}
            type="error"
            showIcon
            className="mt-4"
            closable
          />
        )}
      </Card>

      {/* Modal de cierre detallado */}
      <DetailedCashClosingModal
        visible={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        summary={summary}
        loading={saving || loadingSummary}
        selectedDate={selectedDate.format('YYYY-MM-DD')}
        activeSession={activeSession}
      />

      {/* Modal para ver detalles de un cierre existente */}
      <CashClosingDetailViewModal
        visible={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedClosing(null);
        }}
        closing={selectedClosing}
      />
    </div>
  );
};

export default CashClosingPage;