let listeAcik = false;

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

function topluBiletGuncelle() {
  const kullaniciAdi = document.getElementById("guncelleKullaniciAdi").value;
  const biletNumaralari = document.getElementById("guncelleBiletNumaralari").value
    .split('\n')
    .map(satir => satir.trim())
    .filter(satir => satir.length > 0);

  fetch("/toplu-bilet-guncelle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullaniciAdi, biletNumaralari })
  })
    .then(res => res.json())
    .then(data => alert(data.mesaj));
}

function tumBiletleriToggle() {
  const btn = document.getElementById("toggleBtn");
  const liste = document.getElementById("biletListesi");

  if (!listeAcik) {
    fetch("/tum-biletler")
      .then(res => res.json())
      .then(biletler => {
        liste.innerHTML = "";

        if (biletler.length === 0) {
          liste.innerHTML = "<li>Hiç bilet bulunamadı.</li>";
        } else {
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
        }

        listeAcik = true;
        btn.textContent = "Kapat";
      });
  } else {
    liste.innerHTML = "";
    listeAcik = false;
    btn.textContent = "Tüm Biletleri Göster";
  }
}

function biletSil(kullanici, id) {
  fetch(`/bilet-sil/${kullanici}/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.mesaj);
      tumBiletleriToggle(); // Listeyi kapat
      if (!listeAcik) document.getElementById("toggleBtn").click(); // ve tekrar aç
    });
}
