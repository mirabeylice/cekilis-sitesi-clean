require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { db } = require("./firebase");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "cekilis-secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 30 * 60 * 1000 },
  })
);

// Admin Login Sayfası
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

// Login Kontrol
app.post("/admin-login", (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  if (kullaniciAdi === "focus00" && sifre === "Ortak-6543") {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>Hatalı giriş. Lütfen tekrar deneyin.</h3>");
  }
});

// Admin Panel Sayfası
app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "views", "admin.html"));
  } else {
    res.redirect("/admin-login");
  }
});

// Çıkış
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
  ref.once("value", (snapshot) => {
    const veriler = snapshot.val();

    if (veriler) {
      const ayniBiletVar = Object.values(veriler).some(
        (bilet) => bilet.bilet_numarasi === biletNumarasi
      );

      if (ayniBiletVar) {
        return res.json({ mesaj: "Bu bilet numarası zaten eklenmiş!" });
      }

      return res.json({
        mesaj:
          "Bu kullanıcıya ait zaten biletler var! Lütfen 'Bilet Güncelle' bölümünü kullanın.",
      });
    }

    ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
    res.json({ mesaj: "Bilet başarıyla eklendi!" });
  });
});

// Bilet Güncelle
app.post("/bilet-guncelle", (req, res) => {
  const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.once("value", (snapshot) => {
    const veriler = snapshot.val();

    if (veriler) {
      const ayniBiletVar = Object.values(veriler).some(
        (bilet) => bilet.bilet_numarasi === biletNumarasi
      );

      if (ayniBiletVar) {
        return res.json({
          mesaj: "Bu bilet numarası zaten kayıtlı. Aynı bilet tekrar eklenemez!",
        });
      }
    }

    ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
    res.json({ mesaj: "Yeni bilet başarıyla eklendi!" });
  });
});

// ✅ TOPLU BİLET GÜNCELLE
app.post("/toplu-bilet-guncelle", (req, res) => {
  const { kullaniciAdi, biletListesi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  if (!kullaniciAdi || !Array.isArray(biletListesi) || biletListesi.length === 0) {
    return res.status(400).json({ mesaj: "Geçersiz istek." });
  }

  const ref = db.ref(`biletler/${kullaniciAdi}`);

  ref.once("value", (snapshot) => {
    const mevcutlar = snapshot.val() || {};

    const zatenEkliOlanlar = [];
    const yeniEklenecekler = [];

    biletListesi.forEach((biletNo) => {
      const zatenVar = Object.values(mevcutlar).some(
        (bilet) => bilet.bilet_numarasi === biletNo
      );

      if (zatenVar) {
        zatenEkliOlanlar.push(biletNo);
      } else {
        yeniEklenecekler.push(biletNo);
      }
    });

    yeniEklenecekler.forEach((biletNo) => {
      ref.push({ bilet_numarasi: biletNo, bilet_adedi: 1, tarih });
    });

    const mesaj = `✅ ${yeniEklenecekler.length} bilet eklendi.` +
      (zatenEkliOlanlar.length > 0 ? ` ⚠️ ${zatenEkliOlanlar.length} tanesi zaten kayıtlıydı.` : "");

    res.json({ mesaj });
  });
});

// Tüm Biletler
app.get("/tum-biletler", (req, res) => {
  db.ref("biletler").once("value", (snapshot) => {
    const veriler = snapshot.val() || {};
    const tumBiletler = [];

    Object.keys(veriler).forEach((kullanici) => {
      Object.entries(veriler[kullanici]).forEach(([id, detay]) => {
        tumBiletler.push({ id, kullanici_adi: kullanici, ...detay });
      });
    });

    res.json(tumBiletler);
  });
});

// Silme
app.delete("/bilet-sil/:kullanici/:id", (req, res) => {
  const { kullanici, id } = req.params;
  db.ref(`biletler/${kullanici}/${id}`).remove((err) => {
    if (err) return res.json({ mesaj: "Silme sırasında hata oluştu." });
    res.json({ mesaj: "Bilet başarıyla silindi." });
  });
});

// PORT
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Admin Panel ${PORT} portunda çalışıyor...`);
});
