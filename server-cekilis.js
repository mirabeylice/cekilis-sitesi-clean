require("dotenv").config();
const express = require("express");
const path = require("path");
const { db } = require("./firebase"); // << düzeltildi

const app = express();

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

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.once("value", (snapshot) => {
    const veriler = snapshot.val() || {};
    const biletler = Object.values(veriler);
    const toplamBilet = biletler.reduce((toplam, b) => toplam + Number(b.bilet_adedi || 0), 0);

    res.json({
      mesaj: "Biletler başarıyla listelendi.",
      biletler,
      toplamBilet,
    });
  }, (error) => {
    console.error("Firebase hatası:", error);
    res.status(500).json({ mesaj: "Veri alınırken bir hata oluştu.", biletler: [], toplamBilet: 0 });
  });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Çekiliş Sayfası ${PORT} portunda çalışıyor...`);
});
