function biletEkle() {
    const kullaniciAdi = document.getElementById("ekleKullaniciAdi").value;
    const biletNumarasi = document.getElementById("ekleBiletNumarasi").value;
    const biletAdedi = document.getElementById("ekleBiletAdedi").value;

    fetch("/bilet-ekle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullaniciAdi, biletNumarasi, biletAdedi })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("ekleSonuc").innerText = data.mesaj;
    });
}

function biletGuncelle() {
    const kullaniciAdi = document.getElementById("guncelleKullaniciAdi").value;
    const biletNumarasi = document.getElementById("guncelleBiletNumarasi").value;
    const biletAdedi = document.getElementById("guncelleBiletAdedi").value;

    fetch("/bilet-guncelle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullaniciAdi, biletNumarasi, biletAdedi })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("guncelleSonuc").innerText = data.mesaj;
    });
}

function tumBiletleriGoster() {
    fetch("/tum-biletler")
    .then(response => response.json())
    .then(data => {
        let biletHTML = "";
        data.forEach(bilet => {
            biletHTML += `<tr>
                <td>${bilet.kullanici_adi}</td>
                <td>${bilet.bilet_numarasi}</td>
                <td>${bilet.bilet_adedi}</td>
                <td>${bilet.tarih}</td>
                <td><button class="sil-btn" onclick="biletSil(${bilet.id})">Sil</button></td>
            </tr>`;
        });

        document.getElementById("tumBiletlerBody").innerHTML = biletHTML;
        document.getElementById("tumBiletlerTablo").style.display = "table";
    });
}

function biletSil(id) {
    if (confirm("Bu bileti silmek istediğinize emin misiniz?")) {
        fetch(`/bilet-sil/${id}`, { method: "DELETE" })
        .then(response => response.json())
        .then(() => tumBiletleriGoster());
    }
}
