import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, inMemoryPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

// Firebase Authentication: aquí viven las cuentas (correo y contraseña).
// La sesión vive en memoria: al cerrar la app hay que volver a entrar.
export const auth = initializeAuth(app, { persistence: inMemoryPersistence });
auth.languageCode = "es"; // los correos de Firebase llegan en español

// Segunda "copia" de Firebase Authentication que usa el admin para crear
// cuentas de empleados. Si la creara con "auth", Firebase cerraría la sesión
// del admin y lo dejaría dentro como el empleado nuevo.
const appSecundaria = initializeApp(firebaseConfig, "secundaria");
export const authSecundaria = initializeAuth(appSecundaria, { persistence: inMemoryPersistence });
