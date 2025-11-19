import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1Xv2mPNf4s2oY-Jeh2ev3x0O6qkKNqt4",
  authDomain: "deixacomigo-727ff.firebaseapp.com",
  projectId: "deixacomigo-727ff",
  storageBucket: "deixacomigo-727ff.firebasestorage.app",
  messagingSenderId: "304342645043",
  appId: "1:304342645043:web:893af23b41547a29a1a646"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
