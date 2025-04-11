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
      (zatenEkliOlanlar.length > 0 ? `\n⚠️ ${zatenEkliOlanlar.length} tanesi zaten kayıtlıydı.` : "");

    res.json({ mesaj });
  });
});
