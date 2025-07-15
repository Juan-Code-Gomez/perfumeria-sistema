import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Row, Col, message, Popconfirm, Card, DatePicker } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSales, setFilters } from "../../features/sales/salesSlice";
import type { RootState } from "../../store";
import SaleForm from "../../components/sales/SaleForm";
import dayjs from "dayjs";
import SaleDetailModal from "../../components/sales/SaleDetailModal";
const { RangePicker } = DatePicker;


const SaleList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters  } = useAppSelector((s: RootState) => s.sales);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

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
      dispatch(fetchSales({ dateFrom: dateStrings[0], dateTo: dateStrings[1] }));
      dispatch(setFilters({ dateFrom: dateStrings[0], dateTo: dateStrings[1] }));
    }
  };

    const totalVentas = items.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  const totalPagado = items.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
  const totalPendiente = totalVentas - totalPagado;

  const handleDelete = async (_id: number) => {
    try {
      //   await dispatch(deleteSale(id)).unwrap();
      message.success("Venta eliminada");
      dispatch(fetchSales());
    } catch (err: any) {
      message.error(err.message || "Error al eliminar venta");
    }
  };

  // const handleRangeChange = (dates: any) => {
  //   setRange(dates);
  //   if (dates) {
  //     dispatch(fetchSales());
  //   } else {
  //     // Si borra filtro, vuelve a cargar HOY
  //     dispatch(fetchSales());
  //   }
  // };

  const columns = [
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (v: string) => dayjs(v).format("YYYY-MM-DD"),
    },
    {
      title: "Cliente",
      dataIndex: "customerName",
      key: "customerName",
      render: (v: string | null) => v || <Tag color="default">Sin nombre</Tag>,
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v: number) => `$${v.toLocaleString()}`,
    },
    {
      title: "Pagado",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (v: number, r: any) =>
        r.isPaid ? (
          <Tag color="green">Pagada</Tag>
        ) : (
          <>
            <Tag color="orange">Pendiente</Tag>
            <span>${v.toLocaleString()}</span>
          </>
        ),
    },
    {
      title: "Método de pago",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (v: string) => v || <Tag color="default">No registrado</Tag>,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: any) => (
        <>
          {/* Aquí podrías agregar un botón de "Ver detalle" si quieres */}
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Ver detalle
          </Button>
          <Popconfirm
            title="¿Eliminar venta?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button danger type="link" size="small">
              Eliminar
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <h1 className="text-2xl font-semibold">Ventas</h1>
          <p className="text-gray-600">Historial de ventas y registros</p>
        </Col>
        <Col>
          <Button type="primary" size="small" onClick={handleOpenModal}>
            Nueva venta
          </Button>
        </Col>
      </Row>

            <Card className="mb-4">
        <RangePicker
          allowClear={false}
          value={[
            filters.dateFrom ? dayjs(filters.dateFrom) : undefined,
            filters.dateTo ? dayjs(filters.dateTo) : undefined,
          ]}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
          style={{ marginRight: 16 }}
        />
        <b>Ventas totales:</b> ${totalVentas.toLocaleString()} &nbsp;&nbsp;
        <b>Pagado:</b> ${totalPagado.toLocaleString()} &nbsp;&nbsp;
        <b>Pendiente:</b> <span style={{ color: totalPendiente > 0 ? 'red' : 'green' }}>${totalPendiente.toLocaleString()}</span>
      </Card>

      <Card className="shadow-sm">
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
          size="middle"
        />
        {error && <div className="text-red-500 mt-2">{error}</div>}
      </Card>

      {/* Modal de nueva venta */}
      <SaleForm
        open={isModalOpen}
        onClose={handleCloseModal}
        onSaved={handleAfterSave}
      />

      <SaleDetailModal
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        sale={selectedSale}
      />
    </div>
  );
};

export default SaleList;
