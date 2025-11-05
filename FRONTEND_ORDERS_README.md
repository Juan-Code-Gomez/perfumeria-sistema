# Frontend del Módulo de Pedidos

## 📁 Estructura de Archivos Creados

```
src/
├── types/
│   └── OrderTypes.ts                      # Tipos e interfaces TypeScript
├── services/
│   └── orderService.ts                    # Llamadas al API
├── components/
│   └── orders/
│       ├── index.ts                       # Exportaciones
│       ├── OrdersList.tsx                 # Componente principal con tabla
│       ├── CreateOrderModal.tsx           # Modal para crear pedidos
│       ├── OrderDetailModal.tsx           # Modal de detalle con historial
│       ├── ApproveOrderModal.tsx          # Modal de aprobación con pagos
│       └── EditOrderModal.tsx             # Modal para editar pedidos
├── pages/
│   └── orders/
│       └── OrdersPage.tsx                 # Página wrapper
└── router/
    └── index.tsx                          # Ruta /orders agregada
```

## 🎨 Componentes Creados

### 1. OrdersList.tsx
**Componente principal con tabla de pedidos**

**Características:**
- ✅ Tarjetas de estadísticas (Total, Pendientes, Aprobados, Monto Pendiente)
- ✅ Filtros por estado (PENDING, APPROVED, CANCELLED)
- ✅ Filtro por rango de fechas
- ✅ Botones de acción según rol del usuario
- ✅ Permisos dinámicos por rol
- ✅ Actualización automática después de cada acción

**Columnas de la tabla:**
- # Pedido
- Fecha
- Cliente
- Estado (con Tag colorizado)
- Total
- Creado por
- Aprobado por
- Productos (badge con cantidad)
- Acciones (Ver, Editar, Aprobar, Cancelar)

**Permisos implementados:**
```typescript
VENDEDOR: crear, ver propios pedidos
BODEGA: crear, ver todos, aprobar
CAJERO: crear, ver todos, editar, aprobar
ADMIN: todos los permisos + cancelar
```

---

### 2. CreateOrderModal.tsx
**Modal para crear nuevos pedidos**

**Características:**
- ✅ Selector de cliente (registrado u ocasional)
- ✅ Búsqueda asíncrona de productos con debounce
- ✅ Tabla dinámica de productos con agregar/eliminar
- ✅ Muestra stock disponible (stock - reservedStock)
- ✅ Validación de stock antes de crear
- ✅ Cálculo automático de totales
- ✅ Campo de observaciones

**Validaciones:**
- Al menos 1 producto
- Stock disponible suficiente
- Cantidades > 0
- Precios >= 0

---

### 3. OrderDetailModal.tsx
**Modal de detalle con 2 pestañas**

**Pestaña 1: Detalles**
- Información completa del pedido
- Estado con Tag colorizado
- Cliente y montos
- Usuarios (creador y aprobador)
- Tabla de productos con:
  - Nombre y SKU
  - Cantidad (muestra original si fue editada)
  - Precio unitario
  - Total
- Link a venta generada (si fue aprobado)
- Observaciones

**Pestaña 2: Historial**
- Timeline con todos los cambios
- Iconos por tipo de acción:
  - 🔵 CREATED
  - 🟠 EDITED
  - 🟢 APPROVED
  - 🔴 CANCELLED
- Muestra cambios detallados en JSON para ediciones:
  - Productos agregados
  - Productos eliminados
  - Cantidades modificadas

---

### 4. ApproveOrderModal.tsx
**Modal para aprobar y convertir en venta**

**Características:**
- ✅ Muestra productos del pedido (solo lectura)
- ✅ Tabla de formas de pago (múltiples métodos)
- ✅ Agregar/eliminar líneas de pago
- ✅ Validación: suma de pagos = total pedido
- ✅ Indicadores visuales:
  - Total Pedido
  - Total Pagos (verde/rojo según validación)
  - Diferencia
- ✅ Alerta si los pagos no coinciden

**Métodos de pago:**
- Efectivo
- Tarjeta de Débito
- Tarjeta de Crédito
- Transferencia
- QR
- Otro

---

### 5. EditOrderModal.tsx
**Modal para editar pedidos pendientes**

**Características:**
- ✅ Carga los detalles actuales del pedido
- ✅ Permite agregar/eliminar/modificar productos
- ✅ Búsqueda asíncrona de productos
- ✅ Muestra stock disponible actualizado
- ✅ Validación de stock para cambios
- ✅ Alerta informativa sobre ajuste de stock reservado

**Lógica de edición:**
- Productos nuevos → reserva stock adicional
- Productos eliminados → libera stock
- Cantidades modificadas → ajusta reserva (+ o -)

---

## 🔌 Servicio de API (orderService.ts)

### Funciones implementadas:

```typescript
getOrders(filters?) → Order[]
  // Lista pedidos con filtros opcionales

getOrderById(id) → Order
  // Obtiene pedido con todos sus detalles

createOrder(data) → Order
  // Crea nuevo pedido y reserva stock

updateOrder(id, data) → Order
  // Edita pedido pendiente

approveOrder(id, data) → { order, sale }
  // Aprueba y convierte en venta

cancelOrder(id) → Order
  // Cancela pedido y libera stock

getOrderHistory(id) → OrderHistoryEntry[]
  // Obtiene historial de cambios

getOrderStatistics() → OrderStatistics
  // Obtiene estadísticas de pedidos
```

---

