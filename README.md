# 🍦 Helados Caseros

Una mini tienda online minimalista y funcional para vender helados artesanales, con integración directa a WhatsApp para recibir pedidos.

![Helados Caseros](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Características

- 🎨 **Diseño moderno y minimalista** con animaciones suaves
- 🛒 **Carrito de compras** interactivo
- 💬 **Integración con WhatsApp** para enviar pedidos directamente
- 📦 **Sistema de stock en tiempo real** con Firebase
- 🔐 **Panel de administración** protegido con contraseña
- ⚡ **Actualización instantánea** - todos los clientes ven el mismo stock
- 📱 **Totalmente responsive** - se adapta a cualquier dispositivo
- ⚡ **Rápido y ligero** - construido con Vite
- 🎯 **100% Gratis** - Firebase plan gratuito + Vercel


## 🍨 Productos Disponibles

- Chocolate - $600
- Oreo - $600
- Manjarate - $700
- Prestigio - $700
- Plátano con Leche - $600

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/heladoswilson.git

# Entrar al directorio
cd heladoswilson

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### Build para Producción

```bash
npm run build
```

## 📦 Deploy en Vercel

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa tu repositorio
4. ¡Vercel detectará automáticamente la configuración de Vite!
5. Click en "Deploy"

### Deploy Rápido

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/heladoswilson)

## 🛠️ Tecnologías

- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Firebase Realtime Database** - Stock en tiempo real
- **React Router** - Navegación entre páginas
- **CSS3** - Estilos con variables CSS y animaciones
- **Google Fonts (Outfit)** - Tipografía moderna

## 🔥 Configuración de Firebase (Sistema de Stock)

Para habilitar el sistema de stock en tiempo real, sigue la guía completa en:
**[📖 FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

**Resumen rápido:**
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Realtime Database
3. Copia las credenciales a `src/firebase.ts`
4. Instala dependencias: `npm install firebase react-router-dom`

## 🔐 Panel de Administración

Accede al panel admin en: `https://tu-app.vercel.app/admin`

**Autenticación:**
- 🔒 **Inicio de sesión con Google** (OAuth)
- ✅ Un solo click para entrar
- ✅ Solo emails autorizados pueden acceder
- ✅ No hay contraseñas que recordar

**Funcionalidades:**
- ✅ Actualizar stock de productos en tiempo real
- ✅ Ver y gestionar pedidos (pendientes, confirmados, rechazados)
- ✅ Ver estado del inventario (disponible, stock bajo, agotado)
- ✅ Resetear todo el stock con un click
- ✅ Agregar, editar y eliminar productos
- ✅ Múltiples usuarios admin

**Configurar Google Authentication:**
Sigue la guía completa en: **[📖 GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md)**

**Agregar más administradores:**
Edita `src/Admin.tsx` líneas 32-38:
```typescript
const AUTHORIZED_EMAILS = [
  'matikep@gmail.com',
  'empleado@gmail.com',  // Agrega más emails aquí
  'familia@gmail.com'
]
```


## 📱 Configuración de WhatsApp

Para cambiar el número de WhatsApp, edita la constante `whatsappNumber` en `src/App.tsx`:

```typescript
const whatsappNumber = '56936380348' // Cambia este número
```

## 🎨 Personalización

### Colores

Los colores se pueden modificar en `src/index.css`:

```css
:root {
  --cream: #FFF8F0;
  --peach: #FFD4B8;
  --coral: #FF9B85;
  --brown: #8B6F47;
  --dark-brown: #5C4A2F;
}
```

### Productos

Modifica el array `products` en `src/App.tsx`:

```typescript
const products: Product[] = [
  { id: 1, name: 'Chocolate', price: 600, icon: '🍫' },
  // Agrega más productos aquí
]
```

## 📄 Licencia

MIT

## 👨‍💻 Autor

Creado con ❤️ para Helados Caseros

---

**¿Tienes preguntas?** Contáctanos por WhatsApp: +56936380348
