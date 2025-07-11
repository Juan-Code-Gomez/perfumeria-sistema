import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Tag,
  Modal,
  Row,
  Col,
  message,
  Popconfirm,
  Card,
} from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchSales } from "../../features/sales/salesSlice";
import type { RootState } from "../../store";
import SaleForm from "../../components/sales/SaleForm";
import dayjs from "dayjs";
import SaleDetailModal from "../../components/sales/SaleDetailModal";

const SaleList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((s: RootState) => s.sales);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchSales());
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

  const handleDelete = async (id: number) => {
    try {
      //   await dispatch(deleteSale(id)).unwrap();
      message.success("Venta eliminada");
      dispatch(fetchSales());
    } catch (err: any) {
      message.error(err.message || "Error al eliminar venta");
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
