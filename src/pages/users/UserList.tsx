// src/pages/users/UserList.tsx
import { Table, Button, Tag } from "antd";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUsers } from "../../features/users/userSlice";

const UserList = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.users);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const columns = [
    { title: "Usuario", dataIndex: "username", key: "username" },
    { title: "Nombre", dataIndex: "name", key: "name" },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: any[]) =>
        roles.map((ur) => <Tag key={ur.role.name}>{ur.role.name}</Tag>),
    },
    // Acciones de editar/eliminar aquí después
  ];

  return (
    <div>
      <h2>Usuarios del sistema</h2>
      <Button type="primary" style={{ marginBottom: 16 }}>
        Crear usuario
      </Button>
      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default UserList;
