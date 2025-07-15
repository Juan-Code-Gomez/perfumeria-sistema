import { useEffect, useState } from "react";
import { Table, Button, Tag, Popconfirm, message } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchUsers, deleteUser } from "../../features/users/userSlice";
import UserForm from "../../components/users/UserForm";

const UserList = () => {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.users);

  // Estados para modal de crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      message.success("Usuario eliminado");
    } catch (err) {
      message.error("Error al eliminar usuario");
    }
  };

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
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, user: any) => (
        <>
          <Button type="link" onClick={() => handleEdit(user)}>
            Editar
          </Button>
          <Popconfirm
            title="¿Seguro de eliminar este usuario?"
            onConfirm={() => handleDelete(user.id)}
            okText="Sí"
            cancelText="No"
          >
            <Button type="link" danger>
              Eliminar
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Usuarios del sistema</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={handleCreate}>
        Crear usuario
      </Button>
      <Table
        columns={columns}
        dataSource={items}
        loading={loading}
        rowKey="id"
      />
      <UserForm
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={editingUser}
        onSaved={() => dispatch(fetchUsers())}
      />
    </div>
  );
};

export default UserList;
