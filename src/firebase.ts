// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Firebase
// Los obtendrás en: https://console.firebase.google.com/

import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBjBKNEbRWErgbS582OJTILEm55_cVAsa4",
  authDomain: "heladoswilson.firebaseapp.com",
  databaseURL: "https://heladoswilson-default-rtdb.firebaseio.com",
  projectId: "heladoswilson",
  storageBucket: "heladoswilson.firebasestorage.app",
  messagingSenderId: "1081356092084",
  appId: "1:1081356092084:web:6aae09886127a898ec8de1",
  measurementId: "G-9D37MEX1GB"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
