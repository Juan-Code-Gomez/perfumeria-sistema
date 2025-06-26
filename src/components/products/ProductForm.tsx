// src/components/products/ProductForm.tsx
import React, { useEffect } from "react";
import { Form, Input, InputNumber, Select, Button, message, Row, Col } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  fetchProducts,
} from "../../features/products/productSlice";
import type { Product } from "../../features/products/types";

const { Option } = Select;
const { TextArea } = Input;

interface Props {
  /** Producto a editar; si es undefined, creamos nuevo */
  product?: Product | null;
  /** Callback tras guardar para cerrar modal y refrescar lista */
  onSaved: () => void;
}

const ProductForm: React.FC<Props> = ({ product, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state: any) => state.products);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (product) {
      form.setFieldsValue(product);
    } else {
      form.resetFields();
    }
  }, [product, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (product) {
        // Edición
        // await dispatch(updateProductThunk({ id: product.id, productData: values })).unwrap();
        message.success("Producto actualizado exitosamente");
      } else {
        // Creación
        // await dispatch(createProductThunk(values)).unwrap();
        message.success("Producto creado exitosamente");
      }
      // Refrescar lista con los filtros actuales
      dispatch(fetchProducts(filters));
      onSaved();
    } catch (err: any) {
      message.error(err.message || "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="small"
        className="max-w-2xl"
      >
        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item
              label="Nombre del producto"
              name="name"
              hasFeedback
              rules={[
                { required: true, message: "El nombre es obligatorio" },
                { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
                { max: 100, message: "El nombre no puede exceder 100 caracteres" }
              ]}
            >
              <Input 
                placeholder="Ej: Perfume Chanel No. 5"
                showCount
                maxLength={100}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={24}>
            <Form.Item 
              label="Descripción (opcional)" 
              name="description"
            >
              <TextArea 
                placeholder="Describe las características del producto..."
                rows={3}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Unidad de medida"
              name="unit"
              hasFeedback
              rules={[{ required: true, message: "Selecciona una unidad" }]}
            >
              <Select placeholder="Selecciona unidad">
                <Option value="ml">Mililitros (ml)</Option>
                <Option value="gr">Gramos (gr)</Option>
                <Option value="unit">Unidad</Option>
                <Option value="oz">Onzas (oz)</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Stock inicial"
              name="stock"
              hasFeedback
              rules={[
                { required: true, message: "El stock es obligatorio" },
                { pattern: /^\d+$/, message: "Solo se permiten números enteros" }
              ]}
            >
              <Input 
                placeholder="0"
                onKeyDown={(e) => {
                  // Solo permite números, backspace, delete, tab, escape, enter y teclas de navegación
                  if (
                    !/[0-9]/.test(e.key) && 
                    !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Precio de compra ($)"
              name="purchasePrice"
              hasFeedback
              rules={[
                { required: true, message: "El precio de compra es obligatorio" },
                { pattern: /^\d+(\.\d{1,2})?$/, message: "Formato inválido (ej: 123.45)" }
              ]}
            >
              <Input 
                placeholder="0.00"
                prefix="$"
                onKeyDown={(e) => {
                  // Permite números, punto decimal, backspace, delete, tab, escape, enter y teclas de navegación
                  if (
                    !/[0-9.]/.test(e.key) && 
                    !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                  // Solo permite un punto decimal
                  if (e.key === '.' && (e.target as HTMLInputElement).value.includes('.')) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Precio de venta ($)"
              name="salePrice"
              hasFeedback
              rules={[
                { required: true, message: "El precio de venta es obligatorio" },
                { pattern: /^\d+(\.\d{1,2})?$/, message: "Formato inválido (ej: 123.45)" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const purchasePrice = parseFloat(getFieldValue('purchasePrice'));
                    const salePrice = parseFloat(value);
                    if (!value || !purchasePrice || salePrice >= purchasePrice) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('El precio de venta debe ser mayor al precio de compra'));
                  },
                }),
              ]}
            >
              <Input 
                placeholder="0.00"
                prefix="$"
                onKeyDown={(e) => {
                  // Permite números, punto decimal, backspace, delete, tab, escape, enter y teclas de navegación
                  if (
                    !/[0-9.]/.test(e.key) && 
                    !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                  // Solo permite un punto decimal
                  if (e.key === '.' && (e.target as HTMLInputElement).value.includes('.')) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item className="mb-0 mt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                size="small"
              >
                {product ? "Actualizar producto" : "Crear producto"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductForm;
