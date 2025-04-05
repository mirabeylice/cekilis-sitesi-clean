require("dotenv").config();
const admin = require("firebase-admin");

let firebaseKey;

try {
  firebaseKey = JSON.parse(process.env.FIREBASE_KEY_JSON);
} catch (err) {
  console.error("FIREBASE_KEY_JSON env değişkeni okunamadı veya parse edilemedi.");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();
module.exports = { db };
