require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { db } = require("./firebase"); // Firebase config bu dosyadan geliyor

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "cekilis-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 dakika işlemsizlikte oturumu bitir
}));

// Admin Login Sayfası
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

// Giriş Kontrolü
app.post("/admin-login", (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  if (kullaniciAdi === "focus00" && sifre === "Ortak-6543") {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>Hatalı giriş. Lütfen tekrar deneyin.</h3>");
  }
});

// Admin Paneli
app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "views", "admin.html"));
  } else {
    res.redirect("/admin-login");
  }
});

// Oturum Sonlandırma
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login");
  });
});

// Yeni Bilet Ekle
app.post("/bilet-ekle", (req, res) => {
  const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.once("value", snapshot => {
    if (snapshot.exists()) {
      res.json({ mesaj: "Bu kullanıcıya ait zaten biletler var! Lütfen 'Bilet Güncelle' bölümünü kullanın." });
    } else {
      ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
      res.json({ mesaj: "Bilet başarıyla eklendi!" });
    }
  });
});

// Bilet Güncelle
app.post("/bilet-guncelle", (req, res) => {
  const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
  res.json({ mesaj: "Yeni bilet başarıyla eklendi!" });
});

// Tüm Biletleri Getir
app.get("/tum-biletler", (req, res) => {
  db.ref("biletler").once("value", snapshot => {
    const veriler = snapshot.val() || {};
    const tumBiletler = [];
    Object.keys(veriler).forEach(kullanici => {
      Object.entries(veriler[kullanici]).forEach(([id, detay]) => {
        tumBiletler.push({ id, kullanici_adi: kullanici, ...detay });
      });
    });
    res.json(tumBiletler);
  });
});

// Bilet Sil
app.delete("/bilet-sil/:kullanici/:id", (req, res) => {
  const { kullanici, id } = req.params;
  db.ref(`biletler/${kullanici}/${id}`).remove(err => {
    if (err) return res.json({ mesaj: "Silme sırasında hata oluştu." });
    res.json({ mesaj: "Bilet başarıyla silindi." });
  });
});

// Sunucu Başlat
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`✅ Admin paneli ${PORT} portunda çalışıyor...`);
});
