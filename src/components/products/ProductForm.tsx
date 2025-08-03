// src/components/products/ProductForm.tsx
import React, { useEffect } from "react";
import { Form, Input, Select, Button, message, Row, Col, Tooltip } from "antd";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createProduct,
  fetchProducts,
  updateProduct,
} from "../../features/products/productSlice";
import type { Category, Product } from "../../features/products/types";
import { getUnits } from "../../features/units/unitsSlice";
import { getCategories } from "../../features/categories/categoriesSlice";

const { Option } = Select;
const { TextArea } = Input;

export interface Unit {
  id: number;
  name: string;
  symbol: string;
}

interface Props {
  product?: Product | null;
  onSaved: () => void;
}

const ProductForm: React.FC<Props> = ({ product, onSaved }) => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state: any) => state.products);
  const [loading, setLoading] = React.useState(false);
  const [units, setUnits] = React.useState<Unit[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);

  useEffect(() => {
    dispatch(getUnits()).unwrap().then(setUnits);
    dispatch(getCategories()).unwrap().then(setCategories);
    if (product) {
      form.setFieldsValue({
        ...product,
        unitId: product.unit?.id,
        categoryId: product.category?.id,
      });
    } else {
      form.resetFields();
    }
  }, [product, form, dispatch]);

  // Vista previa de imagen en tiempo real
  const imageUrl = Form.useWatch("imageUrl", form);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Procesar valores para convertir strings a números
      const processedValues = {
        ...values,
        purchasePrice: parseFloat(values.purchasePrice) || 0,
        salePrice: parseFloat(values.salePrice) || 0,
        stock: parseInt(values.stock) || 0,
        minStock: values.minStock ? parseInt(values.minStock) : 0, // Si está vacío, enviar 0
      };

      if (product) {
        await dispatch(
          updateProduct({ id: product.id, product: processedValues })
        ).unwrap();
        message.success("Producto actualizado exitosamente");
      } else {
        await dispatch(createProduct(processedValues)).unwrap();
        message.success("Producto creado exitosamente");
      }
      dispatch(fetchProducts(filters));
      onSaved();
    } catch (err: any) {
      message.error(err.message || "Error al guardar producto");
    } finally {
      setLoading(false);
    }
  };

  // Botón cancelar
  const handleCancel = () => {
    form.resetFields();
    onSaved();
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
        {/* Nombre */}
        <Form.Item
          label="Nombre del producto"
          name="name"
          hasFeedback
          rules={[
            { required: true, message: "El nombre es obligatorio" },
            { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
            { max: 100, message: "El nombre no puede exceder 100 caracteres" },
          ]}
        >
          <Input
            placeholder="Ej: Perfume Chanel No. 5"
            showCount
            maxLength={100}
          />
        </Form.Item>

        {/* Fila: Categoría y Unidad */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Categoría"
              name="categoryId"
              hasFeedback
              rules={[{ required: true, message: "Selecciona una categoría" }]}
            >
              <Select placeholder="Selecciona categoría">
                {categories.map((cat) => (
                  <Option value={cat.id} key={cat.id}>
                    {cat.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Unidad de medida"
              name="unitId"
              hasFeedback
              rules={[{ required: true, message: "Selecciona una unidad" }]}
            >
              <Select placeholder="Selecciona unidad">
                {units.map((unit) => (
                  <Option value={unit.id} key={unit.id}>
                    {unit.name} ({unit.symbol || unit.name})
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Imagen */}
        <Form.Item
          label="Imagen (URL)"
          name="imageUrl"
          rules={[{ type: "url", message: "Debe ser una URL válida" }]}
        >
          <Input placeholder="https://..." />
        </Form.Item>
        {imageUrl && (
          <div style={{ marginBottom: 16 }}>
            <img
              src={imageUrl}
              alt="Vista previa"
              style={{ maxWidth: 120, maxHeight: 80, borderRadius: 6 }}
            />
          </div>
        )}

        {/* Fila: Precios */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Precio de compra ($)"
              name="purchasePrice"
              hasFeedback
              rules={[
                { required: true, message: "El precio de compra es obligatorio" },
                { pattern: /^\d+(\.\d{1,2})?$/, message: "Formato inválido (ej: 123.45)" },
              ]}
            >
              <Input
                placeholder="0.00"
                prefix="$"
                onKeyDown={(e) => {
                  if (
                    !/[0-9.]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                  if (
                    e.key === "." &&
                    (e.target as HTMLInputElement).value.includes(".")
                  ) {
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
                    const purchasePrice = parseFloat(getFieldValue("purchasePrice"));
                    const salePrice = parseFloat(value);
                    if (!value || !purchasePrice || salePrice >= purchasePrice) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("El precio de venta debe ser mayor al precio de compra")
                    );
                  },
                }),
              ]}
            >
              <Input
                placeholder="0.00"
                prefix="$"
                onKeyDown={(e) => {
                  if (
                    !/[0-9.]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                  if (
                    e.key === "." &&
                    (e.target as HTMLInputElement).value.includes(".")
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Fila: Stock inicial y Stock mínimo */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Stock inicial"
              name="stock"
              hasFeedback
              rules={[
                { required: true, message: "El stock es obligatorio" },
                { pattern: /^\d+$/, message: "Solo se permiten números enteros" },
              ]}
            >
              <Input
                placeholder="0"
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <span>
                  Stock mínimo{" "}
                  <Tooltip title="Recibirás alerta cuando el stock esté igual o por debajo de este valor">
                    <span style={{ color: "#999", cursor: "pointer" }}>?</span>
                  </Tooltip>
                </span>
              }
              name="minStock"
              rules={[
                { pattern: /^\d+$/, message: "Solo se permiten números enteros" },
              ]}
            >
              <Input
                placeholder="0"
                onKeyDown={(e) => {
                  if (
                    !/[0-9]/.test(e.key) &&
                    ![
                      "Backspace",
                      "Delete",
                      "Tab",
                      "Escape",
                      "Enter",
                      "ArrowLeft",
                      "ArrowRight",
                      "ArrowUp",
                      "ArrowDown",
                    ].includes(e.key)
                  ) {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Descripción */}
        <Form.Item label="Descripción (opcional)" name="description">
          <TextArea
            placeholder="Describe las características del producto..."
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Botones */}
        <Row gutter={8} justify="end">
          <Col>
            <Button
              htmlType="submit"
              type="primary"
              loading={loading}
              size="small"
            >
              {product ? "Actualizar producto" : "Crear producto"}
            </Button>
          </Col>
          <Col>
            <Button onClick={handleCancel} disabled={loading} size="small">
              Cancelar
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default ProductForm;
