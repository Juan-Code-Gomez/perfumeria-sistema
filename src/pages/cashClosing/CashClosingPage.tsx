import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Tag,
  DatePicker,
  Row,
  Col,
  Card,
  Form,
  InputNumber,
  Input,
  message,
  Descriptions,
  Spin,
  Typography,
  Space,
  Statistic,
  Alert,
  Tooltip,
} from "antd";
import {
  DollarOutlined,
  CalendarOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CalculatorOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchCashClosings,
  createCashClosing,
  fetchCashClosingSummary,
} from "../../features/cashClosing/cashClosingSlice";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const CashClosingList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, summary, loadingSummary } = useAppSelector((s) => s.cashClosing);

  // Filtros de fechas
  const [dateRange, setDateRange] = useState<[any, any]>();

  // Debug: verificar el tipo de datos
  console.log('Cash Closing Items:', items, 'Type:', typeof items, 'Is Array:', Array.isArray(items));

  // Asegurarse de que items sea siempre un array
  const safeItems = Array.isArray(items) ? items : [];

  // Cargar datos iniciales
  useEffect(() => {
    dispatch(fetchCashClosings());
  }, [dispatch]);

  useEffect(() => {
    const params =
      dateRange && dateRange[0] && dateRange[1]
        ? {
            dateFrom: dateRange[0].format("YYYY-MM-DD"),
            dateTo: dateRange[1].format("YYYY-MM-DD"),
          }
        : undefined;
    dispatch(fetchCashClosings(params));
  }, [dispatch, dateRange]);

  const columns = [
    { 
      title: "📅 Fecha", 
      dataIndex: "date", 
      key: "date", 
      render: (v: string) => (
        <Space>
          <CalendarOutlined />
          {dayjs(v).format("DD/MM/YYYY")}
        </Space>
      ),
      sorter: (a: any, b: any) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    },
    { 
      title: "💰 Ventas Total", 
      dataIndex: "totalSales", 
      key: "totalSales", 
      render: (v: number) => (
        <Statistic 
          value={v} 
          prefix="$" 
          precision={0} 
          valueStyle={{ fontSize: '14px', color: '#52c41a' }}
        />
      ),
      sorter: (a: any, b: any) => a.totalSales - b.totalSales,
    },
    { 
      title: "💸 Gastos", 
      dataIndex: "totalExpense", 
      key: "totalExpense", 
      render: (v: number) => (
        <Statistic 
          value={v} 
          prefix="$" 
          precision={0} 
          valueStyle={{ fontSize: '14px', color: '#ff4d4f' }}
        />
      ),
      sorter: (a: any, b: any) => a.totalExpense - b.totalExpense,
    },
    { 
      title: "🏧 Caja Real", 
      dataIndex: "closingCash", 
      key: "closingCash", 
      render: (v: number) => (
        <Statistic 
          value={v} 
          prefix="$" 
          precision={0} 
          valueStyle={{ fontSize: '14px', color: '#1890ff' }}
        />
      ),
      sorter: (a: any, b: any) => a.closingCash - b.closingCash,
    },
    { 
      title: "🖥️ Caja Sistema", 
      dataIndex: "systemCash", 
      key: "systemCash", 
      render: (v: number) => (
        <Statistic 
          value={v} 
          prefix="$" 
          precision={0} 
          valueStyle={{ fontSize: '14px', color: '#722ed1' }}
        />
      ),
      sorter: (a: any, b: any) => a.systemCash - b.systemCash,
    },
    {
      title: "⚖️ Diferencia",
      dataIndex: "difference",
      key: "difference",
      render: (v: number) => {
        if (v === 0) {
          return (
            <Tag icon={<CheckCircleOutlined />} color="success">
              Exacto
            </Tag>
          );
        } else if (v > 0) {
          return (
            <Tag icon={<InfoCircleOutlined />} color="warning">
              +${v.toLocaleString()} (Sobra)
            </Tag>
          );
        } else {
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              ${Math.abs(v).toLocaleString()} (Falta)
            </Tag>
          );
        }
      },
      sorter: (a: any, b: any) => a.difference - b.difference,
    },
    { 
      title: "📝 Notas", 
      dataIndex: "notes", 
      key: "notes",
      render: (notes: string) => notes ? (
        <Tooltip title={notes}>
          <Text ellipsis style={{ maxWidth: 150 }}>
            {notes}
          </Text>
        </Tooltip>
      ) : (
        <Text type="secondary">Sin notas</Text>
      ),
    },
  ];

  // Formulario de registro de cierre
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs()); // Fecha actual por defecto

  // Maneja la carga de resumen al abrir modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  console.log('Current state - Summary:', summary, 'LoadingSummary:', loadingSummary, 'SelectedDate:', selectedDate.format('YYYY-MM-DD'));

  const handleOpenModal = () => {
    console.log('Opening cash closing modal...');
    setIsModalOpen(true);
    
    // Al abrir, trae el resumen del día seleccionado
    const fecha = selectedDate.format("YYYY-MM-DD");
    console.log('Fetching summary for date:', fecha);
    
    dispatch(fetchCashClosingSummary(fecha));
    form.setFieldsValue({
      date: selectedDate,
      openingCash: 0,
      closingCash: 0,
      notes: "",
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  // Cuando cambia la fecha del cierre, actualiza el resumen
  const handleChangeDate = (date: any) => {
    console.log('Date changed to:', date);
    setSelectedDate(date);
    form.setFieldsValue({ date });
    if (date) {
      const dateString = date.format("YYYY-MM-DD");
      console.log('Fetching summary for new date:', dateString);
      dispatch(fetchCashClosingSummary(dateString));
    }
  };

  // Calcula diferencia en tiempo real al cambiar el saldo contado
  const [diff, setDiff] = useState(0);

  const handleValuesChange = (_: any, values: any) => {
    // CÁLCULO CORRECTO: Caja sistema = Saldo inicial + Ventas efectivo + Ingresos - Gastos - Pagos
    if (summary && values.closingCash !== undefined && values.openingCash !== undefined) {
      const systemCashComplete = 
        (values.openingCash || 0) +           // Saldo inicial (del form)
        (summary.cashSales || 0) +            // Ventas en efectivo del día
        0 -                                   // Ingresos extra (opcional, por ahora 0)
        (summary.totalExpense || 0) -         // Gastos del día
        (summary.totalPayments || 0);        // Pagos a proveedores
        
      const difference = (values.closingCash || 0) - systemCashComplete;
      
      console.log('💰 Cálculo de diferencia:', {
        closingCash: values.closingCash,
        openingCash: values.openingCash,
        cashSales: summary.cashSales,
        totalExpense: summary.totalExpense,
        totalPayments: summary.totalPayments,
        systemCashComplete,
        difference
      });
      
      setDiff(difference);
    } else {
      setDiff(0);
    }
  };

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await dispatch(
        createCashClosing({
          ...values,
          date: values.date.format("YYYY-MM-DD"),
        })
      ).unwrap();
      message.success("Cierre registrado correctamente");
      handleCloseModal();
      dispatch(fetchCashClosings());
    } catch (err: any) {
      message.error(err.message || "Error al registrar cierre");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6">
      <Row justify="space-between" align="middle" className="mb-6">
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            💰 Cierres de Caja
          </Title>
          <Text type="secondary">
            Control y seguimiento de cierres diarios de caja
          </Text>
        </Col>
        <Col>
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => dispatch(fetchCashClosings())}
            >
              Actualizar
            </Button>
            <Button 
              type="primary" 
              icon={<CalculatorOutlined />}
              onClick={handleOpenModal}
            >
              Registrar Cierre
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-6" size="small">
        <Form layout="inline">
          <Form.Item label="📅 Filtrar por fecha">
            <RangePicker
              value={dateRange}
              onChange={(dates) => setDateRange(dates as [any, any])}
              allowClear
              format="DD/MM/YYYY"
              placeholder={['Fecha inicial', 'Fecha final']}
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
            scroll={{ x: true }}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} registros`,
            }}
            size="middle"
            locale={{
              emptyText: loading ? 'Cargando...' : 'No hay cierres registrados'
            }}
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
      <Modal
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        title={
          <Space>
            <CalculatorOutlined />
            <span>Registrar Cierre de Caja</span>
          </Space>
        }
        width={800}
        destroyOnClose
      >
        {loadingSummary ? (
          <div className="text-center py-8">
            <Spin size="large" tip="Calculando resumen del día..." />
          </div>
        ) : summary ? (
          <>
            {/* Resumen del día */}
            <Alert
              message="📊 Resumen del Día Seleccionado"
              description={`Datos automáticos calculados del ${dayjs(summary.fecha).format('DD/MM/YYYY')}`}
              type="info"
              showIcon
              className="mb-4"
            />
            
            <Row gutter={16} className="mb-6">
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="💰 Total Ventas"
                    value={summary.totalSales || 0}
                    prefix="$"
                    valueStyle={{ color: '#52c41a', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="💸 Total Gastos"
                    value={summary.totalExpense || 0}
                    prefix="$"
                    valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" className="text-center">
                  <Statistic
                    title="🖥️ Base Sistema"
                    value={summary.systemCash || 0}
                    prefix="$"
                    valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                  />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    (Sin saldo inicial)
                  </Text>
                </Card>
              </Col>
            </Row>

            <Descriptions
              column={2}
              bordered
              size="small"
              className="mb-6"
              layout="horizontal"
              title="💳 Desglose de Ventas por Método de Pago"
            >
              <Descriptions.Item label="💵 Efectivo">
                <Text strong>${summary.cashSales?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="💳 Tarjeta">
                <Text strong>${summary.cardSales?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="🏦 Transferencia">
                <Text strong>${summary.transferSales?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="📋 Crédito">
                <Text strong>${summary.creditSales?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="🏪 Pagos a Proveedores">
                <Text strong>${summary.totalPayments?.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="💰 Otros Ingresos">
                <Text strong>${summary.totalIncome?.toLocaleString()}</Text>
              </Descriptions.Item>
            </Descriptions>
            
            {/* Detalles de transacciones individuales */}
            <Row gutter={16} className="mb-6">
              {/* Detalle de Ventas */}
              <Col span={8}>
                <Card 
                  title="🛒 Ventas del Día" 
                  size="small"
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  {summary.salesDetail && summary.salesDetail.length > 0 ? (
                    <div>
                      {summary.salesDetail.map((sale: any) => (
                        <div key={sale.id} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #f0f0f0',
                          marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>${sale.totalAmount?.toLocaleString()}</Text>
                            <Tag color={
                              sale.paymentMethod === 'Efectivo' ? 'green' :
                              sale.paymentMethod === 'Tarjeta' ? 'blue' :
                              sale.paymentMethod === 'Transferencia' ? 'purple' :
                              sale.paymentMethod === 'Crédito' ? 'orange' : 'default'
                            }>
                              {sale.paymentMethod}
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {sale.customerName} - {dayjs(sale.createdAt).format('HH:mm')}
                          </Text>
                          {!sale.isPaid && (
                            <Tag color="red">No Pagado</Tag>
                          )}
                        </div>
                      ))}
                      <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d9d9d9' }}>
                        <Text strong>Total: ${summary.totalSales?.toLocaleString()}</Text>
                      </div>
                    </div>
                  ) : (
                    <Text type="secondary">No hay ventas registradas</Text>
                  )}
                </Card>
              </Col>

              {/* Detalle de Gastos */}
              <Col span={8}>
                <Card 
                  title="💸 Gastos del Día" 
                  size="small"
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  {summary.expensesDetail && summary.expensesDetail.length > 0 ? (
                    <div>
                      {summary.expensesDetail.map((expense: any) => (
                        <div key={expense.id} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #f0f0f0',
                          marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>${expense.amount?.toLocaleString()}</Text>
                            <Tag color="red">Gasto</Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {expense.description} - {dayjs(expense.createdAt).format('HH:mm')}
                          </Text>
                        </div>
                      ))}
                      <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d9d9d9' }}>
                        <Text strong>Total: ${summary.totalExpense?.toLocaleString()}</Text>
                      </div>
                    </div>
                  ) : (
                    <Text type="secondary">No hay gastos registrados</Text>
                  )}
                </Card>
              </Col>

              {/* Detalle de Pagos a Proveedores */}
              <Col span={8}>
                <Card 
                  title="🏪 Pagos a Proveedores" 
                  size="small"
                  style={{ maxHeight: '300px', overflow: 'auto' }}
                >
                  {summary.paymentsDetail && summary.paymentsDetail.length > 0 ? (
                    <div>
                      {summary.paymentsDetail.map((payment: any) => (
                        <div key={payment.id} style={{ 
                          padding: '8px', 
                          borderBottom: '1px solid #f0f0f0',
                          marginBottom: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>${payment.amount?.toLocaleString()}</Text>
                            <Tag color="volcano">Pago</Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '11px' }}>
                            {payment.supplierName} - {dayjs(payment.createdAt).format('HH:mm')}
                          </Text>
                        </div>
                      ))}
                      <div style={{ textAlign: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #d9d9d9' }}>
                        <Text strong>Total: ${summary.totalPayments?.toLocaleString()}</Text>
                      </div>
                    </div>
                  ) : (
                    <Text type="secondary">No hay pagos registrados</Text>
                  )}
                </Card>
              </Col>
            </Row>
            
            <Form
              layout="vertical"
              form={form}
              onFinish={handleSubmit}
              onValuesChange={handleValuesChange}
              initialValues={{
                date: selectedDate,
                openingCash: 0,
                closingCash: 0,
                notes: "",
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <CalendarOutlined />
                        <span>Fecha del Cierre</span>
                      </Space>
                    }
                    name="date"
                    rules={[{ required: true, message: "Selecciona la fecha" }]}
                  >
                    <DatePicker
                      format="DD/MM/YYYY"
                      style={{ width: "100%" }}
                      value={selectedDate}
                      onChange={handleChangeDate}
                      allowClear={false}
                      placeholder="Seleccionar fecha"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={
                      <Space>
                        <DollarOutlined />
                        <span>Saldo Inicial (Apertura)</span>
                      </Space>
                    }
                    name="openingCash"
                    rules={[{ required: true, message: "Ingresa el saldo inicial" }]}
                    tooltip="Efectivo que había en caja al iniciar el día"
                  >
                    <InputNumber
                      min={0}
                      formatter={(v) =>
                        `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      style={{ width: "100%" }}
                      placeholder="0"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={
                  <Space>
                    <DollarOutlined />
                    <span>Saldo Final Contado (Cierre Real)</span>
                  </Space>
                }
                name="closingCash"
                rules={[{ required: true, message: "Ingresa el saldo contado" }]}
                tooltip="Efectivo real contado físicamente al final del día"
              >
                <InputNumber
                  min={0}
                  formatter={(v) =>
                    `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  style={{ width: "100%" }}
                  placeholder="0"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <InfoCircleOutlined />
                    <span>Observaciones</span>
                  </Space>
                }
                name="notes"
              >
                <Input.TextArea 
                  placeholder="Cualquier observación sobre el cierre del día (opcional)" 
                  rows={3}
                />
              </Form.Item>

              {/* Indicador de diferencia */}
              <Card 
                size="small" 
                className={`mb-4 ${
                  diff === 0 ? 'border-green-400' : 
                  diff > 0 ? 'border-yellow-400' : 'border-red-400'
                }`}
              >
                <Row justify="center" align="middle">
                  <Col span={24} className="text-center">
                    <Text strong style={{ fontSize: '16px' }}>
                      ⚖️ Diferencia: {" "}
                      {diff === 0 ? (
                        <Tag icon={<CheckCircleOutlined />} color="success" style={{ fontSize: '14px' }}>
                          Caja Cuadrada - Sin Diferencia
                        </Tag>
                      ) : diff > 0 ? (
                        <Tag icon={<InfoCircleOutlined />} color="warning" style={{ fontSize: '14px' }}>
                          Sobra ${diff.toLocaleString()} - Revisar
                        </Tag>
                      ) : (
                        <Tag icon={<CloseCircleOutlined />} color="error" style={{ fontSize: '14px' }}>
                          Falta ${Math.abs(diff).toLocaleString()} - Revisar
                        </Tag>
                      )}
                    </Text>
                  </Col>
                </Row>
              </Card>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  block
                  size="large"
                  disabled={!summary || summary.totalSales === 0}
                  icon={<CheckCircleOutlined />}
                >
                  {saving ? 'Guardando...' : 'Registrar Cierre de Caja'}
                </Button>
                {summary && summary.totalSales === 0 && (
                  <Alert
                    message="No hay ventas registradas para este día"
                    type="warning"
                    showIcon
                    className="mt-2"
                  />
                )}
              </Form.Item>
            </Form>
          </>
        ) : (
          <div className="text-center py-8">
            <Alert
              message="⚠️ Sin datos para mostrar"
              description={
                <div>
                  <p>No hay ventas ni gastos registrados para el día seleccionado ({dayjs(selectedDate).format('DD/MM/YYYY')})</p>
                  <p><strong>Debugging info:</strong></p>
                  <pre style={{ fontSize: '12px', textAlign: 'left' }}>
                    Summary: {JSON.stringify(summary, null, 2)}
                    <br />
                    Loading Summary: {loadingSummary ? 'true' : 'false'}
                    <br />
                    Selected Date: {selectedDate.format('YYYY-MM-DD')}
                  </pre>
                </div>
              }
              type="warning"
              showIcon
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CashClosingList;
