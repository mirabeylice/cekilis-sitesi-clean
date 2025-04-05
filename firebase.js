const admin = require("firebase-admin");
const serviceAccount = require("/etc/secrets/firebaseKey.json"); // Render'da Secret File olarak yüklenecek

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();
module.exports = { db };
