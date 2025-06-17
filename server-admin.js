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
    cookie: { maxAge: 30 * 60 * 1000 }
  })
);

app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "admin-login.html"));
});

app.post("/admin-login", (req, res) => {
  const { kullaniciAdi, sifre } = req.body;
  if (kullaniciAdi === "focus00" && sifre === "Ortak-6543") {
    req.session.authenticated = true;
    res.redirect("/admin");
  } else {
    res.send("<h3>Hatalı giriş. Lütfen tekrar deneyin.</h3>");
  }
});

app.get("/admin", (req, res) => {
  if (req.session.authenticated) {
    res.sendFile(path.join(__dirname, "views", "admin.html"));
  } else {
    res.redirect("/admin-login");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin-login");
  });
});

app.post("/toplu-bilet-guncelle", (req, res) => {
  const { kullaniciAdi, biletlerMetin } = req.body;
  if (!kullaniciAdi || !biletlerMetin) {
    return res.status(400).json({ mesaj: "Kullanıcı adı ve biletler gerekli!" });
  }

  const tarih = new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
  const biletler = biletlerMetin.split("\n").map((b) => b.trim()).filter((b) => b);

  const ref = db.ref(`biletler/${kullaniciAdi}`);
  ref.once("value", (snapshot) => {
    const mevcut = snapshot.val() || {};
    const mevcutBiletler = Object.values(mevcut).map((b) => b.bilet_numarasi);

    const yeniBiletler = biletler.filter((b) => !mevcutBiletler.includes(b));

    if (yeniBiletler.length === 0) {
      return res.json({ mesaj: "Tüm biletler zaten kayıtlı." });
    }

    yeniBiletler.forEach((b) => {
      ref.push({ bilet_numarasi: b, bilet_adedi: 1, tarih });
    });

    res.json({ mesaj: `${yeniBiletler.length} yeni bilet başarıyla eklendi.` });
  });
});

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

app.delete("/bilet-sil/:kullanici/:id", (req, res) => {
  const { kullanici, id } = req.params;
  db.ref(`biletler/${kullanici}/${id}`).remove((err) => {
    if (err) return res.json({ mesaj: "Silme sırasında hata oluştu." });
    res.json({ mesaj: "Bilet başarıyla silindi." });
  });
});

app.delete("/tum-biletleri-sil", (req, res) => {
  db.ref("biletler").remove((err) => {
    if (err) return res.json({ mesaj: "Tüm biletleri silerken hata oluştu." });
    res.json({ mesaj: "Tüm biletler başarıyla silindi." });
  });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Admin Panel ${PORT} portunda çalışıyor...`);
});
