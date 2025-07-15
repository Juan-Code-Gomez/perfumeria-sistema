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
} from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSales, setFilters, addSalePayment } from "../../features/sales/salesSlice";
import type { RootState } from "../../store";
import SaleForm from "../../components/sales/SaleForm";
import dayjs from "dayjs";
import SaleDetailModal from "../../components/sales/SaleDetailModal";
const { RangePicker } = DatePicker;
const { Option } = Select;

const paymentMethods = ["Efectivo", "Transferencia", "Tarjeta", "Otro"];

const SaleList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error, filters } = useAppSelector((s: RootState) => s.sales);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  // Estado para modal de abono
  const [abonoModal, setAbonoModal] = useState<{ open: boolean; sale: any | null }>({ open: false, sale: null });
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
      dispatch(fetchSales({ dateFrom: dateStrings[0], dateTo: dateStrings[1] }));
      dispatch(setFilters({ dateFrom: dateStrings[0], dateTo: dateStrings[1] }));
    }
  };

  const totalVentas = items.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
  const totalPagado = items.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
  const totalPendiente = totalVentas - totalPagado;

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
      message.warning("Ingresa un valor válido");
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
      message.success("Abono registrado");
      setAbono(0);
      setNote("");
      setMethod("Efectivo");
      setAbonoModal({ open: false, sale: null });
      dispatch(fetchSales(filters)); // Refresca ventas según filtros actuales
    } catch (err: any) {
      message.error(err.message || "Error al abonar");
    }
  };

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
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Ver detalle
          </Button>
          {!record.isPaid && (
            <Button
              type="link"
              size="small"
              onClick={() => setAbonoModal({ open: true, sale: record })}
              style={{ color: "#1677ff" }}
            >
              Abonar
            </Button>
          )}
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
        <b>Pendiente:</b>{" "}
        <span style={{ color: totalPendiente > 0 ? "red" : "green" }}>
          ${totalPendiente.toLocaleString()}
        </span>
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

      {/* Modal de abono */}
      <Modal
        open={abonoModal.open}
        title={`Registrar abono a venta #${abonoModal.sale?.id}`}
        onCancel={() => setAbonoModal({ open: false, sale: null })}
        onOk={handleAbonar}
        okText="Registrar"
        destroyOnClose
      >
        <p>
          <b>Cliente:</b> {abonoModal.sale?.customerName || "Sin nombre"}
        </p>
        <p>
          <b>Pendiente:</b>{" "}
          $
          {abonoModal.sale
            ? ((abonoModal.sale.totalAmount || 0) -
               (abonoModal.sale.paidAmount || 0)
              ).toLocaleString()
            : "0"}
        </p>
        <InputNumber
          min={1}
          max={
            abonoModal.sale
              ? (abonoModal.sale.totalAmount || 1) -
                (abonoModal.sale.paidAmount || 0)
              : 1
          }
          value={abono}
          onChange={(val) => setAbono(Number(val))}
          placeholder="Valor del abono"
          style={{ width: "100%" }}
        />
        <div style={{ marginTop: 8 }}>
          <Select value={method} onChange={setMethod} style={{ width: "100%" }}>
            {paymentMethods.map((m) => (
              <Option key={m} value={m}>
                {m}
              </Option>
            ))}
          </Select>
        </div>
        <div style={{ marginTop: 8 }}>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Observaciones (opcional)"
          />
        </div>
      </Modal>
    </div>
  );
};

export default SaleList;
