# 🛒 Carrito Persistente - POS

## ✨ Funcionalidad Implementada

El sistema de POS ahora cuenta con **persistencia automática del carrito** que permite mantener todos los productos, cliente seleccionado y datos de pago cuando el usuario cambia de módulo o recarga la página.

## 🎯 Características

### 📦 Datos que se Guardan Automáticamente
- **Productos en el carrito**: cantidad, precios, totales
- **Cliente seleccionado**: información del cliente
- **Nombre del cliente ocasional**: si no hay cliente registrado
- **Método de pago**: selección actual
- **Monto recibido**: para pagos en efectivo

### 💾 Almacenamiento
- Utiliza **localStorage** del navegador
- Los datos se guardan automáticamente en cada cambio
- **Duración**: 24 horas máximo
- Se limpia automáticamente al completar una venta

### 🔄 Restauración Automática
- Al volver al módulo POS, se restauran todos los datos
- Notificación visual cuando se restaura el carrito
- Indicador en el título mostrando productos guardados

## 🚀 Cómo Funciona

### Para el Usuario
1. **Agregar productos** al carrito normalmente
2. **Cambiar de módulo** (ir a productos, clientes, etc.)
3. **Regresar al POS** - todos los datos están ahí
4. **Continuar** donde se quedó

### Indicadores Visuales
- **Tag verde**: "💾 X productos guardados" en el título
- **Notificación**: Al cargar muestra que se restauró el carrito
- **Función normal**: Todo funciona igual que antes

### Limpieza Automática
- ✅ **Al completar venta**: Se limpia automáticamente
- ✅ **Botón "Limpiar Carrito"**: Limpia manual
- ✅ **Después de 24 horas**: Expira automáticamente
- ✅ **Al cerrar navegador**: Los datos persisten

## 🛠️ Implementación Técnica

### Hook Personalizado: `usePOSPersistence`
```typescript
const {
  state,              // Estado actual del carrito
  updateField,        // Actualizar un campo específico
  clearCart,          // Limpiar todo el carrito
  addItem,           // Agregar producto
  updateItem,        // Actualizar producto
  removeItem,        // Remover producto
} = usePOSPersistence();
```

### Estructura de Datos Guardados
```typescript
interface POSPersistentState {
  items: POSItem[];           // Productos en el carrito
  selectedClient: Client | null;  // Cliente seleccionado
  customerName: string;       // Nombre cliente ocasional
  paymentMethod: string;      // Método de pago
  amountReceived: number;     // Monto recibido
  lastSaved: string;         // Timestamp del último guardado
}
```

## ✅ Casos de Uso Resueltos

1. **Cliente llama mientras está facturando**
   - Puede ir a módulo clientes para buscar info
   - Al regresar, la venta sigue ahí

2. **Necesita verificar stock**
   - Va a módulo productos
   - Verifica inventario
   - Regresa y continúa la venta

3. **Recarga accidental de página**
   - Los datos se mantienen
   - Puede continuar inmediatamente

4. **Cambio de turno**
   - Los datos persisten para el siguiente vendedor
   - (Si es necesario, se puede limpiar manualmente)

## 🎨 Experiencia de Usuario

### Antes
❌ Perder toda la venta al cambiar de módulo
❌ Tener que recordar todo
❌ Frustración por trabajo perdido

### Ahora
✅ Tranquilidad al navegar
✅ Productividad mejorada
✅ Menos errores y re-trabajo
✅ Mejor experiencia de usuario

## 🔧 Configuración

No requiere configuración adicional. Funciona automáticamente al:
- Iniciar el sistema
- Navegar entre módulos
- Recargar la página
- Usar el POS normalmente

La funcionalidad es **completamente transparente** para el usuario final.
