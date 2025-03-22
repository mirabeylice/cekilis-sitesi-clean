// firebase.js
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");

const firebaseConfig = {
  apiKey: "AIzaSyBZoPGtdP_V3I3z7yWPk_u1N8fl0hmkZCk",
  authDomain: "cekilis-sitesi.firebaseapp.com",
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cekilis-sitesi",
  storageBucket: "cekilis-sitesi.firebasestorage.app",
  messagingSenderId: "93416480100",
  appId: "1:93416480100:web:3401277e9d7d34a2036e71"
};

// Firebase bağlantısını başlat
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = database;
