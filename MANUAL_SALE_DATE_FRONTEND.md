# Fecha Manual en Ventas - Frontend

## 📋 Resumen

Se ha implementado la funcionalidad de **fecha manual en ventas** en el frontend para permitir la migración de datos históricos desde cuadernos físicos al sistema.

## ✨ Características Implementadas

### 1. **Configuración del Sistema** (`CompanyConfig.tsx`)

- ✅ Nuevo parámetro visible en la pestaña **Sistema**
- ✅ Nombre display: **"Permitir fecha manual en ventas"**
- ✅ Descripción: "Para migración de datos históricos"
- ✅ Switch para activar/desactivar el parámetro
- ✅ Solo visible para usuarios **SUPER_ADMIN**
- ✅ Filtro por categoría 'pos' y 'sales'

**Ubicación**: `src/pages/company-config/CompanyConfig.tsx`

```tsx
getParameterDisplayName(key: string): string {
  'allow_manual_sale_date': 'Permitir fecha manual en ventas',
  ...
}
```

### 2. **Servicio de Parámetros** (`systemParametersService.ts`)

- ✅ Nuevo método: `isManualSaleDateEnabled()`
- ✅ Endpoint: `GET /system-parameters/pos/manual-sale-date-enabled`
- ✅ Integrado en `getPosConfiguration()` con propiedad `allowManualSaleDate`
- ✅ Cache actualizado para incluir el nuevo parámetro

**Ubicación**: `src/services/systemParametersService.ts`

```typescript
async isManualSaleDateEnabled(companyId?: number): Promise<boolean> {
  const response = await api.get('/system-parameters/pos/manual-sale-date-enabled', { params });
  return response.data.enabled;
}
```

### 3. **Interfaz POS** (`POSInterface.tsx`)

#### Campo de Fecha Manual

- ✅ Switch para activar/desactivar fecha manual
- ✅ DatePicker para seleccionar fecha histórica
- ✅ Validación: No permite fechas futuras
- ✅ Alert de advertencia cuando está en modo manual
- ✅ Formato de fecha: DD/MM/YYYY (visualización)
- ✅ Formato de envío: YYYY-MM-DD (backend)

**Ubicación**: Entre el campo Cliente y el Divider de Totales

```tsx
{posConfig.allowManualSaleDate && (
  <>
    <Divider />
    <div style={{ marginBottom: 16 }}>
      <Switch
        checked={useManualDate}
        onChange={(checked) => {
          setUseManualDate(checked);
          if (!checked) setManualSaleDate(null);
        }}
        checkedChildren="Manual"
        unCheckedChildren="Hoy"
      />
      
      {useManualDate && (
        <>
          <DatePicker
            value={manualSaleDate}
            onChange={setManualSaleDate}
            format="DD/MM/YYYY"
            disabledDate={(current) => current > dayjs().endOf('day')}
          />
          <Alert
            message="Modo fecha manual activado para migración de datos históricos"
            type="warning"
            showIcon
          />
        </>
      )}
    </div>
  </>
)}
```

#### Validación de Botón

- ✅ Botón "PROCESAR VENTA" deshabilitado si:
  - Switch de fecha manual está activo Y
  - No se ha seleccionado una fecha

```tsx
disabled={
  items.length === 0 || 
  (paymentMethod === 'Crédito' && !selectedClient?.name) ||
  (paymentMethod === 'Efectivo' && amountReceived < finalTotal) ||
  (useManualDate && !manualSaleDate) // Nueva validación
}
```

#### Envío de Datos

- ✅ Modificado `processSale()` y `processSaleWithMultiplePayments()`
- ✅ Determina fecha automáticamente:
  - **Modo Manual**: `manualSaleDate.format('YYYY-MM-DD')`
  - **Modo Normal**: `new Date().toISOString()`

```tsx
const saleDate = (useManualDate && manualSaleDate) 
  ? manualSaleDate.format('YYYY-MM-DD')
  : new Date().toISOString();
```

### 4. **Hook de Configuración** (`usePOSConfiguration.ts`)

- ✅ Estado inicial actualizado con `allowManualSaleDate: false`
- ✅ Carga automática desde el backend
- ✅ Actualización reactiva cuando cambia la configuración

## 🎯 Flujo de Usuario

### Para el Super Admin:

1. Ir a **Configuración** → Pestaña **Sistema**
2. Buscar "Permitir fecha manual en ventas"
3. Activar el switch
4. Confirmar el cambio

### Para el Vendedor/Usuario POS:

1. Abrir el **Punto de Venta**
2. Si el parámetro está activo, verá el campo de fecha debajo de Cliente
3. Por defecto está en modo "Hoy"
4. Para usar fecha manual:
   - Activar el switch "Manual"
   - Seleccionar la fecha histórica (no permite futuras)
   - Aparece alerta de advertencia
   - Completar la venta normalmente
5. Para volver a modo normal: Desactivar el switch

## 🔒 Validaciones

### Frontend:
- ✅ No permite seleccionar fechas futuras
- ✅ Requiere fecha seleccionada si el switch está activo
- ✅ Muestra alerta visual cuando está en modo manual
- ✅ Valida que existan productos en el carrito

### Backend:
- ✅ Verifica que el parámetro esté habilitado
- ✅ Rechaza fechas futuras con error 400
- ✅ Solo SUPER_ADMIN puede activar/desactivar el parámetro
- ✅ Parsea fecha en timezone local (GMT-5)

## 📁 Archivos Modificados

