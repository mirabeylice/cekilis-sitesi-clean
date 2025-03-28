/// firebase.js
const admin = require("firebase-admin");

// Çevresel değişkenden (env) firebase anahtarını alıyoruz
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

module.exports = db;

