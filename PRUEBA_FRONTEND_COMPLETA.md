# 🧪 Guía de Prueba del Sistema FIFO - Frontend Completo

## ✅ Componentes Integrados

Se han integrado exitosamente los siguientes componentes en el sistema:

### 1. **ProductBatchesModal** → Módulo de Productos
- **Ubicación**: `src/pages/products/ProductList.tsx`
- **Botón**: "Ver Lotes" en cada producto
- **Función**: Muestra todos los lotes de un producto específico con FIFO

### 2. **ExpiringBatchesAlert** → Dashboard
- **Ubicación**: `src/pages/Dashboard.tsx` 
- **Posición**: Primera tarjeta antes de la valuación
- **Función**: Alertas de lotes próximos a vencer

### 3. **InventoryValuationCard** → Dashboard
- **Ubicación**: `src/pages/Dashboard.tsx`
- **Posición**: Segunda tarjeta después de alertas
- **Función**: Valuación total del inventario con costos FIFO

---

## 🚀 Pasos para Probar el Sistema Completo

### PASO 1: Iniciar el Backend
```powershell
cd "d:\Proyecto Milan\codigo\backend-perfumeria"
npm run start:dev
```

✅ **Verificar**:
- El servidor debe iniciar en `http://localhost:3000`
- No debe haber errores en la consola
- Debe mostrar: "Application is running on: http://[::1]:3000"

---

### PASO 2: Iniciar el Frontend
```powershell
cd "d:\Proyecto Milan\codigo\perfumeria-sistema"
npm run dev
```

✅ **Verificar**:
- El frontend debe iniciar en `http://localhost:5173`
- No debe haber errores de compilación
- El navegador debe abrir automáticamente

---

### PASO 3: Crear Compras con Costos Diferentes

1. **Login al sistema** con tu usuario administrativo

2. **Ir al módulo de Compras**
   - Menú lateral → "Compras"

3. **Crear Primera Compra**:
   - Click en "Nueva Compra"
   - Seleccionar un proveedor
   - Agregar producto: **"Miss Dior"** (o cualquier perfume)
   - Cantidad: **10 unidades**
   - Costo unitario: **$25,000**
   - Total: $250,000
   - Click "Guardar"

4. **Verificar en Backend (Consola)**:
   ```
   📦 Lote creado: Producto 1, Cantidad: 10, Costo: $25000
   ✅ Stock actualizado: +10 unidades
   ```

5. **Crear Segunda Compra** (mismo producto):
   - Click en "Nueva Compra"
   - Mismo proveedor
   - Agregar producto: **"Miss Dior"** (el mismo)
   - Cantidad: **8 unidades**
   - Costo unitario: **$28,000**
   - Total: $224,000
   - Click "Guardar"

6. **Verificar en Backend (Consola)**:
   ```
   📦 Lote creado: Producto 1, Cantidad: 8, Costo: $28000
   ✅ Stock actualizado: +8 unidades
   ```

---

### PASO 4: Visualizar Lotes del Producto

1. **Ir al módulo de Productos**
   - Menú lateral → "Productos"

2. **Buscar el producto "Miss Dior"**
   - Usar el buscador si es necesario

3. **Click en el botón "Ver Lotes"**
   - Se abrirá un modal con la información de lotes

4. **Verificar en el Modal**:
   
   ✅ **Estadísticas en la parte superior**:
   - Total de Lotes: **2**
   - Cantidad Total Comprada: **18 unidades**
   - Stock Disponible: **18 unidades**
   - Valor del Inventario: **$474,000**
   - Costo Promedio Ponderado: **$26,333.33**

   ✅ **Tabla de Lotes**:
   
   | Lote | Fecha | Proveedor | Cant. Inicial | Stock Actual | Costo Unit. | Valor | Estado |
   |------|-------|-----------|---------------|--------------|-------------|-------|--------|
   | #1   | Hoy   | XXX       | 10            | 10           | $25,000     | $250,000 | Disponible |
   | #2   | Hoy   | XXX       | 8             | 8            | $28,000     | $224,000 | Disponible |

   ✅ **Alerta FIFO**:
   - "Próximo lote a consumir: Lote #1 - 10 unidades disponibles @ $25,000"

5. **Cerrar el modal**

---

### PASO 5: Realizar una Venta (Consumo FIFO)

1. **Ir al módulo de Ventas (POS)**
   - Menú lateral → "Ventas" o "Punto de Venta"

2. **Crear una Venta**:
   - Seleccionar cliente (o cliente genérico)
   - Agregar producto: **"Miss Dior"**
   - Cantidad: **12 unidades**
   - Precio de venta: El que esté configurado
   - Click "Finalizar Venta" o "Guardar"

