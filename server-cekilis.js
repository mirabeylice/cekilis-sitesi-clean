const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const admin = require("firebase-admin"); // Firebase Admin SDK

// Firebase servisini başlatmak için çevresel değişkenden anahtar verisini alıyoruz
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const app = express();
const db = new sqlite3.Database("./database/biletler.db");

// Türkiye saat dilimini almak için
const getTurkeyTime = () => {
  return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
};

app.use(express.static("public"));
app.use(express.json());

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Kullanıcı adına göre biletleri sorgulama
app.get("/cekilis", (req, res) => {
  const kullaniciAdi = req.query.sorgu;

  if (!kullaniciAdi) {
    return res.json({ mesaj: "Kullanıcı adı gerekli.", biletler: [], toplamBilet: 0 });
  }

  db.all(
    "SELECT bilet_numarasi, bilet_adedi, tarih FROM biletler WHERE kullanici_adi = ?",
    [kullaniciAdi],
    (err, rows) => {
      if (err) {
        return res.json({ mesaj: "Veri alınırken hata oluştu.", biletler: [], toplamBilet: 0 });
      }

      const toplamBilet = rows.reduce((toplam, row) => toplam + row.bilet_adedi, 0);

      res.json({
        mesaj: "Biletler başarıyla listelendi.",
        biletler: rows,
        toplamBilet,
      });
    }
  );
});

// Sunucuyu başlat
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Çekiliş Sayfası ${PORT} portunda çalışıyor...`);
});
