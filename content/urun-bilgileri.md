# Jurvia ürün bilgileri (gönderilerin tek kaynağı)

Gönderilerde **yalnız bu dosyadaki bilgiler** kullanılır. Burada olmayan bir özellik, rakam, müşteri, ödül, fiyat veya tarih yazılmaz. Ürün değiştikçe bu dosyayı güncelleyin.

## Genel
- Jurvia, bireysel avukatlar ve hukuk büroları için bir çalışma alanıdır: dosya, takvim, hazırlık görevleri ve belgeler aynı dosyanın etrafında toplanır.
- Geliştiren: Alias Yazılım, Kayseri.
- Web sitesi: https://jurvia.com.tr · Ürün sayfası (eklenti): https://jurvia.com.tr/features/uyap-uets · Ürün görüşmesi: https://jurvia.com.tr/demo
- Instagram: @jurvia.app · LinkedIn: linkedin.com/company/jurvia
- Ürün görüşmesi ile tanışılır; fiyat ve kapsam görüşmede belirlenir (gönderide fiyat, indirim veya ücretsiz deneme yazılmaz).

## Konular (status: mevcut olanlar kullanılabilir)

### uyap-evrak — status: mevcut — sayfa: /features/uyap-uets
- Jurvia · UYAP + UETS Chrome eklentisi, UYAP Avukat Portalı'ndaki dava evraklarını avukatın kendi tarayıcı oturumuyla okur.
- Avukat UYAP'ta dosyayı açar, eklenti açılan dosyayı tanır.
- Evraklar seçilir; Jurvia'da zaten bulunan evraklar ayrıca gösterilir, kalanlar eşleşen Jurvia dosyasına aktarılır.
- Eşleşen dosya yoksa yeni dosya açılır. İstenirse evraklar ZIP olarak indirilebilir.
- Yeni açılan dosyada müvekkil henüz seçilmediyse dosyada uyarı ve "Müvekkili seç" kısayolu görünür.
- Aktarım yalnız kullanıcı başlattığında yapılır; Jurvia kayıtları UYAP'tan kendiliğinden güncellenmez.

### uets-tebligat — status: mevcut — sayfa: /features/uyap-uets
- Eklenti UETS gelen kutusundaki e-tebligatları listeler, hangisinin Jurvia'ya aktarıldığını gösterir.
- Seçilen tebligatlar üst yazısı, ekleri ve tebliğ olaylarıyla eşleşen dosyaya bağlanır.
- Eksik eki olan tebligatlar görülebilir.

### gizlilik — status: mevcut — sayfa: /privacy
- Eklenti UYAP/UETS kullanıcı adı ve şifresini, e-imza PIN'ini ve çerezleri okumaz, saklamaz, göndermez.
- Tarafların TC kimlik ve vergi numaraları yalnız eklentide maskeli görünür, Jurvia'ya gönderilmeden önce çıkarılır.
- Kayıtlar yalnız giriş yapılan Jurvia hesabına ve seçilen dosyaya gider.
- Eklentide reklam, analiz aracı veya uzaktan yüklenen kod yoktur.
- Eklenti Chrome Web Store'dan kurulur; kullanmak zorunlu değildir.

### takvim — status: mevcut — sayfa: /features/calendar
- Gün, hafta, ay ve gündem görünümleri; kayıt türleri renkleriyle ayrışır.
- Sol panelde küçük ay takvimi ve filtreler; panel açılıp kapatılabilir.
- Telefonda takvim gün görünümüyle açılır.
- Duruşma ve görüşmeler takvimde; çakışan kayıtlar fark edilir.
- Etkinliğin öncesindeki hazırlık işi ayrı bir görev olarak, kendi son tarihiyle planlanır.
- Etkinlik tarihi değiştiğinde bağlı işler gözden geçirilir.

### gorevler — status: mevcut — sayfa: /features/tasks
- Etkinliklere bağlı hazırlık görevleri, sorumlular ve son tarihler birlikte izlenir.
- Görevde başlık, beklenen sonuç, ilgili etkinlik, sorumlu, son tarih ve kontrol adımları bulunur.
- Tamamlanan iş kontrol edilir, devam işi ayrıca açılır.

