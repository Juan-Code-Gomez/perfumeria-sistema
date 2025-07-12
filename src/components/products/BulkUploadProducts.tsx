import React, { useState } from "react";
import { Modal, Upload, Table, Button, message, Alert } from "antd";
import { FileExcelOutlined, UploadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import type { RcFile } from "antd/es/upload";

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
  const [file, setFile] = useState<RcFile | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<any[]>([]);
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

    // Lee y previsualiza primeras filas
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      try {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (json.length === 0) {
          setError("El archivo está vacío.");
          setPreviewData(null);
          setColumns([]);
          return;
        }
        // Toma primeras 5 filas y primeras 10 columnas (ajusta si quieres)
        const preview = json.slice(0, 5).map((row: any) => row.slice(0, 10));
        setPreviewData(preview);
        if (preview.length > 0) {
          setColumns(
            preview[0].map((col: string, idx: number) => ({
              title: col || `Columna ${idx + 1}`,
              dataIndex: `col${idx}`,
              key: `col${idx}`,
              render: (_: any, row: any) => row[`col${idx}`],
            }))
          );
        }
        setError(null);
      } catch (err: any) {
        setError("No se pudo leer el archivo. Verifica el formato.");
        setPreviewData(null);
        setColumns([]);
      }
    };
    reader.readAsArrayBuffer(file);

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

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Ajusta la URL a la de tu backend
      const res = await fetch(`${import.meta.env.VITE_API_URL}/products/bulk-upload`, {
        method: "POST",
        body: formData,
        headers: {
          // "Authorization": "Bearer ...", // Si tu backend requiere auth
        },
      });

      const data = await res.json();
      if (res.ok) {
        message.success("Carga masiva exitosa");
        setFile(null);
        setPreviewData(null);
        setColumns([]);
        onUploaded();
        onClose();
      } else {
        setError(data?.message || "Error al subir el archivo");
      }
    } catch (err: any) {
      setError("Error al conectar con el servidor.");
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
      width={650}
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
        onRemove={() => {
          setFile(null);
          setPreviewData(null);
          setColumns([]);
        }}
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

      {/* Previsualización */}
      {previewData && previewData.length > 1 && (
        <div style={{ marginTop: 16 }}>
          <b>Previsualización:</b>
          <Table
            size="small"
            columns={columns}
            dataSource={previewData.slice(1).map((row, idx) => {
              const obj: any = {};
              row.forEach((val: any, i: number) => {
                obj[`col${i}`] = val;
              });
              obj.key = idx;
              return obj;
            })}
            pagination={false}
            bordered
            style={{ marginTop: 8, maxWidth: "100%" }}
          />
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
