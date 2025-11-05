import React, { useEffect } from "react";
import { Modal, Form, Input, Select } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import { fetchRoles } from "../../features/roles/rolesSlice"; // Si tienes slice de roles
import { createUser, updateUser } from "../../features/users/userSlice";

const { Option } = Select;

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: any;
  onSaved?: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ open, onClose, user, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { items: roleList } = useAppSelector((s) => s.roles); // slice de roles
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!roleList.length) dispatch(fetchRoles());
    if (open) {
      if (user) {
        form.setFieldsValue({
          ...user,
          roleIds: user.roles.map((ur: any) => ur.role.id),
          password: "",
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, user, roleList, dispatch, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (user) {
        // Editar - NO enviar username, solo enviar password si no está vacío
        const updateData: any = {
          name: values.name,
          roleIds: values.roleIds,
        };
        
        // Solo incluir password si se ingresó uno nuevo
        if (values.password && values.password.trim() !== '') {
          updateData.password = values.password;
        }
        
        await dispatch(
          updateUser({ id: user.id, data: updateData })
        ).unwrap();
      } else {
        // Crear - enviar todos los campos
        await dispatch(createUser(values)).unwrap();
      }
      
      setLoading(false);
      onSaved?.();
      onClose();
      form.resetFields();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={user ? "Editar usuario" : "Crear usuario"}
      onOk={handleOk}
      okButtonProps={{ loading }}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Usuario"
          rules={[
            { required: true, message: "Ingresa el usuario" },
          ]}
        >
          <Input disabled={!!user} placeholder="Nombre de usuario" />
        </Form.Item>
        <Form.Item
          name="name"
          label="Nombre"
          rules={[{ required: true, message: "Ingresa el nombre" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="password"
          label="Contraseña"
          rules={user ? [] : [{ required: true, message: "Ingresa la contraseña" }]}
          help={user ? "Deja en blanco para no cambiar la contraseña" : undefined}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name="roleIds"
          label="Roles"
          rules={[{ required: true, message: "Selecciona al menos un rol" }]}
        >
          <Select mode="multiple" placeholder="Selecciona roles">
            {roleList.map((role: any) => (
              <Option key={role.id} value={role.id}>
                {role.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserForm;