### belgeler — status: mevcut — sayfa: /features/documents
- Belgeler dosyayla bağlantılı tutulur; sürümleri izlenir.
- Orijinali koruyan sürümler: orijinal içerik ve belge kimliği korunur.
- DOCX odaklı çalışma; DOCX veya PDF çıktısı alınır.
- Belgeler sayfası yoğun bir tablo (grid) görünümüyle çalışır.
- UYAP'tan gelen TIFF, JPG ve PNG evraklar da dosyada saklanır; JPG ve PNG ekranda önizlenir, TIFF indirilir.

### dosyalar — status: mevcut — sayfa: /
- Dosyalar sayfasında tablo ve kart görünümü, gruplama.
- Bir dosyanın takvimi, görevleri, evrakları ve tebligatları aynı yerde görülür.
- Taraflar ve dosya gelişmeleri dosya bağlamında tutulur.

### ekip-erisim — status: mevcut — sayfa: /security
- Kişisel çalışma alanıyla başlanır; dosya ve işlem yetkileri açık paylaşım ilkesiyle yönetilir.
- Rol ve işlem bazlı erişim; kişisel alan izolasyonu; özel belge depolama.

### yogun-arayuz — status: mevcut — sayfa: /
- Arayüz yoğun ve sade: küçük yazı, sık satırlar, ikonlu butonlar; bir ekranda daha çok kayıt görünür.

### hatirlatmalar — status: mevcut — sayfa: /features/calendar
- Duruşma ve keşif gibi etkinlikler için birden fazla hatırlatma kurulabilir; görevler için de hatırlatma gelir.
- Hatırlatmalar uygulama içinde (zil ve bildirim kutusu), e-postayla ve tarayıcı bildirimiyle gelebilir.
- İstenirse her sabah günün ajandası gönderilir.
- Hatırlatma "gördüm" diye işaretlenebilir veya ertelenebilir; gece saatlerinde sessiz saat uygulanır.
- E-posta ve bildirimlerde müvekkil adı veya dosya numarası yer almaz; ayrıntı oturum açınca görünür.
- iPhone'da tarayıcı bildirimi için Jurvia ana ekrana eklenir.

### tatil-gorunumu — status: mevcut — sayfa: /features/calendar
- Bayram ve tatil günleri takvimde işaretli görünür; yarım gün arifelerde başlangıç saati yazar.
- Adli tatil dönemi takvimde şerit olarak görünür.
- Tatile denk gelen kayıtlar için takvimde uyarı çıkar.
- Hangi tatil türlerinin görüneceği ayarlardan seçilebilir.
- Not: Gönderide tatillerin sürelere etkisi anlatılmaz, tatil kutlaması yapılmaz; yalnız takvimde nasıl göründüğü anlatılır.

### uyap-uets-sekmesi — status: mevcut — sayfa: /features/uyap-uets
- Dosya sayfasında "UYAP / UETS" sekmesi bulunur.
- Eklentiyle aktarılan taraf ve safahat bilgileri ile dosyanın tebligatları bu sekmede birlikte görünür.
- Tebligatlar ekranından her tebligat için tek bir "Tebligatı incele" görevi açılabilir; görev dosyaya bağlı kalır ve sekmede listelenir.

### yardim — status: mevcut — sayfa: /
- Uygulama içinde yardım merkezi vardır; ekranların nasıl kullanıldığını anlatan makaleler bulunur.
- Ekranlardaki yardım simgesi o ekranın makalesini açar.
- Makalelerde arama yapılabilir; makaleler yazdırılabilir veya PDF olarak kaydedilebilir.

### buro-ayarlari — status: mevcut — sayfa: /solutions/law-firms
- Büro sahibi ayarlar sayfasından büronun genel ayarlarını yönetir: saat dilimi, hafta başı, çalışma günleri ve mesai aralığı.
- Büro profili: unvan, iletişim bilgileri ve logo.
- Büro için ortak seçenek listeleri (ör. hukuk alanları) tutulur; ekip kayıtları aynı seçeneklerle açar.
- Ayarlar sayfasındaki genel bakış, eksik kalan ayarları gösterir.

### sure-onerisi — status: yol-haritasi
- Kurallar gereği (süre hesabı ve mevzuat yazılmaz) bu konu otomatik gönderilerde kullanılmaz.

### musteri-portali — status: yol-haritasi
### belge-talepleri — status: yol-haritasi
### mali-hareketler — status: yol-haritasi
