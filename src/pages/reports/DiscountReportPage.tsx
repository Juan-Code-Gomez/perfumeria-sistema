import React, { useState, useEffect } from 'react';
import {
  Card,
  DatePicker,
  Button,
  Statistic,
  Table,
  Row,
  Col,
  Space,
  Typography,
  Tag,
  Spin,
  message,
  Empty,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  PercentageOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import {
  getDiscountsReport,
  type DiscountReport,
  type SaleWithDiscount,
  type TopCustomer,
} from '../../services/discountReportService';
import {
  exportDiscountReportToExcel,
  exportDiscountReportToPDF,
} from '../../utils/discountReportExport';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const DiscountReportPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<DiscountReport | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // Cargar reporte inicial (últimos 30 días)
  useEffect(() => {
    const endDate = dayjs();
    const startDate = endDate.subtract(30, 'days');
    setDateRange([startDate, endDate]);
    loadReport(startDate.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'));
  }, []);

  const loadReport = async (dateFrom?: string, dateTo?: string) => {
    setLoading(true);
    try {
      const response = await getDiscountsReport({
        dateFrom,
        dateTo,
      });

      if (response.success) {
        setReportData(response.data);
      } else {
        message.error('Error al cargar el reporte de descuentos');
      }
    } catch (error) {
      console.error('Error loading discount report:', error);
      message.error('Error al cargar el reporte de descuentos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (dateRange) {
      loadReport(
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
    } else {
      loadReport();
    }
  };

  const handleExportExcel = () => {
    if (!reportData) {
      message.warning('No hay datos para exportar');
      return;
    }

    try {
      const result = exportDiscountReportToExcel(reportData);
      if (result.success) {
        message.success(`Archivo Excel exportado: ${result.fileName}`);
      } else {
        message.error(`Error exportando Excel: ${result.error}`);
      }
    } catch (error) {
      message.error('Error al exportar a Excel');
    }
  };

  const handleExportPDF = () => {
    if (!reportData) {
      message.warning('No hay datos para exportar');
      return;
    }

    try {
      const result = exportDiscountReportToPDF(reportData);
      if (result.success) {
        message.success(`Archivo PDF exportado: ${result.fileName}`);
      } else {
        message.error(`Error exportando PDF: ${result.error}`);
      }
    } catch (error) {
      message.error('Error al exportar a PDF');
    }
  };

  const salesColumns: ColumnsType<SaleWithDiscount> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Cliente',
      dataIndex: 'customerDisplayName',
      key: 'customer',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotalAmount',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (amount: number) => `$${amount.toLocaleString()}`,
      sorter: (a, b) => a.subtotalAmount - b.subtotalAmount,
    },
    {
      title: 'Tipo Descuento',
      dataIndex: 'discountType',
      key: 'discountType',
      width: 130,
      render: (type: string) => {
        const color = type === 'percentage' ? 'blue' : 'green';
        const icon = type === 'percentage' ? <PercentageOutlined /> : <DollarOutlined />;
        const text = type === 'percentage' ? 'Porcentaje' : 'Fijo';
        return <Tag color={color} icon={icon}>{text}</Tag>;
      },
    },
    {
      title: 'Valor Desc.',
      dataIndex: 'discountValue',
      key: 'discountValue',
      width: 100,
      align: 'right',
      render: (value: number, record: SaleWithDiscount) => {
        if (record.discountType === 'percentage') {
          return `${value}%`;
        } else {
          return `$${value?.toLocaleString()}`;
        }
      },
    },
    {
      title: 'Monto Desc.',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          $${amount.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.discountAmount - b.discountAmount,
    },
    {
      title: 'Total Final',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Text strong>$${amount.toLocaleString()}</Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
  ];

  const customersColumns: ColumnsType<TopCustomer> = [
    {
      title: 'Cliente',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Total Descuentos',
      dataIndex: 'totalDiscount',
      key: 'totalDiscount',
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#f5222d' }}>
          $${amount.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'Ventas con Descuento',
      dataIndex: 'salesCount',
      key: 'salesCount',
      align: 'center',
      render: (count: number) => <Tag color="blue">{count}</Tag>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Encabezado */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <PercentageOutlined style={{ marginRight: '8px' }} />
            Reporte de Descuentos
          </Title>
        </Col>
        <Col>
          {reportData && (
            <Space>
              <Button
                type="default"
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
                style={{ color: '#52c41a' }}
              >
                Excel
              </Button>
              <Button
                type="default" 
                icon={<FilePdfOutlined />}
                onClick={handleExportPDF}
                style={{ color: '#ff4d4f' }}
              >
                PDF
              </Button>
            </Space>
          )}
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16} align="middle">
          <Col flex={1}>
            <Space>
              <CalendarOutlined />
              <Text strong>Período:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                format="DD/MM/YYYY"
                placeholder={['Fecha inicio', 'Fecha fin']}
              />
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              Consultar
            </Button>
          </Col>
        </Row>
      </Card>

      <Spin spinning={loading}>
        {reportData && reportData.summary ? (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Estadísticas principales */}
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Ventas con Descuento"
                    value={reportData.summary.totalSales || 0}
                    prefix={<UserOutlined />}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Descuentos"
                    value={reportData.summary.totalDiscountAmount || 0}
                    prefix="$"
                    precision={0}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Promedio por Venta"
                    value={reportData.summary.averageDiscountAmount || 0}
                    prefix="$"
                    precision={0}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="% del Subtotal"
                    value={reportData.summary.discountPercentageOfSubtotal || 0}
                    suffix="%"
                    precision={1}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Resumen por tipo de descuento */}
            <Card title="Descuentos por Tipo">
              <Row gutter={16}>
                {reportData.discountsByType && Object.entries(reportData.discountsByType).map(([type, data]) => (
                  <Col xs={24} sm={12} key={type}>
                    <Card size="small" style={{ textAlign: 'center' }}>
                      <Title level={4} style={{ margin: 0 }}>
                        {type === 'percentage' ? '🔢 Porcentaje' : '💰 Fijo'}
                      </Title>
                      <Divider style={{ margin: '8px 0' }} />
                      <Space direction="vertical">
                        <Text strong>${data.totalDiscountAmount.toLocaleString()}</Text>
                        <Text type="secondary">{data.count} ventas</Text>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Top clientes con descuentos */}
            <Card title="Top Clientes con Descuentos">
              <Table
                dataSource={reportData.topCustomers || []}
                columns={customersColumns}
                rowKey="name"
                pagination={false}
                size="small"
              />
            </Card>

            {/* Tabla de ventas con descuentos */}
            <Card title="Detalle de Ventas con Descuentos">
              <Table
                dataSource={reportData.salesWithDiscounts || []}
                columns={salesColumns}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} de ${total} ventas`,
                }}
                scroll={{ x: 800 }}
                size="small"
              />
            </Card>
          </Space>
        ) : (
          !loading && (
            <Empty
              description="No hay datos de descuentos para mostrar"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )
        )}
      </Spin>
    </div>
  );
};

export default DiscountReportPage;