### Frontend:
```
src/
├── pages/
│   └── company-config/
│       └── CompanyConfig.tsx          # Agregado parámetro en Sistema tab
├── components/
│   └── sales/
│       └── POSInterface.tsx           # Agregado campo fecha manual
├── services/
│   └── systemParametersService.ts     # Agregado método isManualSaleDateEnabled()
└── hooks/
    └── usePOSConfiguration.ts         # Agregado allowManualSaleDate
```

### Backend (ya implementado):
```
src/
├── system-parameters/
│   ├── system-parameters.service.ts   # isManualSaleDateEnabled()
│   └── system-parameters.controller.ts # GET /pos/manual-sale-date-enabled
└── sale/
    └── sale.service.ts                # Validación de fecha manual
```

## 🧪 Pruebas Recomendadas

1. **Activación del Parámetro**:
   - [ ] Entrar como SUPER_ADMIN a Configuración
   - [ ] Activar "Permitir fecha manual en ventas"
   - [ ] Verificar que se guarde correctamente

2. **Visualización en POS**:
   - [ ] Abrir Punto de Venta
   - [ ] Verificar que aparezca el campo de fecha
   - [ ] Verificar que el switch funcione

3. **Venta con Fecha Manual**:
   - [ ] Agregar productos al carrito
   - [ ] Activar switch "Manual"
   - [ ] Seleccionar fecha pasada (ej: 01/10/2024)
   - [ ] Procesar venta
   - [ ] Verificar en la base de datos que la fecha sea correcta
   - [ ] Verificar en el reporte de ventas que aparezca con la fecha seleccionada

4. **Validaciones**:
   - [ ] Intentar seleccionar fecha futura (debe estar deshabilitada)
   - [ ] Activar switch sin seleccionar fecha (botón debe deshabilitarse)
   - [ ] Procesar venta sin activar el switch (debe usar fecha de hoy)

5. **Desactivación del Parámetro**:
   - [ ] Desactivar el parámetro como SUPER_ADMIN
   - [ ] Verificar que el campo desaparezca del POS
   - [ ] Verificar que las ventas usen fecha actual

## 🚀 Despliegue

### Pasos para producción:

1. **Backend** (si no está desplegado):
   ```bash
   cd backend-perfumeria
   npm run build
   # Railway auto-deploy
   ```

2. **Frontend**:
   ```bash
   cd perfumeria-sistema
   npm run build
   # Desplegar dist/ a tu servidor
   ```

3. **Base de Datos** (ejecutar SQL):
   ```sql
   -- Si el parámetro no existe
   \i add-manual-sale-date-parameter.sql
   
   -- Para activar (opcional)
   \i enable-manual-sale-date.sql
   ```

## 💡 Casos de Uso

### Caso 1: Migración de Ventas Históricas
**Situación**: Cliente tiene cuadernos con ventas de septiembre 2024.

**Flujo**:
1. SUPER_ADMIN activa el parámetro
2. Usuario ingresa a POS
3. Activa fecha manual
4. Selecciona 15/09/2024
5. Registra la venta con los productos del cuaderno
6. Repite para cada venta histórica

### Caso 2: Corrección de Venta del Día Anterior
**Situación**: Se olvidó registrar una venta de ayer.

**Flujo**:
1. Usuario activa fecha manual
2. Selecciona la fecha de ayer
3. Registra la venta
4. Vuelve a modo "Hoy" para ventas actuales

### Caso 3: Operación Normal
**Situación**: Operación diaria sin datos históricos.

**Flujo**:
1. Usuario NO activa fecha manual (switch en "Hoy")
2. Registra ventas normalmente
3. Sistema usa fecha y hora actual automáticamente

## 🔧 Troubleshooting

### El campo de fecha no aparece:
- Verificar que el parámetro esté activo en Configuración
- Refrescar la página del POS
- Verificar que `posConfig.allowManualSaleDate` sea `true` en console

### Error al procesar venta con fecha manual:
- Verificar que la fecha no sea futura
- Verificar que el backend tenga el parámetro habilitado
- Revisar console del navegador para errores

### La fecha guardada es incorrecta:
- Verificar que el backend use `timezone.util.ts` para parsear fechas
- Verificar el timezone de la base de datos
- Verificar el formato de envío (YYYY-MM-DD)

## 📝 Notas Importantes

1. **Solo SUPER_ADMIN** puede activar/desactivar el parámetro
2. **No permite fechas futuras** por validación de negocio
3. **Formato display**: DD/MM/YYYY (amigable para Colombia)
4. **Formato backend**: YYYY-MM-DD (estándar ISO)
5. **Timezone**: GMT-5 (Colombia) manejado con `parseLocalDate()`
6. **Cache**: El POS cachea la configuración por 5 minutos
7. **Alerta visual**: Siempre muestra advertencia cuando está en modo manual

## 🎨 UI/UX

- **Switch compacto**: "Manual" vs "Hoy" para claridad
- **Alerta amarilla**: Advertencia visual cuando está activo
- **DatePicker estándar**: Ant Design con validación integrada
- **Fecha actual visible**: Cuando está en modo "Hoy"
- **Icono de calendario**: Para fácil identificación

## 📊 Impacto

- ✅ Permite migración de datos históricos
- ✅ No afecta operación normal del POS
- ✅ Validaciones robustas en frontend y backend
- ✅ Interfaz intuitiva y clara
- ✅ Fácil de activar/desactivar según necesidad
- ✅ Auditable: cada venta tiene su fecha correcta

---

**Autor**: GitHub Copilot  
**Fecha**: 2025  
**Proyecto**: Sistema de Perfumería Milán
