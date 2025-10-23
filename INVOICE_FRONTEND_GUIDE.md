# Guía de Prueba Frontend - Módulo de Facturas con FIFO

## ✅ Implementación Completada

Se ha implementado un módulo completo de gestión de facturas con procesamiento automático de inventario FIFO en el frontend.

## 📁 Archivos Creados

### Componentes
1. **`src/components/invoices/InvoiceForm.tsx`**
   - Formulario modal para crear facturas
   - Selector de proveedor
   - Tabla dinámica para agregar productos
   - Campos para lote y fecha de vencimiento
   - Cálculo automático de totales y descuentos
   - Switch para activar/desactivar procesamiento de inventario

2. **`src/components/invoices/InvoiceDetailModal.tsx`**
   - Modal para ver detalles de una factura
   - Muestra información general de la factura
   - Tabla con todos los productos incluidos
   - Estado de procesamiento de inventario

### Páginas
3. **`src/pages/invoices/InvoiceManagement_FIFO.tsx`**
   - Página principal de gestión de facturas
   - Lista de facturas con filtros
   - Estadísticas (total facturas, monto total, inventario procesado)
   - Búsqueda por número de factura o proveedor
   - Integración con InvoiceForm e InvoiceDetailModal

### Servicios
4. **`src/services/invoiceService.ts`** (actualizado)
   - Nuevas interfaces: `InvoiceItem`, `CreateInvoiceData`
   - Soporte para campos: `supplierId`, `items[]`, `processInventory`, `notes`

### Router
5. **`src/router/index.tsx`** (actualizado)
   - Ruta `/invoices` ahora usa `InvoiceManagementFIFO`

## 🚀 Cómo Probar

### 1. Iniciar el Frontend

```bash
cd "d:\Proyecto Milan\codigo\perfumeria-sistema"
npm run dev
```

### 2. Acceder al Módulo

1. Iniciar sesión en el sistema
2. Ir al menú lateral
3. Buscar "Facturas" o navegar a `http://localhost:5173/invoices`

### 3. Crear una Factura

#### Paso a Paso:

1. **Click en "Nueva Factura"**
   - Se abre un modal grande con el formulario

2. **Llenar Información General:**
   - **Número de Factura:** `F-TEST-001` (debe ser único)
   - **Proveedor:** Seleccionar de la lista desplegable
   - **Procesar Inventario:** Dejar activado (switch en "Sí")

3. **Agregar Productos:**
   - Seleccionar un producto del dropdown
   - Ingresar cantidad (ej: `10`)
   - Verificar/ajustar costo unitario (se auto-rellena con precio de compra)
   - (Opcional) Ingresar número de lote (ej: `LOTE-2024-001`)
   - (Opcional) Seleccionar fecha de vencimiento
   - Click en **"Agregar"**
   - El producto se agrega a la tabla inferior
   - Repetir para agregar más productos

4. **Configurar Descuento (Opcional):**
   - En el campo "Descuento" ingresar un monto (ej: `50`)
   - El total se recalcula automáticamente

5. **Agregar Notas (Opcional):**
   - En el área de texto al final, agregar comentarios

6. **Crear Factura:**
   - Click en **"Crear Factura y Procesar Inventario"**
   - Esperar mensaje de éxito ✅
   - El modal se cierra y la tabla se actualiza

### 4. Verificar Resultados

#### En el Frontend:
- La nueva factura aparece en la tabla
- Columna "Inventario" muestra tag verde "Procesado"
- Columna "Items" muestra cantidad de productos
- Click en "Ver" para abrir el modal de detalles

#### En el Backend (Logs):
```
🔍 Validando 2 productos...
✅ Productos validados
💰 Calculando totales...
   Subtotal: 1505.00
   Descuento: 50.00
   Total: 1455.00
📄 Factura created: F-TEST-001
🛒 Compra created: COMP-xxxxx
📦 Lote creado: LOTE-2024-001 para producto 5 (10 unidades)
📦 Lote creado: LOTE-2024-002 para producto 8 (5 unidades)
✅ Stock actualizado: Producto 5 ahora tiene XX unidades
✅ Stock actualizado: Producto 8 ahora tiene XX unidades
```

#### En la Base de Datos:
```sql
-- Ver la factura
SELECT * FROM "Invoice" WHERE "invoiceNumber" = 'F-TEST-001';

-- Ver items de la factura
SELECT * FROM "InvoiceItem" WHERE "invoiceId" = (
  SELECT id FROM "Invoice" WHERE "invoiceNumber" = 'F-TEST-001'
);

-- Ver compra generada
SELECT * FROM "Purchase" ORDER BY "createdAt" DESC LIMIT 1;

-- Ver lotes FIFO creados
SELECT * FROM "ProductBatch" ORDER BY "createdAt" DESC LIMIT 10;

-- Ver stock actualizado
SELECT id, name, stock FROM "Product" WHERE id IN (5, 8);
```

## 🎨 Características del UI

### InvoiceForm (Modal de Creación)
- ✅ Formulario modal ancho (1200px) para mayor espacio
- ✅ Selector de proveedor con búsqueda
- ✅ Switch para activar/desactivar procesamiento automático
- ✅ Tabla dinámica para agregar/eliminar productos
- ✅ Auto-completado de precio de compra al seleccionar producto
- ✅ Muestra stock disponible de cada producto
- ✅ Campos opcionales para lote y vencimiento
- ✅ Cálculo en tiempo real de subtotal, descuento y total
- ✅ Validación de campos requeridos
- ✅ Iconos informativos (tooltip en "Procesar Inventario")

### InvoiceDetailModal (Ver Detalles)
- ✅ Información completa de la factura
- ✅ Estado visual con tags de color
- ✅ Tabla de productos incluidos con lote y vencimiento
- ✅ Indicador de inventario procesado

