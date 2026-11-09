# jurvia-social: haftalık gönderi üretimi

Bu depo Jurvia'nın Instagram ve LinkedIn gönderi kuyruğudur. GitHub Actions `queue/` içindeki gönderileri Salı ve Cuma günleri yayınlar (`.github/workflows/publish.yml`). Senin işin kuyruğu doldurmak.

## Her çalıştırmada

1. `main` dalını güncelle. `content/urun-bilgileri.md`, `content/kurallar.md`, `state/published.json` ve `queue/` içindeki son 8 gönderiyi oku.
2. Bugünden (Europe/Istanbul) sonraki, kuyrukta henüz gönderisi olmayan **ilk iki** Salı/Cuma tarihini bul. Bugünden sonra zaten 4 veya daha fazla gönderi bekliyorsa hiçbir şey üretme.
3. Her tarih için bir gönderi yaz: `queue/<YYYY-MM-DD>-<kisa-slug>/post.json` (şema: aşağıda ve mevcut gönderiler).
   - Konu `urun-bilgileri.md` içinde `status: mevcut` olanlardan seçilir. Son iki gönderinin konusunu kullanma; en az kullanılmış konuyu tercih et.
   - Yalnız o konunun maddelerinde yazanları anlat. Madde olmayan özellik, rakam, müşteri, tarih, fiyat **uydurma**. Hukuki terim, mevzuat, süre hesabı, tavsiye yazma.
   - Düzeni değiştir: son gönderiden farklı `layout` ve `theme` (dark/light sırayla). Ayda en az bir kaydırmalı (2–4 slayt) gönderi olsun.
   - Instagram metni 300–900 karakter, link yok, sonunda "Link profilde." ve 3–5 hashtag. LinkedIn metni 300–1300 karakter, `{link}` bir kez, en fazla 3 hashtag.
4. Çalıştır ve her şey geçene kadar düzelt:
   ```
   node tools/render.mjs <klasör> [<klasör>]
   node tools/lint.mjs --images
   npm test
   ```
   Görsellerden birini açıp metnin taşmadığını ve okunduğunu gözle kontrol et.
5. Yalnız yeni `queue/<klasör>/` dosyalarını commit'le ("Queue posts for <tarihler>") ve `main`'e push et.
6. Özet olarak hangi tarihe hangi konuyu koyduğunu ve `state/published.json` içinde `_last_error` olan kayıtları bildir.

## Yapma

- Yayınlanmış (`state/published.json` içinde olan) gönderiyi değiştirme veya silme. `state/`, `tools/`, `.github/` ve `content/` dosyalarını değiştirme. Bir kural ya da betik hatalı görünüyorsa değiştirmek yerine özette bildir.
- Lint'i geçmek için kuralı esnetecek dolambaçlı yazım (ör. yasaklı kelimeyi bölmek) kullanma.
- Gerçek kişi, kurum, dosya numarası veya ekran görüntüsü kullanma; kimseyi etiketleme.

## post.json şeması

```json
{
  "id": "2026-11-24-takvim-hazirlik",          // klasör adıyla aynı
  "publish_on": "2026-11-24",                   // Salı veya Cuma
  "topic": "takvim",                            // urun-bilgileri.md konu kimliği
  "utm_content": "takvim_hazirlik",            // [a-z0-9_]
  "theme": "dark",                              // dark | light (slayt bazında da verilebilir)
  "slides": [                                   // 1-6 slayt, 1080x1350 JPEG'e çizilir
    { "layout": "statement", "eyebrow": "...", "headline": "Satır\n*vurgulu kısım*", "body": "≤260 karakter" },
    { "layout": "steps", "eyebrow": "...", "headline": "...", "steps": [ {"title": "≤34", "text": "≤90"} ×3 ] },
    { "layout": "grid",  "eyebrow": "...", "headline": "...", "cards": [ {"title": "...", "text": "..."} ×4 ] },
    { "layout": "list",  "eyebrow": "...", "headline": "...", "items": [ {"title": "...", "text": "...", "mark": "✓"} ×2-3 ] }
  ],
  "instagram": { "caption": "..." },
  "linkedin": { "text": "... {link} ..." }
}
```
`image` düzeni yalnız elle hazırlanmış görseller içindir (slide-N.jpg hazır gelir); yeni gönderilerde kullanma.
Başlıkta `*...*` serif vurgu, `\n` satır sonu olur. Başlık en fazla 70 karakter, eyebrow en fazla 32.
