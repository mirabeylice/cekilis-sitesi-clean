function topluBiletGuncelle() {
  const kullaniciAdi = document.getElementById("guncelleKullaniciAdi").value;
  const biletlerMetin = document.getElementById("topluBiletler").value;

  fetch("/toplu-bilet-guncelle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kullaniciAdi, biletlerMetin })
  })
  .then(res => res.json())
  .then(data => alert(data.mesaj))
  .catch(err => alert("Hata oluştu: " + err));
}

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

function toggleBiletler() {
  const liste = document.getElementById("biletListesi");
  const btn = document.getElementById("toggleBiletlerBtn");

  if (liste.style.display === "none") {
    tumBiletleriGoster();
    liste.style.display = "block";
    btn.textContent = "Kapat";
  } else {
    liste.style.display = "none";
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
    tumBiletleriGoster();
  });
}

function tumBiletleriSil() {
  if (confirm("Tüm biletleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz!")) {
    fetch("/tum-biletleri-sil", {
      method: "DELETE"
    })
    .then(res => res.json())
    .then(data => {
      alert(data.mesaj);
      tumBiletleriGoster();
    });
  }
}