3. **Verificar en Backend (Consola)**:
   ```
   💰 FIFO - Producto 1: 12 unidades
      Costo total: $306000
      Costo promedio: $25500
      Lotes consumidos:
      - Lote 1: 10 unidades @ $25000 = $250000
      - Lote 2: 2 unidades @ $28000 = $56000
   ✅ Stock actualizado: -12 unidades
   ```

4. **¡IMPORTANTE!** Verificar el cálculo:
   - El sistema consumió **primero el lote más antiguo (FIFO)**
   - Lote 1: 10 unidades × $25,000 = $250,000
   - Lote 2: 2 unidades × $28,000 = $56,000
   - **Costo real total: $306,000**
   - **Costo promedio: $25,500** por unidad
   
   Si hubiera usado un promedio simple sería:
   - ($25,000 + $28,000) / 2 = $26,500 por unidad
   - 12 unidades × $26,500 = $318,000 ❌ INCORRECTO
   
   **FIFO da el costo REAL: $306,000** ✅

---

### PASO 6: Verificar Lotes Después de la Venta

1. **Volver al módulo de Productos**

2. **Buscar "Miss Dior" nuevamente**

3. **Click en "Ver Lotes"**

4. **Verificar cambios en el Modal**:
   
   ✅ **Estadísticas actualizadas**:
   - Total de Lotes: **2** (sin cambio)
   - Cantidad Total Comprada: **18 unidades** (sin cambio)
   - Stock Disponible: **6 unidades** (cambió de 18)
   - Valor del Inventario: **$168,000** (cambió de $474,000)
   - Costo Promedio Ponderado: **$28,000** (solo quedan del Lote 2)

   ✅ **Tabla de Lotes actualizada**:
   
   | Lote | Fecha | Proveedor | Cant. Inicial | Stock Actual | Consumidas | Costo Unit. | Valor | Estado |
   |------|-------|-----------|---------------|--------------|------------|-------------|-------|--------|
   | #1   | Hoy   | XXX       | 10            | **0**        | **10**     | $25,000     | $0 | **Agotado** |
   | #2   | Hoy   | XXX       | 8             | **6**        | **2**      | $28,000     | $168,000 | Disponible |

   ✅ **Alerta FIFO actualizada**:
   - "Próximo lote a consumir: Lote #2 - 6 unidades disponibles @ $28,000"

---

### PASO 7: Verificar Dashboard - Valuación del Inventario

1. **Ir al Dashboard**
   - Menú lateral → "Dashboard" o "Inicio"

2. **Scroll hasta la sección "Valuación del Inventario (FIFO)"**

3. **Verificar Card de Valuación**:
   
   ✅ **Estadísticas generales**:
   - Valor Total del Inventario: Suma de todos los productos
   - Total de Productos: Cantidad de productos con lotes
   - Cantidad Total de Unidades: Suma de todas las unidades

   ✅ **Tabla por producto**:
   - Debe aparecer "Miss Dior" con:
     - Cantidad: **6 unidades**
     - Costo Promedio: **$28,000**
     - Valor Total: **$168,000**
     - % del Total: Según otros productos

   ✅ **Fila de totales al final de la tabla**

---

### PASO 8: Verificar Dashboard - Alertas de Vencimiento

1. **En el mismo Dashboard**

2. **Scroll hasta la sección "Lotes Próximos a Vencer"**

3. **Si NO agregaste fechas de vencimiento**:
   - Debe mostrar: "✅ No hay lotes próximos a vencer"
   - Esto es normal y correcto

4. **Si quieres probar alertas de vencimiento**:
   
   a) Ir a Base de Datos y actualizar manualmente:
   ```sql
   UPDATE product_batches 
   SET expiry_date = CURRENT_DATE + INTERVAL '20 days'
   WHERE id = 2;
   ```
   
   b) Refrescar el Dashboard
   
   c) Cambiar filtro a "30 días"
   
   d) Verificar que aparezca:
   - Lote #2
   - Días restantes: ~20
   - Urgencia: ALTA (naranja)
   - Pérdida potencial: $168,000
   - Resumen: "1 lote próximo a vencer"

---

## 📊 Resultados Esperados - Resumen

### ✅ Flujo Completo Exitoso

| Etapa | Estado Inicial | Estado Final | Verificación |
|-------|---------------|--------------|--------------|
| **Compras** | 0 unidades | 18 unidades (2 lotes) | ✅ Lotes creados |
| **Lotes** | - | Lote 1: 10@$25k, Lote 2: 8@$28k | ✅ Visible en modal |
| **Venta** | 18 unidades | 6 unidades | ✅ FIFO consumió correcto |
| **Lote 1** | 10 disponibles | 0 disponibles (Agotado) | ✅ Consumido completo |
| **Lote 2** | 8 disponibles | 6 disponibles | ✅ Consumidas 2 unidades |
| **Costo Venta** | - | $306,000 (real FIFO) | ✅ No usó promedio |
| **Dashboard** | - | Valuación: $168,000 | ✅ Actualizado |

