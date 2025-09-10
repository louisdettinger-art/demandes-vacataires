// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Votre configuration personnelle pour l'application Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD-Oj6Grh7ji0iOOIMLtY2K5RjwY67I37o",
  authDomain: "demandes-vacataires.firebaseapp.com",
  projectId: "demandes-vacataires",
  storageBucket: "demandes-vacataires.appspot.com",
  messagingSenderId: "151192609691",
  appId: "1:151192609691:web:63576c16c9a8eba32d373e",
  measurementId: "G-FHZMBP4BKE"
};

// Initialiser les services Firebase
const app = initializeApp(firebaseConfig);

// Exporter les instances pour les utiliser dans toute l'application
export const db = getFirestore(app);
export const auth = getAuth(app);