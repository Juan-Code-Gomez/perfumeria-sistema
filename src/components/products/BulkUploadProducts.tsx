import React, { useState } from "react";
import { Modal, Upload, Button, message, Alert, Switch, Typography } from "antd";
import { FileExcelOutlined, UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { useAppDispatch } from "../../store";
import { bulkUploadProducts } from "../../features/products/productSlice";

const { Text } = Typography;

interface BulkProductUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

const BulkProductUploadModal: React.FC<BulkProductUploadModalProps> = ({
  open,
  onClose,
  onUploaded,
}) => {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<RcFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [withSupplier, setWithSupplier] = useState(false);

  const handleBeforeUpload = (file: RcFile) => {
    const isExcel =
      file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      message.error("Solo se permiten archivos Excel (.xlsx, .xls)");
      return Upload.LIST_IGNORE;
    }

    setFile(file);
    return false; // Cancela upload automático
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning("Adjunta un archivo primero.");
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const result = await dispatch(bulkUploadProducts({ file, withSupplier })).unwrap();
      
      // Mostrar mensaje de éxito con detalles
      if (result.productosCreados > 0 || result.productosActualizados > 0) {
        message.success(
          `Carga exitosa: ${result.productosCreados} productos creados, ${result.productosActualizados} actualizados`
        );
      } else {
        message.warning("Carga completada pero no se procesaron productos");
      }
      
      setFile(null);
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al subir el archivo");
      message.error("Error en la carga masiva");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      title="Carga Masiva de Productos"
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={uploading}>
          Cancelar
        </Button>,
        <Button
          key="upload"
          type="primary"
          icon={<UploadOutlined />}
          loading={uploading}
          onClick={handleUpload}
          disabled={!file || uploading}
        >
          Subir
        </Button>,
      ]}
      width={450}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Switch
          checked={withSupplier}
          onChange={setWithSupplier}
          style={{ marginRight: 8 }}
        />
        <Text>Incluir información de proveedor en el Excel</Text>
      </div>
      
      {withSupplier ? (
        <div>
          <p>
            Adjunta un archivo Excel con la plantilla que incluye columna "Proveedor". 
            El sistema validará productos existentes, actualizará stock o los creará 
            asociándolos al proveedor correspondiente.
          </p>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            💡 <strong>Cálculo automático:</strong> Precio de venta es opcional. Si no lo especificas, se calculará automáticamente:
            <br />• <strong>Perfumes 1.1:</strong> +80% sobre precio de compra
            <br />• <strong>Otras categorías:</strong> +60% sobre precio de compra
            <br />• Solo se requiere: <strong>Nombre producto, Categoría, Unidad, Precio compra, Proveedor</strong>
          </p>
        </div>
      ) : (
        <div>
          <p>
            Adjunta un archivo Excel con productos <strong>sin proveedor</strong>. 
            Los productos se crearán o actualizarán sin asociación a proveedores.
            Ideal para cargas de inventario inicial.
          </p>
          <p style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
            💡 <strong>Cálculo automático:</strong> Precio de venta es opcional. Si no lo especificas, se calculará automáticamente:
            <br />• <strong>Perfumes 1.1:</strong> +80% sobre precio de compra
            <br />• <strong>Otras categorías:</strong> +60% sobre precio de compra
            <br />• Solo se requiere: <strong>Nombre producto, Categoría, Unidad, Precio compra</strong>
          </p>
        </div>
      )}
      <Upload.Dragger
        maxCount={1}
        accept=".xlsx,.xls"
        beforeUpload={handleBeforeUpload}
        fileList={
          file
            ? [
                {
                  uid: "-1",
                  name: file.name,
                  status: "done",
                },
              ]
            : []
        }
        onRemove={() => setFile(null)}
        showUploadList={{ showPreviewIcon: false }}
        disabled={uploading}
        style={{ marginBottom: 16 }}
      >
        <p className="ant-upload-drag-icon">
          <FileExcelOutlined style={{ color: "#52c41a" }} />
        </p>
        <p className="ant-upload-text">
          Haz clic o arrastra un archivo Excel aquí
        </p>
        <p className="ant-upload-hint" style={{ fontSize: 13 }}>
          Solo se acepta 1 archivo a la vez. Formato: .xlsx o .xls
        </p>
      </Upload.Dragger>

      {/* Mostramos el nombre del archivo seleccionado */}
      {file && (
        <div style={{ marginTop: 10, color: "#666" }}>
          <b>Archivo seleccionado:</b> {file.name}
        </div>
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginTop: 12, marginBottom: 0 }}
        />
      )}
    </Modal>
  );
};

export default BulkProductUploadModal;
