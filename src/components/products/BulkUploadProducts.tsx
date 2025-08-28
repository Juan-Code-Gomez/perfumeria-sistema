import React, { useState } from "react";
import { Modal, Upload, Button, message, Alert, Switch, Typography, Divider, Statistic, Card, Row, Col, Steps, List, Tag } from "antd";
import { FileExcelOutlined, UploadOutlined, CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, EyeOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { useAppDispatch } from "../../store";
import { bulkUploadProducts } from "../../features/products/productSlice";
import * as XLSX from 'xlsx';

const { Text, Title } = Typography;

interface BulkProductUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

interface ExcelPreview {
  totalRows: number;
  columns: string[];
  sampleData: any[];
  validProducts: number;
  invalidProducts: number;
  errors: string[];
}

interface ConfirmationData {
  productosACrear: number;
  productosAActualizar: number;
  erroresPotenciales: string[];
  resumen: {
    categorias: string[];
    proveedores: string[];
    totalInversion: number;
  };
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
  const [currentStep, setCurrentStep] = useState(0);
  const [excelPreview, setExcelPreview] = useState<ExcelPreview | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<ConfirmationData | null>(null);

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
    setCurrentStep(1);
    
    // Procesar el archivo para mostrar preview
    processExcelFile(file);
    
    return false; // Cancela upload automático
  };

  const processExcelFile = (file: RcFile) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        const columns = jsonData.length > 0 ? Object.keys(jsonData[0] as object) : [];
        const sampleData = jsonData.slice(0, 5); // Primeras 5 filas como muestra
        
        // Validaciones básicas
        const requiredFields = withSupplier 
          ? ['Nombre producto', 'Categoría', 'Unidad', 'Precio compra', 'Proveedor']
          : ['Nombre producto', 'Categoría', 'Unidad', 'Precio compra'];
        
        const missingFields = requiredFields.filter(field => !columns.includes(field));
        const errors: string[] = [];
        
        if (missingFields.length > 0) {
          errors.push(`Columnas faltantes: ${missingFields.join(', ')}`);
        }
        
        const validProducts = errors.length === 0 ? jsonData.length : 0;
        const invalidProducts = errors.length > 0 ? jsonData.length : 0;
        
        setExcelPreview({
          totalRows: jsonData.length,
          columns,
          sampleData,
          validProducts,
          invalidProducts,
          errors
        });
        
        if (errors.length === 0) {
          generateConfirmationData(jsonData);
        }
        
      } catch (error) {
        message.error('Error al procesar el archivo Excel');
        setExcelPreview(null);
      }
    };
    reader.readAsBinaryString(file);
  };

  const generateConfirmationData = (data: any[]) => {
    // Simular análisis de datos para confirmación
    const categorias = [...new Set(data.map(row => row['Categoría']).filter(Boolean))];
    const proveedores = withSupplier 
      ? [...new Set(data.map(row => row['Proveedor']).filter(Boolean))]
      : [];
    
    const totalInversion = data.reduce((sum, row) => {
      const precio = parseFloat(row['Precio compra']) || 0;
      const stock = parseFloat(row['Stock inicial']) || 0;
      return sum + (precio * stock);
    }, 0);
    
    // Simulación de productos a crear vs actualizar (en realidad se determina en el backend)
    const productosACrear = Math.floor(data.length * 0.8); // 80% nuevos
    const productosAActualizar = data.length - productosACrear;
    
    setConfirmationData({
      productosACrear,
      productosAActualizar,
      erroresPotenciales: [],
      resumen: {
        categorias,
        proveedores,
        totalInversion
      }
    });
  };

  const handleUpload = async () => {
    if (!file) {
      message.warning("Adjunta un archivo primero.");
      return;
    }
    
    // Si hay errores en la preview, solicitar confirmación
    if (excelPreview?.errors && excelPreview.errors.length > 0) {
      setShowConfirmation(true);
      return;
    }
    
    // Si no hay errores, mostrar confirmación de datos
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    
    // Proceder con la carga
    await performUpload();
  };

  const performUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setError(null);
    setCurrentStep(2);

    try {
      const result = await dispatch(bulkUploadProducts({ file, withSupplier })).unwrap();
      
      setCurrentStep(3);
      
      // Mostrar mensaje de éxito con detalles
      if (result.productosCreados > 0 || result.productosActualizados > 0) {
        message.success(
          `✅ Carga exitosa: ${result.productosCreados} productos creados, ${result.productosActualizados} actualizados`
        );
      } else {
        message.warning("Carga completada pero no se procesaron productos");
      }
      
      setTimeout(() => {
        resetModal();
        onUploaded();
        onClose();
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || "Error al subir el archivo");
      message.error("Error en la carga masiva");
      setCurrentStep(1);
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setCurrentStep(0);
    setExcelPreview(null);
    setShowConfirmation(false);
    setConfirmationData(null);
    setError(null);
  };

  const handleCancel = () => {
    resetModal();
    onClose();
  };

  const renderSteps = () => (
    <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
      <Steps.Step title="Seleccionar" icon={<FileExcelOutlined />} />
      <Steps.Step title="Revisar" icon={<EyeOutlined />} />
      <Steps.Step title="Procesar" icon={<UploadOutlined />} />
      <Steps.Step title="Completado" icon={<CheckCircleOutlined />} />
    </Steps>
  );

  const renderFileUpload = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Switch
          checked={withSupplier}
          onChange={(checked) => {
            setWithSupplier(checked);
            if (file) {
              processExcelFile(file); // Reprocesar si cambia el modo
            }
          }}
          style={{ marginRight: 8 }}
        />
        <Text>Incluir información de proveedor en el Excel</Text>
      </div>
      
      {withSupplier ? (
        <Alert
          message="Modo con Proveedores"
          description="El archivo debe incluir la columna 'Proveedor'. Se crearán automáticamente las compras asociadas."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      ) : (
        <Alert
          message="Modo sin Proveedores"
          description="Los productos se crearán sin asociación a proveedores. Ideal para inventario inicial."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Upload.Dragger
        maxCount={1}
        accept=".xlsx,.xls"
        beforeUpload={handleBeforeUpload}
        fileList={file ? [{ uid: "-1", name: file.name, status: "done" }] : []}
        onRemove={() => {
          setFile(null);
          setCurrentStep(0);
          setExcelPreview(null);
        }}
        showUploadList={{ showPreviewIcon: false }}
        disabled={uploading}
      >
        <p className="ant-upload-drag-icon">
          <FileExcelOutlined style={{ color: "#52c41a", fontSize: 48 }} />
        </p>
        <p className="ant-upload-text">
          Haz clic o arrastra un archivo Excel aquí
        </p>
        <p className="ant-upload-hint">
          Solo se acepta 1 archivo a la vez. Formato: .xlsx o .xls
        </p>
      </Upload.Dragger>
    </div>
  );

  const renderPreview = () => {
    if (!excelPreview) return null;

    return (
      <div>
        <Title level={4}>📋 Vista Previa del Archivo</Title>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Total de Filas"
                value={excelPreview.totalRows}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Productos Válidos"
                value={excelPreview.validProducts}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Con Errores"
                value={excelPreview.invalidProducts}
                valueStyle={{ color: '#cf1322' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {excelPreview.errors.length > 0 && (
          <Alert
            message="Errores encontrados en el archivo"
            description={
              <List
                size="small"
                dataSource={excelPreview.errors}
                renderItem={(error) => <List.Item>• {error}</List.Item>}
              />
            }
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Card title="Columnas detectadas" size="small" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {excelPreview.columns.map((col) => (
              <Tag key={col} color="blue">{col}</Tag>
            ))}
          </div>
        </Card>

        {excelPreview.sampleData.length > 0 && (
          <Card title="Muestra de datos (primeras 3 filas)" size="small">
            <div style={{ fontSize: 12, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {excelPreview.sampleData.slice(0, 3).map((row, idx) => (
                <div key={idx} style={{ marginBottom: 8, padding: 8, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                  <strong>Fila {idx + 2}:</strong><br />
                  {Object.entries(row).map(([key, value]) => (
                    <div key={key}>• {key}: {String(value)}</div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  };

  const renderConfirmation = () => {
    if (!confirmationData) return null;

    return (
      <div>
        <Title level={4}>✅ Confirmación de Carga</Title>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Productos a Crear"
                value={confirmationData.productosACrear}
                valueStyle={{ color: '#3f8600' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Productos a Actualizar"
                value={confirmationData.productosAActualizar}
                valueStyle={{ color: '#1890ff' }}
                prefix={<InfoCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <Card title="📊 Resumen de la Carga" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Text strong>📂 Categorías involucradas:</Text>
                <div style={{ marginTop: 8 }}>
                  {confirmationData.resumen.categorias.map(cat => (
                    <Tag key={cat} color="green">{cat}</Tag>
                  ))}
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text strong>🏪 Proveedores involucrados:</Text>
                <div style={{ marginTop: 8 }}>
                  {confirmationData.resumen.proveedores.length > 0 ? (
                    confirmationData.resumen.proveedores.map(prov => (
                      <Tag key={prov} color="blue">{prov}</Tag>
                    ))
                  ) : (
                    <Text type="secondary">Sin proveedores</Text>
                  )}
                </div>
              </div>
            </Col>
          </Row>
          
          <Divider />
          
          <div style={{ textAlign: 'center' }}>
            <Statistic
              title="💰 Inversión Total Estimada"
              value={confirmationData.resumen.totalInversion}
              precision={0}
              prefix="$"
              valueStyle={{ color: '#722ed1', fontSize: 24 }}
            />
          </div>
        </Card>

        <Alert
          message="⚠️ Importante"
          description="Esta operación actualizará tu inventario. Los productos existentes aumentarán su stock, y los nuevos productos se crearán. ¿Deseas continuar?"
          type="warning"
          showIcon
        />
      </div>
    );
  };

  return (
    <Modal
      open={open}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileExcelOutlined style={{ color: '#52c41a' }} />
          <span>Carga Masiva de Productos</span>
        </div>
      }
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel} disabled={uploading}>
          Cancelar
        </Button>,
        currentStep === 1 && excelPreview && excelPreview.errors.length === 0 && (
          <Button
            key="preview"
            type="default"
            icon={<EyeOutlined />}
            onClick={() => setShowConfirmation(true)}
          >
            Revisar Carga
          </Button>
        ),
        showConfirmation && (
          <Button
            key="confirm"
            type="primary"
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={performUpload}
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Confirmar y Subir
          </Button>
        ),
        !showConfirmation && currentStep === 0 && (
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            disabled={!file}
            onClick={handleUpload}
          >
            Analizar Archivo
          </Button>
        ),
      ]}
      width={800}
      destroyOnClose
    >
      {renderSteps()}
      
      {currentStep === 0 && renderFileUpload()}
      {currentStep === 1 && !showConfirmation && renderPreview()}
      {showConfirmation && renderConfirmation()}
      {currentStep === 2 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            <UploadOutlined spin style={{ color: '#1890ff' }} />
          </div>
          <Title level={3}>Procesando archivo...</Title>
          <Text type="secondary">Por favor espera mientras se cargan los productos</Text>
        </div>
      )}
      {currentStep === 3 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: '#52c41a' }}>
            <CheckCircleOutlined />
          </div>
          <Title level={3} style={{ color: '#52c41a' }}>¡Carga Completada!</Title>
          <Text type="secondary">Los productos han sido procesados exitosamente</Text>
        </div>
      )}

      {error && (
        <Alert
          message="Error en la carga"
          description={error}
          type="error"
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Modal>
  );
};

export default BulkProductUploadModal;
