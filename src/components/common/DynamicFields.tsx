// src/components/common/DynamicFields.tsx
import { Form, Input, InputNumber, Select, DatePicker, Switch } from 'antd';
import { useFeatures } from '../../hooks/useFeatures';

interface DynamicFieldsProps {
  /**
   * Módulo para el cual obtener campos personalizados
   */
  module: string;
  
  /**
   * Si es true, solo muestra campos en modo lectura
   */
  readOnly?: boolean;
}

/**
 * Componente para renderizar campos personalizados dinámicamente
 * basado en la configuración del tenant
 * 
 * Uso:
 * <Form>
 *   <Form.Item label="Nombre" name="name">
 *     <Input />
 *   </Form.Item>
 *   
 *   <DynamicFields module="PRODUCTS" />
 * </Form>
 */
export const DynamicFields = ({ module, readOnly = false }: DynamicFieldsProps) => {
  const { getCustomFields } = useFeatures();
  
  // Manejo defensivo de errores
  let customFields: any[] = [];
  try {
    customFields = getCustomFields(module) || [];
  } catch (error) {
    console.error('[DynamicFields] Error al obtener custom fields:', error);
    return null;
  }

  if (!customFields || customFields.length === 0) {
    return null;
  }

  return (
    <>
      {customFields.map((field) => {
        // Validación defensiva de cada campo
        if (!field || !field.name || !field.label) {
          console.warn('[DynamicFields] Campo inválido:', field);
          return null;
        }

        const fieldProps = {
          disabled: readOnly,
          placeholder: field.label,
        };

        let fieldComponent;

        switch (field.type) {
          case 'text':
          case 'email':
          case 'tel':
            fieldComponent = <Input {...fieldProps} type={field.type} />;
            break;

          case 'textarea':
            fieldComponent = <Input.TextArea {...fieldProps} rows={3} />;
            break;

          case 'number':
            fieldComponent = (
              <InputNumber
                {...fieldProps}
                style={{ width: '100%' }}
                min={field.options?.min}
                max={field.options?.max}
                step={field.options?.step}
                precision={field.options?.precision}
              />
            );
            break;

          case 'select':
            fieldComponent = (
              <Select {...fieldProps} allowClear>
                {field.options?.options?.map((opt: any) => (
                  <Select.Option key={opt.value} value={opt.value}>
                    {opt.label}
                  </Select.Option>
                ))}
              </Select>
            );
            break;

          case 'date':
            fieldComponent = <DatePicker {...fieldProps} style={{ width: '100%' }} />;
            break;

          case 'boolean':
            fieldComponent = <Switch disabled={readOnly} />;
            break;

          default:
            fieldComponent = <Input {...fieldProps} />;
        }

        return (
          <Form.Item
            key={field.id}
            label={field.label}
            name={['customFields', field.name]}
            rules={[{ required: field.required, message: `${field.label} es requerido` }]}
          >
            {fieldComponent}
          </Form.Item>
        );
      })}
    </>
  );
};
