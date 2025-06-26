// src/pages/sales/SalesHistory.tsx

import { useEffect } from 'react';
import { Table, Tag, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { fetchSales } from '../../features/sales/salesSlice';
import { format } from 'date-fns';
import { EyeOutlined } from '@ant-design/icons';

const SalesHistory = () => {
  const dispatch = useAppDispatch();
  const { salesList, loading } = useAppSelector((state: any) => state.sales);

  useEffect(() => {
    dispatch(fetchSales());
  }, [dispatch]);

  const columns: ColumnsType<any> = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: 'Cliente',
      dataIndex: 'customerName',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Fecha',
      dataIndex: 'date',
      render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      render: (value) => `$${value.toFixed(2)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'isPaid',
      render: (paid: boolean) => (
        <Tag color={paid ? 'green' : 'orange'}>
          {paid ? 'Pagado' : 'Pendiente'}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          type="primary"
          onClick={() => handleViewInvoice(record.id)}
        >
          Ver factura
        </Button>
      ),
    },
  ];

  const handleViewInvoice = (saleId: number) => {
    // Aquí navegarás a la vista de factura o abrirás un modal.
    console.log('Ver factura de venta:', saleId);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Historial de Ventas</h2>
      <Table
        columns={columns}
        dataSource={salesList}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default SalesHistory;