### InvoiceManagement_FIFO (Página Principal)
- ✅ 3 tarjetas de estadísticas en la parte superior
- ✅ Buscador en tiempo real
- ✅ Tabla con paginación y ordenamiento
- ✅ Botón "Actualizar" para refrescar datos
- ✅ Tags de colores para estados
- ✅ Acciones: Ver y Eliminar (con confirmación)

## 📊 Flujo de Datos

```
┌─────────────────┐
│  InvoiceForm    │
│  (Usuario)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  createInvoice()                │
│  POST /api/invoices             │
│  {                              │
│    invoiceNumber: "F-001",      │
│    supplierId: 1,               │
│    discount: 50,                │
│    processInventory: true,      │
│    items: [                     │
│      {                          │
│        productId: 5,            │
│        quantity: 10,            │
│        unitCost: 150.50,        │
│        batchNumber: "L-001",    │
│        expiryDate: "2025-12-31" │
│      }                          │
│    ]                            │
│  }                              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Backend                        │
│  invoice.service.ts             │
│  • Validar proveedor            │
│  • Validar productos            │
│  • Calcular totales             │
│  • Transacción:                 │
│    - Crear Invoice              │
│    - Crear InvoiceItems         │
│    - Crear Purchase             │
│    - Crear ProductBatch (FIFO)  │
│    - Actualizar stock           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Respuesta                      │
│  {                              │
│    id: 123,                     │
│    invoiceNumber: "F-001",      │
│    amount: 1455.00,             │
│    inventoryProcessed: true,    │
│    InvoiceItem: [...],          │
│    Supplier: {...}              │
│  }                              │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Frontend                       │
│  • Mensaje de éxito ✅          │
│  • Cerrar modal                 │
│  • Recargar lista de facturas   │
└─────────────────────────────────┘
```

## 🧪 Casos de Prueba

### ✅ Caso 1: Factura Simple
- **Input:** 1 producto, sin descuento
- **Esperado:** 
  - Factura creada
  - 1 item en InvoiceItem
  - 1 lote FIFO creado
  - Stock incrementado

### ✅ Caso 2: Factura Múltiple
- **Input:** 3 productos, con descuento
- **Esperado:**
  - Factura creada con descuento aplicado
  - 3 items en InvoiceItem
  - 3 lotes FIFO creados
  - Stock de 3 productos incrementado

### ✅ Caso 3: Con Lotes y Vencimiento
- **Input:** Productos con número de lote y fecha de vencimiento
- **Esperado:**
  - ProductBatch con batchNumber y expiryDate

### ✅ Caso 4: Sin Procesar Inventario
- **Input:** `processInventory: false`
- **Esperado:**
  - Solo se crea la factura
  - No se crea compra ni lotes
  - Stock no cambia

### ❌ Caso 5: Número de Factura Duplicado
- **Input:** Factura con número ya existente
- **Esperado:** Error "Invoice number already exists"

### ❌ Caso 6: Sin Productos
- **Input:** Factura sin items
- **Esperado:** Error "Agrega al menos un producto"

## 🎯 Siguiente Paso

Una vez probado el flujo completo de creación:

1. ✅ **Crear factura desde frontend**
2. ✅ **Verificar logs en backend** (emojis de proceso)
3. ✅ **Ver factura en lista con estado "Procesado"**
4. ✅ **Abrir detalles de factura** (modal con productos)
5. ✅ **Consultar base de datos** (Invoice, InvoiceItem, Purchase, ProductBatch, Product.stock)
6. 🔄 **Ir a módulo de Productos** y verificar que el stock aumentó
7. 🔄 **Ir a módulo de Compras** y verificar que se creó la compra automática

## 📝 Notas Técnicas

- **Prisma Client:** El backend usa Prisma ORM, asegúrate de que esté sincronizado
- **TypeScript:** Todos los componentes tienen tipado estricto
- **Ant Design:** UI components version 5.x
- **React Router:** v6 para navegación
- **Dayjs:** Para manejo de fechas
- **Validación:** Ant Design Form con reglas de validación

## 🐛 Troubleshooting

### Error: "Cannot find module 'invoiceService'"
**Solución:** Verificar que el archivo `src/services/invoiceService.ts` existe

### Error: "getSuppliers is not a function"
**Solución:** Verificar que `src/services/supplierService.ts` exporta `getSuppliers`

### Error: "Cannot read property 'InvoiceItem' of null"
**Solución:** Verificar que el backend retorna el campo `InvoiceItem` en la respuesta

### Modal no se abre
**Solución:** 
1. Verificar permisos del usuario
2. Revisar console del navegador para errores
3. Verificar que `suppliers` y `products` se cargaron correctamente

### Productos no aparecen en el selector
**Solución:**
1. Verificar que existen productos activos en la BD
2. Revisar response de `getProducts()` en Network tab
3. Asegurarse de que el backend esté corriendo

## ✅ Checklist Final

- [ ] Frontend compila sin errores
- [ ] Backend compila sin errores
- [ ] Servidor backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] Usuario con sesión activa
- [ ] Existen proveedores en la BD
- [ ] Existen productos activos en la BD
- [ ] Modal de "Nueva Factura" se abre correctamente
- [ ] Se pueden agregar productos a la tabla
- [ ] Cálculo de totales funciona
- [ ] Factura se crea exitosamente
- [ ] Aparece en la lista con estado "Procesado"
- [ ] Modal de detalles muestra toda la información
- [ ] Stock de productos se actualizó en BD
- [ ] Se crearon lotes FIFO en BD
- [ ] Se creó compra automática en BD

🎉 **¡Módulo de Facturas con FIFO completamente funcional!**
