import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKrW_7Dtwg_jFx9rgcMppS2SUK_a6YXRk",
  authDomain: "lensillumination-e037f.firebaseapp.com",
  projectId: "lensillumination-e037f",
  storageBucket: "lensillumination-e037f.firebasestorage.app",
  messagingSenderId: "506026714558",
  appId: "1:506026714558:web:bbdfd65961c57d50f085ef",
  measurementId: "G-1HSDKVM98E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);