// src/pages/sales/SalesControl.tsx

import { useEffect, useState } from "react";
import { Table, Button, Space, Popconfirm, Tag, Typography, Modal } from "antd";
import { useAppDispatch, useAppSelector } from "../../store/index";
import { deleteSaleThunk, fetchSales } from "../../features/sales/salesSlice";
import type { Sale } from "../../types/SaleTypes";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import ReceiptView from './ReceiptView'

const { Title } = Typography;

export default function SalesControl() {
  const dispatch = useAppDispatch();
  const { salesList, loading } = useAppSelector((state) => state.sales);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const handleViewDetails = (record: Sale) => {
    setSelectedSale(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSale(null);
  };

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const handleRegister = () => {
    navigate("/sales/register"); // 👈 Asegúrate que esta ruta exista
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Cliente",
      dataIndex: "customerName",
      key: "customerName",
      render: (text: string) => text || "—",
    },
    {
      title: "Fecha",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: "Pagado",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      title: "Estado",
      dataIndex: "isPaid",
      key: "isPaid",
      render: (isPaid: boolean) =>
        isPaid ? (
          <Tag color="green">Pagada</Tag>
        ) : (
          <Tag color="orange">Pendiente</Tag>
        ),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Sale) => (
        <Space>
          <Button type="link" size="small">
            Editar
          </Button>
          <Popconfirm
            title="¿Seguro que deseas eliminar esta venta?"
            onConfirm={() => dispatch(deleteSaleThunk(record.id))}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger size="small">
              Eliminar
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => handleViewDetails(record)}>
            Ver detalle
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title level={3}>Historial de Ventas</Title>
      <Button type="primary" onClick={handleRegister}>
        Registrar Venta
      </Button>
      <Table
        columns={columns}
        dataSource={salesList}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
      <Modal
  open={isModalOpen}
  onCancel={handleCloseModal}
  footer={null}
  width={400}
>
  {selectedSale && <ReceiptView sale={selectedSale} />}
</Modal>
    </div>
  );
}
