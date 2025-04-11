// Yeni Bilet Ekleme
function biletEkle() {
  const kullaniciAdi = document.getElementById("yeniKullaniciAdi").value;
  const biletNumarasi = document.getElementById("yeniBiletNumarasi").value;
  const biletAdedi = document.getElementById("yeniBiletAdedi").value;

  fetch("/bilet-ekle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullaniciAdi, biletNumarasi, biletAdedi })
  })
  .then(res => res.json())
  .then(data => alert(data.mesaj));
}

// Toplu Bilet Güncelleme
function topluBiletGuncelle() {
  const kullaniciAdi = document.getElementById("guncelleKullaniciAdi").value.trim();
  const biletListesi = document.getElementById("guncelleTopluBiletler").value.trim().split("\n").filter(Boolean);

  if (!kullaniciAdi || biletListesi.length === 0) {
    return alert("Kullanıcı adı ve en az bir bilet numarası girilmelidir.");
  }

  fetch("/toplu-bilet-guncelle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullaniciAdi, biletListesi })
  })
  .then(res => res.json())
  .then(data => alert(data.mesaj))
  .catch(err => alert("Bir hata oluştu: " + err.message));
}

// Tüm Biletleri Listeleme
function tumBiletleriGoster() {
  fetch("/tum-biletler")
    .then(res => res.json())
    .then(biletler => {
      const liste = document.getElementById("biletListesi");
      liste.innerHTML = "";

      if (biletler.length === 0) {
        liste.innerHTML = "<li>Hiç bilet bulunamadı.</li>";
        return;
      }

      biletler.forEach(bilet => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${bilet.kullanici_adi}</strong> - 
          Bilet: ${bilet.bilet_numarasi} 
          | Adet: ${bilet.bilet_adedi} 
          | Tarih: ${bilet.tarih}
          <button onclick="biletSil('${bilet.kullanici_adi}', '${bilet.id}')">Sil</button>
        `;
        liste.appendChild(li);
      });
    });
}

// Bilet Silme
function biletSil(kullanici, id) {
  fetch(`/bilet-sil/${kullanici}/${id}`, {
    method: "DELETE"
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mesaj);
    tumBiletleriGoster();
  });
}
