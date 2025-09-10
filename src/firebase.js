// src/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser et exporter l'instance de la base de données Firestore
// C'est cette ligne qui rend "db" disponible pour le reste de votre application.
export const db = getFirestore(app);