import React from "react";
import { Modal, Form, Input, InputNumber, DatePicker, Button, Select, message } from "antd";
import { useAppDispatch } from "../../store";
import { createExpense, fetchExpenses } from "../../features/expenses/expenseSlice";
import dayjs from "dayjs";

const { Option } = Select;

interface ExpenseFormProps {
  open: boolean;
  onClose: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ open, onClose }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = React.useState(false);

  const handleSubmit = async (values: any) => {
    setSaving(true);
    try {
      await dispatch(
        createExpense({
          ...values,
          date: values.date.format("YYYY-MM-DD"),
        })
      ).unwrap();
      message.success("Gasto registrado correctamente");
      form.resetFields();
      dispatch(fetchExpenses());
      onClose();
    } catch (err: any) {
      message.error(err.message || "Error al registrar gasto");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Nuevo gasto"
      width={400}
      destroyOnClose
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          paymentMethod: "Efectivo",
        }}
      >
        <Form.Item
          label="Fecha"
          name="date"
          rules={[{ required: true, message: "Selecciona la fecha" }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Concepto"
          name="concept"
          rules={[{ required: true, message: "Describe el gasto" }]}
        >
          <Input placeholder="Ej: Pago de servicios" />
        </Form.Item>
        <Form.Item
          label="Monto"
          name="amount"
          rules={[{ required: true, message: "Ingresa el monto" }]}
        >
          <InputNumber
            min={0}
            style={{ width: "100%" }}
            formatter={(v) => `$ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          />
        </Form.Item>
        <Form.Item
          label="Forma de pago"
          name="paymentMethod"
          rules={[{ required: true, message: "Selecciona forma de pago" }]}
        >
          <Select>
            <Option value="Efectivo">Efectivo</Option>
            <Option value="Transferencia">Transferencia</Option>
            <Option value="Tarjeta">Tarjeta</Option>
            <Option value="Otro">Otro</Option>
          </Select>
        </Form.Item>
        <Form.Item label="Notas" name="notes">
          <Input.TextArea placeholder="Detalle adicional (opcional)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} block>
            Guardar gasto
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ExpenseForm;