## 📊 Tipos TypeScript (OrderTypes.ts)

### Interfaces principales:

```typescript
Order                  // Pedido completo
OrderDetail            // Detalle de producto en pedido
OrderHistoryEntry      // Entrada de historial
OrderStatistics        // Estadísticas
CreateOrderDto         // DTO para crear
UpdateOrderDto         // DTO para editar
ApproveOrderDto        // DTO para aprobar con pagos
PaymentDto             // Pago individual
OrderFilters           // Filtros para listado
```

### Enum:
```typescript
OrderStatus {
  PENDING
  APPROVED
  CANCELLED
}
```

---

## 🎯 Características Implementadas

### Permisos y Roles
- ✅ Guards en componentes basados en rol de usuario
- ✅ Botones visibles solo si el usuario tiene permiso
- ✅ VENDEDOR ve solo sus propios pedidos
- ✅ BODEGA/CAJERO/ADMIN ven todos

### UX/UI
- ✅ Ant Design components consistentes con el resto del sistema
- ✅ Tags colorizados por estado
- ✅ Iconos intuitivos en acciones
- ✅ Validaciones en tiempo real
- ✅ Mensajes de éxito/error
- ✅ Loading states en todas las operaciones
- ✅ Modales con tamaños apropiados
- ✅ Tablas responsivas con scroll

### Validaciones
- ✅ Stock disponible antes de crear/editar
- ✅ Al menos 1 producto
- ✅ Cantidades y precios válidos
- ✅ Suma de pagos = total pedido (aprobar)
- ✅ Productos seleccionados correctamente

### Integración
- ✅ Usa servicios existentes (productService, clientService)
- ✅ Reutiliza ClientSelector component
- ✅ Debounce en búsquedas asíncronas
- ✅ Manejo de errores con try/catch
- ✅ Mensajes informativos al usuario

---

## 🚀 Cómo Usar

### 1. Acceder al módulo
```
http://localhost:5173/orders
```

### 2. Crear un pedido
1. Click en "Nuevo Pedido"
2. Seleccionar cliente (opcional)
3. Agregar productos
4. Verificar stock disponible
5. Completar cantidades y precios
6. Click en "Crear Pedido"

### 3. Editar un pedido (CAJERO/ADMIN)
1. Click en ícono de editar (lápiz)
2. Modificar productos/cantidades
3. Click en "Guardar Cambios"

### 4. Aprobar un pedido (BODEGA/CAJERO/ADMIN)
1. Click en ícono de aprobar (check verde)
2. Configurar formas de pago
3. Validar que suma = total
4. Click en "Aprobar y Crear Venta"

### 5. Ver detalle
1. Click en ícono de ojo
2. Ver pestaña "Detalles" o "Historial"

### 6. Cancelar pedido (ADMIN)
1. Click en ícono de eliminar (papelera roja)
2. Confirmar cancelación

---

## 🔄 Flujo de Datos

```
Usuario → Componente → orderService.ts → API Backend
                ↓
         State actualizado
                ↓
         Re-render UI
```

### Ejemplo de creación:
```typescript
// 1. Usuario completa formulario
const payload = {
  customerName: "Juan Pérez",
  totalAmount: 150.00,
  details: [
    { productId: 1, quantity: 3, unitPrice: 50, totalPrice: 150 }
  ]
};

// 2. Llamada al servicio
await createOrder(payload);

// 3. Backend responde con pedido creado
// 4. Componente actualiza lista
// 5. Modal se cierra
// 6. Mensaje de éxito
```

---

## ✅ Testing Checklist

### VENDEDOR
- [ ] Puede crear pedidos
- [ ] Solo ve sus propios pedidos
- [ ] NO puede editar pedidos
- [ ] NO puede aprobar pedidos
- [ ] NO puede cancelar pedidos

### BODEGA
- [ ] Puede crear pedidos
- [ ] Ve todos los pedidos
- [ ] NO puede editar pedidos
- [ ] ✅ Puede aprobar pedidos
- [ ] NO puede cancelar pedidos

### CAJERO
- [ ] Puede crear pedidos
- [ ] Ve todos los pedidos
- [ ] ✅ Puede editar pedidos
- [ ] ✅ Puede aprobar pedidos
- [ ] NO puede cancelar pedidos

### ADMIN
- [ ] ✅ Todos los permisos anteriores
- [ ] ✅ Puede cancelar pedidos

---

## 📝 Notas Importantes

1. **Stock Reservado**: El componente muestra `stock - reservedStock` como disponible
2. **Búsqueda de Productos**: Usa debounce de 350ms para no saturar el servidor
3. **Validaciones**: Todas las validaciones críticas se hacen tanto en frontend como backend
4. **Historial**: Solo se carga cuando el usuario abre la pestaña (optimización)
5. **Estadísticas**: Solo visibles para BODEGA, CAJERO y ADMIN
6. **Edición**: Solo pedidos PENDING pueden ser editados
7. **Aprobación**: Crea automáticamente una venta en el sistema

---

## 🎨 Personalización

### Colores de Estado
```typescript
PENDING: orange (#faad14)
APPROVED: green (#52c41a)
CANCELLED: red (#ff4d4f)
```

### Tamaños de Modal
```typescript
CreateOrder: 1000px
EditOrder: 1000px
ApproveOrder: 900px
OrderDetail: 900px
```

---

**Autor**: Sistema de Pedidos - Frontend
**Fecha**: 2025
**Versión**: 1.0.0
