// src/components/products/ProductForm.tsx
import React, { useEffect } from "react";
import { Form, Input, Select, Button, message, Row, Col, Tooltip, Segmented, Upload } from "antd";
import { UploadOutlined, LinkOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  createProduct,
  fetchProducts,
  updateProduct,
} from "../../features/products/productSlice";
import type { Category } from "../../features/products/types";
import type { Product } from "../../services/productService";
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
  const [imageMode, setImageMode] = React.useState<'url' | 'upload'>('url');

  useEffect(() => {
    dispatch(getUnits({})).unwrap().then(setUnits);
    dispatch(getCategories({})).unwrap().then(setCategories);
    if (product) {
      form.setFieldsValue({
        ...product,
        unitId: product.unit?.id,
        categoryId: product.category?.id,
      });
      // Si el producto tiene imagen base64, mostrar modo upload; si es URL normal, modo url
      if (product.imageUrl?.startsWith('data:')) {
        setImageMode('upload');
      } else {
        setImageMode('url');
      }
    } else {
      form.resetFields();
      setImageMode('url');
      // Establecer valores por defecto para productos nuevos
      form.setFieldsValue({
        salesType: 'VENTA'
      });
    }
  }, [product, form, dispatch]);

  // Vista previa de imagen en tiempo real
  const imageUrl = Form.useWatch("imageUrl", form);

  // Convierte archivo seleccionado a base64 y lo guarda en el campo imageUrl
  const handleImageUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Solo se permiten archivos de imagen (JPG, PNG, WEBP, GIF)');
      return false;
    }
    const isLt3M = file.size / 1024 / 1024 < 3;
    if (!isLt3M) {
      message.error('La imagen no puede superar 3 MB');
      return false;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      form.setFieldValue('imageUrl', base64);
    };
    reader.readAsDataURL(file);
    return false; // Evitar que Ant Design suba automáticamente
  };
  
  // Observar el tipo de producto para validaciones condicionales
  const salesType = Form.useWatch("salesType", form);

  // Efecto para manejar cambios en el tipo de producto
  useEffect(() => {
    if (salesType === 'INSUMO' || salesType === 'COMBO') {
      // Si cambia a insumo o combo, establecer precio de venta en 0
      form.setFieldsValue({ salePrice: 0 });
    }
  }, [salesType, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Procesar valores para convertir strings a números
      const processedValues = {
        ...values,
        purchasePrice: parseFloat(values.purchasePrice) || 0,
        // Si es insumo o combo, forzar precio de venta a 0
        salePrice: (values.salesType === 'INSUMO' || values.salesType === 'COMBO') 
          ? 0 
          : parseFloat(values.salePrice) || 0,
        stock: parseInt(values.stock) || 0,
        minStock: values.minStock ? parseInt(values.minStock) : 0, // Si está vacío, enviar 0
      };

      if (product) {
        const result = await dispatch(
          updateProduct({ id: product.id, product: processedValues })
        ).unwrap();
        console.log('Update result:', result);
        message.success("Producto actualizado exitosamente");
        // Después de actualizar, recargar la lista
        dispatch(fetchProducts(filters));
      } else {
        const result = await dispatch(createProduct(processedValues)).unwrap();
        console.log('Create result:', result);
        message.success("Producto creado exitosamente");
        // El producto ya se agrega automáticamente al estado por el Redux slice
      }
      onSaved(); // Cerrar el modal
      onSaved();
    } catch (err: any) {
      console.error('Error en onFinish:', err);
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

        {/* Tipo de Producto */}
        <Form.Item
          label="Tipo de Producto"
          name="salesType"
          hasFeedback
          rules={[{ required: true, message: "Selecciona el tipo de producto" }]}
          tooltip="Determina cómo se maneja el producto en las ventas"
        >
          <Select placeholder="Selecciona tipo">
            <Option value="VENTA">🛍️ Venta - Producto normal para vender</Option>
            <Option value="INSUMO">🔧 Insumo - Material que no se cobra</Option>
            <Option value="COMBO">📦 Combo - Conjunto de insumos</Option>
          </Select>
        </Form.Item>

        {/* Imagen */}
        <Form.Item label="Imagen del producto" style={{ marginBottom: 8 }}>
          <Segmented
            size="small"
            value={imageMode}
            onChange={(val) => {
              setImageMode(val as 'url' | 'upload');
              form.setFieldValue('imageUrl', undefined);
            }}
            options={[
              { label: <span><LinkOutlined /> URL</span>, value: 'url' },
              { label: <span><UploadOutlined /> Subir imagen</span>, value: 'upload' },
            ]}
            style={{ marginBottom: 8 }}
          />
        </Form.Item>

        {imageMode === 'url' ? (
          <Form.Item
            name="imageUrl"
            rules={[{ type: "url", message: "Debe ser una URL válida" }]}
            style={{ marginTop: -8 }}
          >
            <Input placeholder="https://ejemplo.com/imagen.jpg" />
          </Form.Item>
        ) : (
          <Form.Item name="imageUrl" style={{ marginTop: -8 }}>
            <Input type="hidden" />
          </Form.Item>
        )}

        {imageMode === 'upload' && (
          <div style={{ marginBottom: 16 }}>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} size="small">
                Seleccionar imagen
              </Button>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                JPG, PNG, WEBP · máx. 3 MB
              </span>
            </Upload>
          </div>
        )}

        {imageUrl && (
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <img
              src={imageUrl}
              alt="Vista previa"
              style={{ maxWidth: 100, maxHeight: 100, borderRadius: 6, objectFit: 'cover', border: '1px solid #d9d9d9' }}
            />
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={() => form.setFieldValue('imageUrl', undefined)}
            >
              Quitar
            </Button>
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
                // Solo requerido si NO es insumo o combo
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const currentSalesType = getFieldValue("salesType");
                    const isInsumoOrCombo = currentSalesType === 'INSUMO' || currentSalesType === 'COMBO';
                    
                    // Si es insumo o combo, no es obligatorio
                    if (isInsumoOrCombo) {
                      return Promise.resolve();
                    }
                    
                    // Si es producto de venta, sí es obligatorio
                    if (!value) {
                      return Promise.reject(new Error("El precio de venta es obligatorio para productos de venta"));
                    }
                    
                    return Promise.resolve();
                  },
                }),
                { 
                  pattern: /^\d+(\.\d{1,2})?$/, 
                  message: "Formato inválido (ej: 123.45)" 
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const currentSalesType = getFieldValue("salesType");
                    const isInsumoOrCombo = currentSalesType === 'INSUMO' || currentSalesType === 'COMBO';
                    
                    // Si es insumo o combo, puede estar vacío o ser 0
                    if (isInsumoOrCombo && (!value || parseFloat(value) === 0)) {
                      return Promise.resolve();
                    }
                    
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
                placeholder={
                  (salesType === 'INSUMO' || salesType === 'COMBO') 
                    ? "0.00 (Sin costo)" 
                    : "0.00"
                }
                prefix="$"
                disabled={salesType === 'INSUMO' || salesType === 'COMBO'}
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
