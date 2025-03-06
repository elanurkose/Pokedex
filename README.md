# 🌟 Angular Pokedex Uygulaması 🌟

## 📖 Proje Hakkında

Bu proje, **Angular 19.1 standalone mimarisi** ve **Angular Material** kullanılarak geliştirilmiş modern bir **Pokedex uygulamasıdır**. PokeAPI ile entegre çalışan uygulama, hybrid mimari yaklaşımı ile geliştirilmiştir. Kullanıcılar **Pokemon'ları listeleyebilir, arayabilir, detaylarını görüntüleyebilir** ve **kendi özel Pokemon'larını oluşturabilir**.

---

## 🚀 Özellikler

- **Pokemon Listeleme**: Sayfalandırma ile Pokemon'ları görüntüleme
- **Pokemon Detayları**: Her Pokemon'un detaylı bilgilerini görüntüleme
- **Arama Fonksiyonu**: İsme göre Pokemon arama
- **Caching (Önbellekleme)**: Performans optimizasyonu için API yanıtlarını cachingleme
- **Özel Pokemon Yönetimi**:
  - Yeni Pokemon oluşturma
  - Mevcut özel Pokemon'ları düzenleme
  - Özel Pokemon'ları silme
- **Yerel Depolama**: Özel Pokemon'lar için local storage kullanımı
- **Reaktif UI**: RxJS ile reaktif kullanıcı arayüzü

---

## 🛠️ Kullanılan Teknolojiler

- **Angular 19.1** (Hybrid)
- **Angular Material**
- **RxJS**
- **TypeScript**
- **CSS**
- **PokeAPI**
- **Local Storage API**

---

## 📝 Kurulum

```bash
# Proje dizinine gidin
cd angular-pokedex

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
ng serve

# Tarayıcınızda http://localhost:4200 adresine gidin

```

## 📁 Proje Yapısı

```bash
src/
  ├── app/
  │   ├── core/
  │   │   ├── services/
  │   │   │   └── pokemon.service.ts
  │   ├── shared/
  │   │   ├── directives/
  │   │   │   └── color-type.directive.ts
  │   │   ├── pipes/
  │   │   │   └── stat-name.pipe.ts
  │   ├── features/pokemon
  │   │   ├── add-pokemon/
  │   │   │   ├── add-pokemon.component.css
  │   │   │   ├── add-pokemon.component.html
  │   │   │   └── add-pokemon.component.ts
  │   │   ├── edit-pokemon/
  │   │   │   ├── edit-pokemon.component.css
  │   │   │   ├── edit-pokemon.component.html
  │   │   │   └── edit-pokemon.component.ts
  │   │   ├── header/
  │   │   │   ├── header.component.css
  │   │   │   ├── header.component.html
  │   │   │   └── header.component.ts
  │   │   ├── pokemon-list/
  │   │   │   ├── pokemon-list.component.css
  │   │   │   ├── pokemon-list.component.html
  │   │   │   └── pokemon-list.component.ts
  │   │   ├── pokemon-detail/
  │   │   │   ├── pokemon-detail.component.css
  │   │   │   ├── pokemon-detail.component.html
  │   │   │   └── pokemon-detail.component.ts
  │   │   ├── pokemon-search/
  │   │   │   ├── pokemon-search.component.css
  │   │   │   ├── pokemon-search.component.html
  │   │   │   └── pokemon-search.component.ts
  │   │   └── pokemon.routes.ts
  │   ├── models/
  │   │   ├── pokemon.detail.ts
  │   │   └── pokemon.list.ts
  │   ├── app.routes.ts
  │   ├── app.component.ts
  │   ├── app.component.css
  │   ├── app.component.html
  │   └── app.config.ts
  ├── index.html
  ├── main.ts
  └── styles.css
```

## ⚙️ Kullanım

### Hybrid Mimari Yaklaşımı

Uygulama, Angular 19.1'in standalone bileşen API'sini kullanırken klasik klasör yapısını da koruyan hybrid bir yaklaşım benimser:

- **Core**: Singleton servisler
- **Shared**: Birden fazla bileşen tarafından paylaşılan direktifler, pipelar
- **Features**: Ana uygulama özellikleri için bileşenler

### Özel Direktif ve Pipelar

- **ColorTypeDirective**: Pokemon tipine göre arka plan rengini değiştirir
- **StatNamePipe**: Her kelimeyi formatlayarak görüntüler

### Reactive Forms

Pokemon ekleme ve düzenleme işlemlerinde **Reactive Forms** kullanılmıştır:

- Form doğrulamaları (required, minLength, pattern)
- Dinamik form kontrolleri
- Form durumunu izleme ve hata mesajları gösterme

### API ve State Yönetimi

- **RxJS Observables** ile reaktif veri akışı
- **BehaviorSubject** ile yerel durum yönetimi
- HTTP istekleri için optimizasyon ve **Caching**
- Özel Pokemon'lar için **LocalStorage** entegrasyonu

### Performans Optimizasyonları

- **Caching**: API'den alınan Pokemon bilgileri, tekrar kullanım için önbelleklenir
- **Lazy Loading**: Yalnızca görüntülenen Pokemon'lar için detaylı bilgi yüklenir
- **Local Storage**: Özel Pokemon'lar, sayfa yenilemelerinde kaybolmaması için yerel depolamada saklanır
- **Standalone Bileşenler**: Daha küçük paket boyutu ve daha hızlı yükleme süreleri

---

## 🎨 UI/UX Özellikleri

- **Angular Material**: UI bileşenlerinde **Angular Material** kullanılarak modern ve uyumlu bir tasarım oluşturulmuştur.
