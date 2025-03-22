const express = require("express");
const path = require("path");
const fs = require("fs");

// Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();

const app = express();
app.use(express.static("public"));
app.use(express.json());

// Türkiye saat dilimini almak için
const getTurkeyTime = () => {
  return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
};

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Kullanıcı adına göre biletleri sorgulama
app.get("/cekilis", async (req, res) => {
  const kullaniciAdi = req.query.sorgu;
  if (!kullaniciAdi) {
    return res.json({ mesaj: "Kullanıcı adı gerekli.", biletler: [], toplamBilet: 0 });
  }

  try {
    const ref = db.ref("biletler");
    const snapshot = await ref.orderByChild("kullanici_adi").equalTo(kullaniciAdi).once("value");

    const biletlerObj = snapshot.val();
    if (!biletlerObj) {
      return res.json({ mesaj: "Bu kullanıcıya ait bilet bulunamadı.", biletler: [], toplamBilet: 0 });
    }

    const biletler = Object.values(biletlerObj);
    const toplamBilet = biletler.reduce((toplam, b) => toplam + b.bilet_adedi, 0);

    res.json({
      mesaj: "Biletler başarıyla listelendi.",
      biletler,
      toplamBilet
    });
  } catch (err) {
    console.error(err);
    res.json({ mesaj: "Veri alınırken hata oluştu.", biletler: [], toplamBilet: 0 });
  }
});

// Sunucuyu başlat
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Çekiliş Sayfası ${PORT} portunda çalışıyor...`);
});
