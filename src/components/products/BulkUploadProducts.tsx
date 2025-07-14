import React, { useState } from "react";
import { Modal, Upload, Button, message, Alert } from "antd";
import { FileExcelOutlined, UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { useAppDispatch } from "../../store";
import { bulkUploadProducts } from "../../features/products/productSlice";

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
      await dispatch(bulkUploadProducts(file)).unwrap();
      message.success("Carga masiva exitosa");
      setFile(null);
      onUploaded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al subir el archivo");
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
      <p>
        Adjunta un archivo Excel con la plantilla proporcionada. El sistema validará
        productos existentes, actualizará stock o los creará según corresponda.
      </p>
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
