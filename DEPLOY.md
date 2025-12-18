# 📝 Guía de Deploy - Helados Caseros

## 🔧 Paso 1: Subir a GitHub

### Opción A: Usando GitHub Desktop (Más fácil)
1. Descarga e instala [GitHub Desktop](https://desktop.github.com/)
2. Abre GitHub Desktop
3. Click en "File" → "Add Local Repository"
4. Selecciona la carpeta `heladoswilson`
5. Click en "Create Repository" si te lo pide
6. Escribe un mensaje de commit: "Initial commit - Tienda de helados"
7. Click en "Commit to main"
8. Click en "Publish repository"
9. Elige un nombre (por ejemplo: `heladoswilson`)
10. Click en "Publish Repository"

### Opción B: Usando la Terminal
```bash
# 1. Inicializar git (si no está inicializado)
git init

# 2. Agregar todos los archivos
git add .

# 3. Hacer el primer commit
git commit -m "Initial commit - Tienda de helados"

# 4. Crear un repositorio en GitHub.com
# Ve a https://github.com/new y crea un nuevo repositorio llamado "heladoswilson"

# 5. Conectar tu repositorio local con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/heladoswilson.git

# 6. Subir el código
git branch -M main
git push -u origin main
```

## 🚀 Paso 2: Deploy en Vercel

### Método Recomendado (Más fácil)
1. Ve a [vercel.com](https://vercel.com)
2. Click en "Sign Up" o "Log In"
3. Inicia sesión con tu cuenta de GitHub
4. Click en "Add New..." → "Project"
5. Busca tu repositorio `heladoswilson`
6. Click en "Import"
7. **¡No cambies nada!** Vercel detectará automáticamente que es un proyecto Vite
8. Click en "Deploy"
9. Espera 1-2 minutos
10. ¡Listo! Tu sitio estará en línea

### Configuración Automática
Vercel detectará automáticamente:
- ✅ Framework: Vite
- ✅ Build Command: `npm run build`
- ✅ Output Directory: `dist`
- ✅ Install Command: `npm install`

### Tu URL será algo como:
```
https://heladoswilson.vercel.app
```

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

### Con GitHub Desktop:
1. Abre GitHub Desktop
2. Verás los archivos modificados
3. Escribe un mensaje describiendo los cambios
4. Click en "Commit to main"
5. Click en "Push origin"
6. ¡Vercel actualizará automáticamente tu sitio!

### Con Terminal:
```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

## 🎨 Personalización Rápida

### Cambiar el número de WhatsApp
Edita `src/App.tsx` línea 54:
```typescript
const whatsappNumber = '56936380348' // Cambia este número
```

### Cambiar productos o precios
Edita `src/App.tsx` líneas 13-19:
```typescript
const products: Product[] = [
  { id: 1, name: 'Chocolate', price: 600, icon: '🍫' },
  // Modifica aquí
]
```

### Cambiar colores
Edita `src/index.css` líneas 3-11:
```css
:root {
  --cream: #FFF8F0;
  --peach: #FFD4B8;
  --coral: #FF9B85;
  /* Modifica aquí */
}
```

## 🆘 Solución de Problemas

### El build falla
```bash
# Limpia e instala de nuevo
rm -rf node_modules package-lock.json
npm install
npm run build
```

### No se ve en Vercel
1. Verifica que el repositorio esté público en GitHub
2. Revisa los logs de build en Vercel
3. Asegúrate de que el build local funcione: `npm run build`

## 📞 Soporte
Si tienes problemas, revisa:
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Vite](https://vitejs.dev/)

---

¡Buena suerte con tu tienda de helados! 🍦
