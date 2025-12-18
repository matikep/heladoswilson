# 🚀 Guía Rápida de Inicio

## ✅ Lo que ya está hecho

Tu proyecto de Helados Caseros ya está creado con:
- ✨ Tienda de helados con diseño moderno
- 🛒 Carrito de compras funcional  
- 💬 Integración con WhatsApp
- 📦 Sistema de stock en tiempo real (requiere configuración)
- 🔐 Panel de administración protegido

## 📋 Pasos para Completar la Configuración

### 1️⃣ Instalar Dependencias

```bash
npm install firebase react-router-dom
```

### 2️⃣ Configurar Firebase

Sigue la guía detallada en **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

**Resumen ultra-rápido:**
1. Ve a https://console.firebase.google.com/
2. Crea un proyecto llamado "heladoswilson"
3. Habilita "Realtime Database" en modo de prueba
4. Copia las credenciales
5. Pégalas en `src/firebase.ts`

### 3️⃣ Cambiar Contraseña del Admin

Edita `src/Admin.tsx` línea 14:
```typescript
const ADMIN_PASSWORD = 'helados2024' // ⬅️ Cambia esto
```

### 4️⃣ Probar Localmente

```bash
npm run dev
```

**Tienda:** http://localhost:5173/  
**Admin:** http://localhost:5173/admin

### 5️⃣ Subir a GitHub

```bash
git add .
git commit -m "Configurado sistema de stock con Firebase"
git push
```

### 6️⃣ Deploy en Vercel

1. Ve a https://vercel.com
2. Importa tu repositorio: https://github.com/matikep/heladoswilson
3. Click en "Deploy"
4. ¡Listo! 🎉

## 🎯 URLs Finales

Después del deploy tendrás:

- **Tienda (clientes):** `https://tu-app.vercel.app/`
- **Admin (tú):** `https://tu-app.vercel.app/admin`

## 💡 Cómo Usar Diariamente

### Como Administrador:
1. Entra a `/admin`
2. Ingresa tu contraseña
3. Actualiza el stock de cada sabor
4. Los clientes verán los cambios al instante

### Como Cliente:
1. Entra a la tienda
2. Selecciona helados (solo los disponibles)
3. Click en "Enviar Pedido por WhatsApp"
4. Se abre WhatsApp con el pedido listo

## 🔧 Configuraciones Opcionales

### Cambiar Número de WhatsApp
`src/App.tsx` línea 95:
```typescript
const whatsappNumber = '56936380348' // ⬅️ Tu número
```

### Cambiar Productos/Precios
Actualízalos desde el panel admin o edita el código inicial en `src/Admin.tsx` líneas 28-34

### Cambiar Colores
`src/index.css` líneas 3-11

## 🆘 Solución Rápida de Problemas

**Error: Cannot find module 'firebase'**
```bash
npm install firebase react-router-dom
```

**No funciona el stock en tiempo real**
- Verifica que configuraste Firebase correctamente
- Revisa `src/firebase.ts` - debe tener tus credenciales reales

**Error al hacer deploy**
- Asegúrate de haber hecho `git push`
- Verifica que las dependencias estén en `package.json`

## 📞 Soporte

- **Firebase:** [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)
- **Deploy:** [DEPLOY.md](./DEPLOY.md)
- **README completo:** [README.md](./README.md)

---

**¡Todo listo para vender helados! 🍦**
