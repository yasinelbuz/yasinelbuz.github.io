---
title: "Sıfırdan Mayın Tarlası Oyunu Yazdım: Oyun Mantığı ve Algoritmalar"
description: "Nostaljik Mayın Tarlası oyununu web teknolojileriyle sıfırdan nasıl geliştirdim? Matris veri yapısı, Flood Fill algoritması ve komşuluk taraması ile kodlama rehberi."
pubDate: "Aug 24, 2026"
heroImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop"
---

Oyun geliştirmek her zaman benim için ayrı bir tutku oldu. Bu kez retro oyunların şahı, bilgisayar tarihinin en ikonik oyunlarından biri olan **Mayın Tarlası (Minesweeper)** oyununu sıfırdan web ortamına taşıdım.

İlk bakışta basit bir ızgaradan ibaret görünse de, arka planda dinamik veri yapıları, matris işlemleri ve özyinelemeli (recursive) arama algoritmaları barındıran harika bir algoritmik pratik projesi.

Bu yazıda Mayın Tarlası oyununu yazarken kullandığım mantığı, arkasındaki algoritmaları ve mimariyi adım adım paylaşıyorum.

---

### 1. Oyunun Temel Kuralları ve Mimarisi

Mayın Tarlası'nın temel amacı; tahtadaki tüm mayınsız hücreleri açmak ve hiçbir mayına basmamaktır.

Oyun mimarimizi kurarken temel olarak 3 ana katman üzerinden ilerledik:
1. **Veri Modeli (State & Grid Matrix)**: Tahtadaki her bir hücrenin durumunu tutan 2 boyutlu matris yapısı.
2. **Algoritma Katmanı**: Mayın yerleştirme, komşuluk hesaplama ve boş alanları otomatik açma (Flood Fill).
3. **Arayüz ve Etkileşim (DOM / UI)**: Kullanıcının sol tık (hücre açma) ve sağ tık (bayrak koyma) aksiyonları.

---

### 2. Hücre Yapısı ve Matris Veri Modeli

Oyun alanını $N \times M$ boyutunda bir 2D matris olarak temsil ediyoruz. Her bir hücre (Cell) kendi içinde şu durumlara sahiptir:

```typescript
type Cell = {
  row: number;
  col: number;
  isMine: boolean;       // Hücrede mayın var mı?
  isRevealed: boolean;   // Hücre açıldı mı?
  isFlagged: boolean;    // Hücreye bayrak konuldu mu?
  neighborMines: number; // Etrafındaki 8 komşudaki toplam mayın sayısı
};
```

Oyun başladığında tüm hücreler `isRevealed: false` ve `isFlagged: false` olarak başlatılır.

---

### 3. Rastgele Mayın Dağıtımı ve Güvenli İlk Tıklama

Mayınların rastgele dağıtılması oyunun tekrarlanabilirliğini sağlar. Ancak oyuncunun daha ilk tıklamada kaybetmesi can sıkıcı olacağı için **ilk tıklama güvenliği (First Click Safety)** uygulanır:

1. Kullanıcı ilk hücreye tıklar.
2. Matris üzerinde belirlenen sayıda ($K$ adet) mayın rastgele üretilir, ancak kullanıcının tıkladığı koordinat ve etrafındaki alan muaf tutulur.
3. Mayınlar yerleştirildikten sonra komşuluk sayıları hesaplanır.

---

### 4. Komşuluk Taraması (8-Yönlü Matris Arama)

Bir hücre açıldığında üzerinde yazan sayı, o hücreye komşu (çaprazlar dahil 8 yön) hücrelerdeki toplam mayın sayısını ifade eder.

8 komşu hücreyi kontrol etmek için satır ve sütun offset'lerini kullanıyoruz:

```javascript
const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [ 0, -1],          [ 0, 1],
  [ 1, -1], [ 1, 0], [ 1, 1]
];

function countAdjacentMines(board, r, c) {
  let count = 0;
  for (const [dr, dc] of directions) {
    const nr = r + dr;
    const nc = c + dc;
    // Tahta sınırları içerisinde mi ve mayın var mı kontrol et
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      if (board[nr][nc].isMine) {
        count++;
      }
    }
  }
  return count;
}
```

---

### 5. Boş Alanların Otomatik Açılması: Flood Fill Algoritması

Mayın Tarlası'nın en keyifli kısmı, etrafında hiç mayın olmayan (`neighborMines === 0`) bir hücreye tıklandığında koca bir alanın zincirleme şekilde açılmasıdır.

Bu durum klasik **Flood Fill (Su Basma / Taşma)** algoritması ile çözülür. Rekürsif (özyinelemeli) veya bir Queue (kuyruk) yapısıyla çalışır:

1. Tıklanan hücre `neighborMines === 0` ise hücreyi aç (`isRevealed = true`).
2. Etrafındaki 8 komşu hücreyi dolaş.
3. Komşu hücre kapalıysa ve bayraklanmamışsa onu da aç.
4. Eğer komşu hücrenin de etrafında 0 mayın varsa, onun komşularını da açmak için mantığı özyinelemeli olarak çalıştır.

```javascript
function revealCell(board, r, c) {
  // Sınır kontrolü veya zaten açılmış/bayraklı hücre kontrolü
  if (r < 0 || r >= rows || c < 0 || c >= cols) return;
  const cell = board[r][c];
  if (cell.isRevealed || cell.isFlagged) return;

  cell.isRevealed = true;

  // Eğer bu hücrenin etrafında hiç mayın yoksa, komşularını da otomatik aç
  if (cell.neighborMines === 0 && !cell.isMine) {
    for (const [dr, dc] of directions) {
      revealCell(board, r + dr, c + dc);
    }
  }
}
```

---

### 6. Kazanma ve Kaybetme Durumları

- **Oyun Bitti (Game Over)**: Oyuncu `isMine === true` olan bir hücreye tıkladığında tüm mayınlar görünür yapılır, zamanlayıcı durdurulur ve oyun biter.
- **Kazanma (Victory)**: Mayın olmayan tüm hücreler (`isRevealed === true`) açıldığında oyuncu oyunu kazanmış olur!

---

### Projeyi Deneyin! 🚀

Geliştirdiğim Mayın Tarlası oyununu doğrudan tarayıcınızda oynamak isterseniz aşağıdaki bağlantıdan ulaşabilirsiniz:

👉 **[Mayın Tarlası Oyunu Oyna](https://yasinelbuz.github.io/mayin-tarlasi/)**

Keyifli oyunlar ve iyi kodlamalar! 👋
