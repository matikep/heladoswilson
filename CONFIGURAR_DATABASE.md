# ⚠️ IMPORTANTE: Configurar Realtime Database

## 🔥 Paso Crítico que Falta

Necesitas habilitar **Realtime Database** en Firebase Console:

### 📋 Pasos:

1. **Ve a Firebase Console:**
   https://console.firebase.google.com/project/heladoswilson/database

2. **En el menú lateral, busca "Realtime Database"**
   (NO "Firestore Database", son diferentes)

3. **Click en "Crear base de datos"**

4. **Ubicación:** Selecciona "United States (us-central1)"

5. **Reglas de seguridad:** Selecciona "Comenzar en modo de prueba"
   
6. **Click en "Habilitar"**

7. **Configurar Reglas de Seguridad:**
   - Ve a la pestaña "Reglas"
   - Reemplaza el contenido con:
   
   ```json
   {
     "rules": {
       "stock": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```
   
   - Click en "Publicar"

8. **Verifica la URL:**
   - Deberías ver algo como: `https://heladoswilson-default-rtdb.firebaseio.com`
   - Esta URL ya está en tu `firebase.ts` ✅

## ✅ Después de Configurar

Una vez que hayas completado estos pasos, la aplicación funcionará correctamente.

## 🧪 Probar que Funciona

1. Reinicia el servidor de desarrollo:
   ```bash
   # Detén el servidor actual (Ctrl+C)
   npm run dev
   ```

2. Abre http://localhost:5173/admin
3. Ingresa la contraseña: `helados2024`
4. Deberías ver el panel de administración
5. Actualiza el stock de un producto
6. Abre http://localhost:5173/ en otra pestaña
7. ¡El stock debería actualizarse automáticamente!

## 🚨 Si Ves Errores

**Error: "Permission denied"**
- Verifica que las reglas de seguridad estén configuradas correctamente

**Error: "Database not found"**
- Asegúrate de haber creado la Realtime Database (no Firestore)

**La página se queda cargando**
- Verifica que el `databaseURL` en `firebase.ts` sea correcto
- Abre la consola del navegador (F12) para ver errores específicos
