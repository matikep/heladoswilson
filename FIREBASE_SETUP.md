# 🔥 Guía de Configuración Firebase

## ¿Por qué Firebase?
Firebase te permite tener un sistema de stock en tiempo real **100% GRATIS** sin necesidad de crear un backend. Todos los clientes verán el mismo stock actualizado instantáneamente.

## 📋 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en "Agregar proyecto" o "Add project"
3. Nombre del proyecto: `heladoswilson` (o el que prefieras)
4. Desactiva Google Analytics (no lo necesitas)
5. Click en "Crear proyecto"

## 🗄️ Paso 2: Configurar Realtime Database

1. En el menú lateral, busca "Realtime Database"
2. Click en "Crear base de datos" o "Create database"
3. **Ubicación**: Elige "United States (us-central1)" (es gratis)
4. **Reglas de seguridad**: Selecciona "Modo de prueba" (test mode)
   - Esto permite leer/escribir sin autenticación
   - ⚠️ **IMPORTANTE**: Cambiaremos esto después
5. Click en "Habilitar"

## 🔐 Paso 3: Configurar Reglas de Seguridad

Para que solo tú puedas editar el stock pero todos puedan verlo:

1. En Realtime Database, ve a la pestaña "Reglas" (Rules)
2. Reemplaza el contenido con esto:

```json
{
  "rules": {
    "stock": {
      ".read": true,
      ".write": false
    }
  }
}
```

3. Click en "Publicar"

**Explicación**: 
- `.read: true` = Todos pueden VER el stock
- `.write: false` = Nadie puede MODIFICAR (solo desde el panel admin)

## 🔑 Paso 4: Obtener Credenciales

1. Click en el ícono de engranaje ⚙️ (arriba izquierda)
2. Click en "Configuración del proyecto"
3. Scroll down hasta "Tus apps"
4. Click en el ícono `</>` (Web)
5. Nombre de la app: `heladoswilson-web`
6. **NO** marques "Firebase Hosting"
7. Click en "Registrar app"
8. Verás un código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "heladoswilson.firebaseapp.com",
  databaseURL: "https://heladoswilson-default-rtdb.firebaseio.com",
  projectId: "heladoswilson",
  storageBucket: "heladoswilson.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

9. **COPIA** estos valores

## 📝 Paso 5: Configurar tu Aplicación

1. Abre el archivo `src/firebase.ts`
2. Reemplaza los valores de `firebaseConfig` con los que copiaste
3. Guarda el archivo

**Antes:**
```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  // ...
};
```

**Después (con tus valores reales):**
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "heladoswilson.firebaseapp.com",
  // ...
};
```

## 📦 Paso 6: Instalar Dependencias

```bash
# Instalar Firebase y React Router
npm install firebase react-router-dom
```

## 🔐 Paso 7: Cambiar Contraseña del Admin

1. Abre `src/Admin.tsx`
2. Busca la línea 14:
```typescript
const ADMIN_PASSWORD = 'helados2024' // Cambia esta contraseña
```
3. Cambia `'helados2024'` por tu contraseña secreta
4. Guarda el archivo

## 🚀 Paso 8: Probar Localmente

```bash
npm run dev
```

### Probar la Tienda
1. Abre http://localhost:5173/
2. Deberías ver los helados

### Probar el Admin
1. Abre http://localhost:5173/admin
2. Ingresa tu contraseña
3. Actualiza el stock de un producto
4. Abre otra pestaña con http://localhost:5173/
5. ¡El stock debería actualizarse automáticamente! ✨

## 📤 Paso 9: Deploy en Vercel

1. Sube los cambios a GitHub:
```bash
git add .
git commit -m "Agregado sistema de stock con Firebase"
git push
```

2. Vercel detectará los cambios y hará deploy automáticamente

## 🎯 Cómo Usar

### Para Clientes (Tienda)
- URL: `https://tu-app.vercel.app/`
- Ven los productos disponibles
- Solo pueden pedir lo que hay en stock
- Si un producto se agota, desaparece automáticamente

### Para Ti (Admin)
- URL: `https://tu-app.vercel.app/admin`
- Ingresas con tu contraseña
- Actualizas el stock diariamente
- Los cambios se reflejan instantáneamente para todos

## 🔒 Seguridad Mejorada (Opcional)

Si quieres más seguridad, puedes usar Firebase Authentication:

1. En Firebase Console, ve a "Authentication"
2. Habilita "Correo electrónico/contraseña"
3. Crea un usuario admin
4. Actualiza las reglas de la base de datos:

```json
{
  "rules": {
    "stock": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 💰 Límites Gratuitos de Firebase

El plan gratuito (Spark) incluye:
- ✅ 1 GB de almacenamiento
- ✅ 10 GB/mes de descarga
- ✅ 100 conexiones simultáneas

**Para tu caso**: Más que suficiente. Podrías tener miles de clientes sin pagar nada.

## 🆘 Solución de Problemas

### Error: "Permission denied"
- Verifica las reglas de seguridad en Firebase Console
- Asegúrate de que `.read: true` esté configurado

### No se actualiza el stock en tiempo real
- Verifica que `databaseURL` esté correcto en `firebase.ts`
- Abre la consola del navegador (F12) y busca errores

### Error al hacer deploy en Vercel
- Asegúrate de haber hecho `npm install firebase react-router-dom`
- Verifica que `package.json` tenga las dependencias

## 📞 Soporte

Si tienes problemas:
1. Revisa la [documentación de Firebase](https://firebase.google.com/docs/database)
2. Verifica la consola del navegador (F12) para errores
3. Asegúrate de que la configuración en `firebase.ts` sea correcta

---

¡Listo! Ahora tienes un sistema de stock profesional sin backend 🎉