---

## 🎯 Puntos Clave del Sistema FIFO

### 1. **Creación Automática de Lotes**
- ✅ Cada compra crea lotes automáticamente
- ✅ No requiere intervención manual
- ✅ Se registra: cantidad, costo, fecha, proveedor

### 2. **Consumo FIFO en Ventas**
- ✅ Consume del lote más antiguo primero
- ✅ Calcula costo REAL, no promedio
- ✅ Actualiza `remainingQty` de cada lote
- ✅ Log detallado en consola del backend

### 3. **Trazabilidad Completa**
- ✅ Sabes de qué compra vino cada producto vendido
- ✅ Puedes rastrear proveedor y fecha
- ✅ Historial de consumo por lote

### 4. **Valuación Precisa**
- ✅ Valor del inventario = suma de lotes disponibles
- ✅ Costo promedio ponderado correcto
- ✅ Útil para contabilidad y finanzas

### 5. **Control de Vencimientos**
- ✅ Identifica productos que deben venderse pronto
- ✅ Calcula pérdidas potenciales
- ✅ Alertas por urgencia (URGENTE, ALTA, MEDIA)

---

## 🐛 Troubleshooting

### Problema: No aparece el botón "Ver Lotes"
**Solución**: Verifica que tengas permisos de edición o eliminación de productos (`canEditProducts || canDeleteProducts`)

### Problema: Modal vacío o sin lotes
**Solución**: 
1. Verifica que la compra se haya guardado correctamente
2. Revisa la consola del backend por errores
3. Verifica que el backend esté corriendo
4. Comprueba la URL del API en `src/services/api.ts`

### Problema: Error CORS
**Solución**: Verifica que el backend tenga configurado CORS para `localhost:5173`:
```typescript
// En main.ts del backend
app.enableCors({
  origin: 'http://localhost:5173',
  credentials: true,
});
```

### Problema: Costo de venta incorrecto
**Solución**: 
1. Revisa la consola del backend durante la venta
2. Verifica que `consumeBatchesFIFO` se esté llamando
3. Comprueba que los lotes tengan `purchaseDate` correcta
4. Verifica el orden de lotes (más antiguo primero)

### Problema: Dashboard no muestra valuación
**Solución**:
1. Verifica que haya productos con lotes
2. Revisa la consola del navegador por errores
3. Verifica que el endpoint `/api/product-batches/valuation` esté funcionando
4. Prueba directamente en el navegador: `http://localhost:3000/api/product-batches/valuation`

---

## 📈 Siguiente Prueba Avanzada

Después de completar las pruebas básicas, prueba este escenario:

### Escenario: Múltiples Ventas con FIFO

1. **Crear 3 compras**:
   - Compra 1: 5 unidades @ $20,000
   - Compra 2: 10 unidades @ $25,000
   - Compra 3: 5 unidades @ $30,000
   - Total: 20 unidades

2. **Venta 1**: 7 unidades
   - Debe consumir: 5 del Lote 1 + 2 del Lote 2
   - Costo: (5×$20k) + (2×$25k) = $150,000

3. **Venta 2**: 10 unidades
   - Debe consumir: 8 del Lote 2 + 2 del Lote 3
   - Costo: (8×$25k) + (2×$30k) = $260,000

4. **Stock final**: 3 unidades (todas del Lote 3 @ $30k)

5. **Verificar todo en el modal "Ver Lotes"**

---

## ✅ Checklist Final

- [ ] Backend corriendo sin errores
- [ ] Frontend corriendo sin errores
- [ ] Crear 2 compras con costos diferentes
- [ ] Ver lotes en modal → 2 lotes visibles
- [ ] Realizar venta de 12 unidades
- [ ] Verificar FIFO en consola del backend
- [ ] Ver lotes nuevamente → Lote 1 agotado, Lote 2 con 6
- [ ] Dashboard muestra valuación correcta
- [ ] Dashboard muestra (o no) alertas de vencimiento
- [ ] Costo de venta es $306,000 (no $318,000)
- [ ] Stock del producto es 6 unidades

---

## 🎉 ¡Felicitaciones!

Si completaste todos los pasos y las verificaciones son correctas, tu sistema FIFO está **100% funcional** tanto en backend como en frontend.

**Próximos pasos**:
1. ✅ Probar con más productos
2. ✅ Crear script de migración para inventario existente
3. ✅ Deploy a Railway
4. ✅ Rollout a todos los clientes

---

## 📞 ¿Tienes dudas o errores?

Documenta:
1. En qué paso apareció el error
2. Mensaje de error (captura de pantalla)
3. Consola del backend (si aplica)
4. Consola del navegador (si aplica)

¡Estoy aquí para ayudarte! 🚀
