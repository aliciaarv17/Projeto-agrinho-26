// Importa Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0hugbWS4mSHXve6OvnYXSGvunYlga9H0",
  authDomain: "ecoporto-camargo.firebaseapp.com",
  projectId: "ecoporto-camargo",
  storageBucket: "ecoporto-camargo.firebasestorage.app",
  messagingSenderId: "250383491794",
  appId: "1:250383491794:web:2eb0af2b40ed85ab96430b",
  measurementId: "G-DM2KT5XJPV"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Banco de dados
const db = getFirestore(app);

export { db };