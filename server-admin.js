const express = require("express");
const session = require("express-session");
const path = require("path");
const admin = require("firebase-admin");

const firebaseKey = JSON.parse(process.env.FIREBASE_KEY_JSON);

admin.initializeApp({
  credential: admin.credential.cert(firebaseKey),
  databaseURL: "https://cekilis-sitesi-default-rtdb.europe-west1.firebasedatabase.app"
});

const db = admin.database();
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: "cekilis-secret",
  resave: false,
  saveUninitialized: true
}));

// Giriş Sayfası
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

// Giriş Kontrol
app.post("/admin-login", (req, res) => {
  const { kullaniciAdi, sifre } = req.body;

  console.log("Gelen Kullanıcı Adı:", kullaniciAdi);
  console.log("Gelen Şifre:", sifre);

  if (kullaniciAdi === "focus00" && sifre === "Ortak-6543") {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>Hatalı giriş. Lütfen tekrar deneyin.</h3>");
  }
});

// Admin Paneli Sayfası
app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "views", "admin.html"));
  } else {
    res.redirect("/admin-login");
  }
});

// Yeni Bilet Ekleme
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

// Bilet Güncelleme
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

// Bilet Silme
app.delete("/bilet-sil/:kullanici/:id", (req, res) => {
  const { kullanici, id } = req.params;
  db.ref(`biletler/${kullanici}/${id}`).remove(err => {
    if (err) return res.json({ mesaj: "Silme sırasında hata oluştu." });
    res.json({ mesaj: "Bilet başarıyla silindi." });
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Admin Panel ${PORT} portunda çalışıyor...`);
});