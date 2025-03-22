const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");

// Türkiye saat dilimini almak için
const getTurkeyTime = () => {
    return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
};

const app = express();
const db = new sqlite3.Database("./database/biletler.db");

app.use(express.static("public"));
app.use(bodyParser.json());

// **Ana Sayfa**
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// **Admin Paneli**
app.get("/admin", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "admin.html"));
});

// **Bilet Ekleme (Mevcutta Bileti Varsa Uyarı Veriyor!)**
app.post("/bilet-ekle", (req, res) => {
    const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
    const tarih = getTurkeyTime(); // Türkiye saatine göre tarih al

    db.get("SELECT * FROM biletler WHERE kullanici_adi = ?", [kullaniciAdi], (err, row) => {
        if (err) return res.json({ mesaj: "Bilet kontrol edilirken hata oluştu." });

        if (row) {
            return res.json({ mesaj: "Bu kullanıcıya ait zaten biletler var! Yeni bilet eklemek için 'Bilet Güncelle' bölümünü kullanın." });
        }

        db.run("INSERT INTO biletler (kullanici_adi, bilet_numarasi, bilet_adedi, tarih) VALUES (?, ?, ?, ?)", 
            [kullaniciAdi, biletNumarasi, biletAdedi, tarih], 
            err => {
                if (err) return res.json({ mesaj: "Bilet eklenirken hata oluştu." });
                res.json({ mesaj: "Bilet başarıyla eklendi!" });
            }
        );
    });
});

// **Bilet Güncelleme (Mevcut biletler korunarak yeni ekleme yapılıyor)**
app.post("/bilet-guncelle", (req, res) => {
    const { kullaniciAdi, biletNumarasi, biletAdedi } = req.body;
    const tarih = getTurkeyTime(); // Türkiye saatine göre tarih al

    db.run("INSERT INTO biletler (kullanici_adi, bilet_numarasi, bilet_adedi, tarih) VALUES (?, ?, ?, ?)", 
        [kullaniciAdi, biletNumarasi, biletAdedi, tarih], 
        err => {
            if (err) return res.json({ mesaj: "Bilet güncellenirken hata oluştu." });
            res.json({ mesaj: "Bilet başarıyla güncellendi!" });
        }
    );
});

// **Tüm Biletleri Getir**
app.get("/tum-biletler", (req, res) => {
    db.all("SELECT * FROM biletler", [], (err, rows) => {
        if (err) return res.json([]);
        res.json(rows);
    });
});

// **Bilet Silme**
app.delete("/bilet-sil/:id", (req, res) => {
    db.run("DELETE FROM biletler WHERE id = ?", [req.params.id], err => {
        if (err) return res.json({ mesaj: "Silme sırasında hata oluştu." });
        res.json({ mesaj: "Bilet başarıyla silindi." });
    });
});

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor...`));
