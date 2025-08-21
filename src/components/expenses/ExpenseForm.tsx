// src/components/expenses/ExpenseForm.tsx

import React, { useEffect } from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Select, Button } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

export interface Expense {
  id?: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  notes?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Si viene, estamos editando */
  expense?: Expense | null;
  /** Callback: crea o actualiza */
  onSave: (values: Omit<Expense, "id">) => Promise<void>;
}

const ExpenseForm: React.FC<Props> = ({ open, onClose, expense, onSave }) => {
  const [form] = Form.useForm();

  // Si cambiamos el expense, precarga el formulario
  useEffect(() => {
    if (expense) {
      form.setFieldsValue({
        ...expense,
        date: dayjs(expense.date),
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ paymentMethod: "Efectivo" });
    }
  }, [expense, form]);

  const handleFinish = async (vals: any) => {
    await onSave({
      ...vals,
      date: vals.date.format("YYYY-MM-DD"),
    });
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={expense ? "Editar gasto" : "Nuevo gasto"}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ paymentMethod: "Efectivo" }}
      >
        <Form.Item
          label="Fecha"
          name="date"
          rules={[{ required: true }]}
        >
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="Concepto"
          name="description"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Categoría"
          name="category"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="SERVICIOS">Servicios</Option>
            <Option value="SUMINISTROS">Suministros</Option>
            <Option value="ALQUILER">Alquiler</Option>
            <Option value="OTRO">Otro</Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Monto"
          name="amount"
          rules={[{ required: true }]}
        >
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
        <Form.Item
          label="Forma de pago"
          name="paymentMethod"
          rules={[{ required: true }]}
        >
          <Select>
            <Option value="Efectivo">Efectivo</Option>
            <Option value="Transferencia">Transferencia</Option>
            <Option value="Tarjeta">Tarjeta</Option>
            <Option value="Otro">Otro</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Notas" name="notes">
          <Input.TextArea />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            {expense ? "Actualizar" : "Guardar"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseForm;
