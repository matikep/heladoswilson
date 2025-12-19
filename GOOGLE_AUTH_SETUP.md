# 🔐 Configuración de Google Authentication

Esta guía te ayudará a habilitar el inicio de sesión con Google en el panel de administración.

## 📋 Requisitos Previos

- Tener Firebase configurado (ya lo tienes ✅)
- Acceso a [Firebase Console](https://console.firebase.google.com/)

---

## 🚀 Pasos para Habilitar Google Sign-In

### 1. Ir a Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **heladoswilson**

### 2. Habilitar Google Authentication

1. En el menú lateral, haz click en **"Authentication"** (Autenticación)
2. Si es la primera vez, haz click en **"Get Started"** (Comenzar)
3. Ve a la pestaña **"Sign-in method"** (Método de inicio de sesión)
4. En la lista de proveedores, busca **"Google"**
5. Haz click en **"Google"**
6. Activa el switch **"Enable"** (Habilitar)
7. En **"Project support email"**, selecciona tu email
8. Haz click en **"Save"** (Guardar)

¡Eso es todo! 🎉

---

## ✅ Verificar que Funciona

1. Guarda todos los cambios en tu código
2. Ejecuta el proyecto:
   ```bash
   npm run dev
   ```
3. Ve a: `http://localhost:5173/admin`
4. Deberías ver el botón **"Continuar con Google"**
5. Haz click y selecciona tu cuenta Gmail
6. Si tu email es `matikep@gmail.com`, deberías entrar al panel admin
7. Si usas otro email, verás el mensaje: "No tienes permisos para acceder"

---

## 👥 Agregar Más Usuarios Autorizados

Para permitir que otras personas accedan al panel admin:

1. Abre el archivo: `src/Admin.tsx`
2. Busca la línea 32-38:
   ```typescript
   const AUTHORIZED_EMAILS = [
     'matikep@gmail.com'
     // Agrega más emails aquí
   ]
   ```
3. Agrega los emails que quieras autorizar:
   ```typescript
   const AUTHORIZED_EMAILS = [
     'matikep@gmail.com',
     'empleado@gmail.com',
     'familia@gmail.com'
   ]
   ```
4. Guarda el archivo
5. Las personas con esos emails podrán iniciar sesión

---

## 🔒 Seguridad

- ✅ Solo los emails en la lista blanca pueden acceder
- ✅ Google maneja toda la autenticación (muy seguro)
- ✅ No hay contraseñas que recordar
- ✅ Autenticación de dos factores si la tienes en Google
- ✅ Los clientes NO necesitan registrarse (siguen comprando igual)

---

## 🌐 Deploy en Vercel

Cuando hagas deploy en Vercel, debes agregar el dominio a Firebase:

1. Ve a Firebase Console → Authentication → Settings
2. En **"Authorized domains"**, agrega:
   - Tu dominio de Vercel: `tu-app.vercel.app`
   - Tu dominio personalizado (si tienes): `tudominio.com`

---

## ❓ Solución de Problemas

### Error: "This domain is not authorized"

**Solución:**
1. Ve a Firebase Console → Authentication → Settings
2. En "Authorized domains", agrega el dominio donde está tu app
3. Para desarrollo local: `localhost` ya está autorizado por defecto

### Error: "No tienes permisos para acceder"

**Solución:**
- Verifica que tu email esté en la lista `AUTHORIZED_EMAILS` en `src/Admin.tsx`
- Asegúrate de usar el mismo email con el que iniciaste sesión en Google

### El botón no aparece

**Solución:**
1. Verifica que habilitaste Google en Firebase Authentication
2. Revisa la consola del navegador por errores
3. Asegúrate de que el proyecto esté corriendo: `npm run dev`

---

## 📝 Notas Importantes

- **Los clientes NO se ven afectados**: Siguen comprando sin necesidad de login
- **Solo el panel `/admin` requiere autenticación**
- **Puedes agregar/quitar emails autorizados en cualquier momento**
- **No hay límite de usuarios autorizados en el plan gratuito de Firebase**

---

## 🎯 Próximos Pasos

Una vez que tengas Google Auth funcionando, puedes:

1. ✅ Agregar más administradores
2. ✅ Implementar roles (admin, vendedor, etc.)
3. ✅ Ver historial de quién modificó qué
4. ✅ Agregar notificaciones por email

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de Firebase Auth](https://firebase.google.com/docs/auth/web/google-signin)
