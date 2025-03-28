// Bilet Ekle
function biletEkle() {
    const kullaniciAdi = document.getElementById("yeniKullaniciAdi").value;
    const biletNumarasi = document.getElementById("yeniBiletNumarasi").value;
    const biletAdedi = parseInt(document.getElementById("yeniBiletAdedi").value);
  
    fetch("/bilet-ekle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullaniciAdi, biletNumarasi, biletAdedi })
    })
    .then(res => res.json())
    .then(data => alert(data.mesaj))
    .catch(() => alert("Bir hata oluştu!"));
  }
  
  // Bilet Güncelle
  function biletGuncelle() {
    const kullaniciAdi = document.getElementById("guncelleKullaniciAdi").value;
    const biletNumarasi = document.getElementById("guncelleBiletNumarasi").value;
    const biletAdedi = parseInt(document.getElementById("guncelleBiletAdedi").value);
  
    fetch("/bilet-guncelle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kullaniciAdi, biletNumarasi, biletAdedi })
    })
    .then(res => res.json())
    .then(data => alert(data.mesaj))
    .catch(() => alert("Bir hata oluştu!"));
  }
  
  // Tüm Biletleri Göster
  function tumBiletleriGoster() {
    fetch("/tum-biletler")
      .then(res => res.json())
      .then(data => {
        const liste = document.getElementById("biletListesi");
        liste.innerHTML = "";
  
        data.forEach(bilet => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>Kullanıcı:</strong> ${bilet.kullanici_adi} |
            <strong>Bilet No:</strong> ${bilet.bilet_numarasi} |
            <strong>Adet:</strong> ${bilet.bilet_adedi} |
            <strong>Tarih:</strong> ${bilet.tarih}
            <button class="sil-btn" onclick="biletSil('${bilet.kullanici_adi}', '${bilet.id}')">Sil</button>
          `;
          liste.appendChild(li);
        });
      })
      .catch(() => alert("Biletler alınırken hata oluştu!"));
  }
  
  // Bilet Silme
  function biletSil(kullanici, id) {
    const eminMisin = confirm("Bu bileti silmek istediğinize emin misiniz?");
    if (!eminMisin) return;
  
    fetch(`/bilet-sil/${kullanici}/${id}`, {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
      alert(data.mesaj);
      tumBiletleriGoster();
    })
    .catch(() => alert("Silme işlemi sırasında hata oluştu!"));
  }
  