const express = require("express");
const session = require("express-session");
const path = require("path");
const { db } = require("./firebase");

const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "cekilis-secret",
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 dk
}));

// Admin Giriş Sayfası
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

// Giriş Kontrol
app.post("/admin-login", (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  if (kullaniciAdi === "focus00" && sifre === "Ortak-6543") {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>Hatalı giriş bilgisi</h3>");
  }
});

// Admin Panel
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

// Bilet Ekle
app.post("/bilet-ekle", (req, res) => {
  const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.once("value", snapshot => {
    if (snapshot.exists()) {
      res.json({ mesaj: "Bu kullanıcıya ait zaten bilet var. Güncelle bölümünü kullanın." });
    } else {
      ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
      res.json({ mesaj: "Bilet başarıyla eklendi." });
    }
  });
});

// Bilet Güncelle
app.post("/bilet-guncelle", (req, res) => {
  const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.push({ bilet_numarasi: biletNumarasi, bilet_adedi: biletAdedi, tarih });
  res.json({ mesaj: "Yeni bilet başarıyla eklendi." });
});

// Tüm Biletler
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

// Silme
app.delete("/bilet-sil/:kullanici/:id", (req, res) => {
  const { kullanici, id } = req.params;
  db.ref(`biletler/${kullanici}/${id}`).remove(err => {
    if (err) return res.json({ mesaj: "Silme hatası." });
    res.json({ mesaj: "Bilet silindi." });
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Admin panel ${PORT} portunda çalışıyor`);
});
