// Guía de Prueba para el Logo Dinámico

## Cómo probar el sistema de logos:

### 1. Logo por defecto
- Al iniciar la aplicación sin logo personalizado
- Debería mostrar `/logo-milan.png`
- Tanto en login como en sidebar

### 2. Logo personalizado (Base64)
- Ir a Configuración de Empresa
- Subir una imagen
- La imagen se convierte a base64 automáticamente
- Debería aparecer inmediatamente en sidebar
- Al hacer logout y volver a login, debería aparecer el logo personalizado

### 3. Fallback en caso de error
- Si el logo personalizado falla al cargar
- Automáticamente vuelve al logo por defecto
- Se muestra un mensaje en consola

### 4. Loading states
- Mientras carga la configuración, muestra un spinner
- Una vez cargada, muestra el logo correspondiente

### 5. Verificar logs en consola:
```
Config loaded: true/false
Has custom logo: Yes/No  
Logo type: Base64/URL/Path
```

### 6. Casos de prueba:
- [ ] Login sin logo personalizado
- [ ] Login con logo personalizado
- [ ] Sidebar sin logo personalizado  
- [ ] Sidebar con logo personalizado
- [ ] Subir logo nuevo y verificar cambio inmediato
- [ ] Logout y login para verificar persistencia