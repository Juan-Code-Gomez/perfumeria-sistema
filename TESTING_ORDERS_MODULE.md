# 🎯 Guía para Probar el Módulo de Pedidos

## ✅ Requisitos Previos

1. **Backend corriendo** en el puerto configurado (normalmente 3000)
2. **Frontend corriendo** en el puerto 5173
3. **Base de datos** con las tablas de pedidos creadas

---

## 🚀 Método 1: Acceso Directo (Más Rápido)

### Paso 1: Acceso por URL
Simplemente abre tu navegador y ve a:

```
http://localhost:5173/orders
```

✅ **Esto debería funcionar inmediatamente** porque la ruta ya está configurada en el router.

---

## 🔐 Método 2: Agregar al Menú con Permisos (Recomendado)

### Paso 1: Ejecutar el Script de Configuración

Desde la carpeta del backend, ejecuta:

```bash
cd "d:\Proyecto Milan\codigo\backend-perfumeria"
node add-orders-module.js
```

### Paso 2: Cerrar Sesión y Volver a Iniciar

1. En el frontend, cierra sesión
2. Vuelve a iniciar sesión
3. El módulo "Gestión de Pedidos" debería aparecer en el menú

---

## 🧪 Método 3: Prueba Temporal en el Código

Si quieres probar **sin configurar la base de datos**, agrega temporalmente en el hook de permisos:

### Editar: `src/hooks/usePermissions.ts`

Busca la función `hasPermission` y agrega una condición temporal:

```typescript
const hasPermission = (module: string, action: string): boolean => {
  // TEMPORAL: Permitir acceso a pedidos para pruebas
  if (module === 'pedidos') {
    return true;
  }
  
  // ... resto del código
}
```

---

## 📊 Verificar que el Módulo Funciona

### 1. Verificar la Ruta
La ruta `/orders` debe estar configurada en `src/router/index.tsx`:

```typescript
{ path: "/orders", element: <OrdersPage /> }
```

✅ **Ya está configurada**

### 2. Verificar los Componentes
Los componentes deben existir en `src/components/orders/`:

- ✅ OrdersList.tsx
- ✅ CreateOrderModal.tsx
- ✅ EditOrderModal.tsx
- ✅ ApproveOrderModal.tsx
- ✅ OrderDetailModal.tsx

✅ **Todos existen**

### 3. Verificar el Servicio
El servicio debe existir en `src/services/orderService.ts`:

✅ **Ya existe**

---

## 🎨 Lo que Verás al Acceder

### Tarjetas de Estadísticas (si tienes permisos)
- Total Pedidos
- Pendientes
- Aprobados
- Monto Pendiente

### Filtros
- Por Estado (PENDING, APPROVED, CANCELLED)
- Por Rango de Fechas

### Tabla de Pedidos
Columnas:
- # Pedido
- Fecha
- Cliente
- Estado
- Total
- Creado por
- Aprobado por
- Productos
- Acciones

### Botones de Acción (según rol)
- 👁️ **Ver detalle** - Todos los roles
- ✏️ **Editar** - CAJERO, ADMIN (solo pendientes)
- ✅ **Aprobar** - BODEGA, CAJERO, ADMIN (solo pendientes)
- 🗑️ **Cancelar** - ADMIN (solo pendientes)

---

## 🔍 Solución de Problemas

### Problema 1: "No puedo ver el módulo en el menú"
**Solución**: Usa el acceso directo por URL: `http://localhost:5173/orders`

### Problema 2: "Error 404 al acceder"
**Solución**: Verifica que el servidor de desarrollo esté corriendo:
```bash
npm run dev
```

### Problema 3: "Error al cargar pedidos"
**Solución**: Verifica que el backend esté corriendo y tenga las rutas de pedidos:
```bash
# En el backend
GET    /api/orders
POST   /api/orders
PATCH  /api/orders/:id
DELETE /api/orders/:id
POST   /api/orders/:id/approve
GET    /api/orders/:id/history
GET    /api/orders/statistics
```

### Problema 4: "No tengo permisos"
**Solución temporal**: 
1. Accede directamente por URL
2. O ejecuta el script `add-orders-module.js` en el backend

---

## 📋 Permisos por Rol

| Rol      | Ver      | Crear | Editar | Aprobar | Cancelar |
|----------|----------|-------|--------|---------|----------|
| VENDEDOR | Propios  | ✅    | ❌     | ❌      | ❌       |
| BODEGA   | Todos    | ✅    | ❌     | ✅      | ❌       |
| CAJERO   | Todos    | ✅    | ✅     | ✅      | ❌       |
| ADMIN    | Todos    | ✅    | ✅     | ✅      | ✅       |

---

## 🎯 Flujo de Prueba Recomendado

### 1. Crear un Pedido
1. Click en "Nuevo Pedido"
2. Selecciona un cliente (opcional)
3. Agrega productos
4. Verifica el stock disponible
5. Click en "Crear Pedido"

### 2. Editar un Pedido (CAJERO/ADMIN)
1. Localiza un pedido con estado PENDING
2. Click en el ícono de editar ✏️
3. Modifica productos o cantidades
4. Click en "Guardar Cambios"

### 3. Aprobar un Pedido (BODEGA/CAJERO/ADMIN)
1. Localiza un pedido con estado PENDING
2. Click en el ícono de aprobar ✅
3. Configura las formas de pago
4. Asegúrate que la suma = total del pedido
5. Click en "Aprobar y Crear Venta"

### 4. Ver Historial
1. Click en el ícono de ojo 👁️ de cualquier pedido
2. Ve a la pestaña "Historial"
3. Observa todos los cambios registrados

---

## 🚨 Nota Importante

**El backend debe tener implementadas las siguientes rutas:**

Si el backend NO tiene estas rutas, verás errores 404. En ese caso, necesitas implementar el backend del módulo de pedidos primero.

**¿Necesitas que implemente también el backend?** 🤔

---

## 📞 Próximos Pasos

1. ✅ Accede directamente: `http://localhost:5173/orders`
2. ✅ Si funciona → Ejecuta el script para agregarlo al menú
3. ✅ Si no funciona → Verifica el backend

**¿Te ayudo con algún paso específico?**
