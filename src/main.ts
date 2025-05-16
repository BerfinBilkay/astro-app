// src/main.ts

// Angular’dan uygulamayı başlatmak için gerekli fonksiyonu alıyoruz.
import { bootstrapApplication } from '@angular/platform-browser';

// Uygulamanın kök (root) komponenti.
import { AppComponent }       from './app/app.component';

// Angular Router servislerini sağlayacak fonksiyon.
import { provideRouter }      from '@angular/router';

// Uygulamanın route tanımlarını içeren diziyi alıyoruz.
import { routes }             from './app/app.routes';

// Başka modül sağlayıcılarını eklemek için gereken yardımcı fonksiyon.
import { importProvidersFrom } from '@angular/core';

// HTTP istekleri yapabilmek için Angular’ın HttpClient modülü.
import { HttpClientModule }   from '@angular/common/http';

// Firebase App’i başlatmak için gerekli sağlayıcıları ve initialize fonksiyonunu alıyoruz.
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';

// Firebase Authentication’ı sağlayacak fonksiyon ve getAuth API’si.
import { provideAuth, getAuth }              from '@angular/fire/auth';

// Cloud Firestore veritabanı için sağlayıcı ve getFirestore API’si.
import { provideFirestore, getFirestore }    from '@angular/fire/firestore';

// Ortam (environment) değişkenlerini, özellikle Firebase config’ini içerir.
import { environment }        from './environments/environment';

// Uygulamayı bootstrap (başlat) et: AppComponent’i root komponent olarak kullan.
// İkinci argüman olarak uygulamaya dahil edilecek “providers” dizisini veriyoruz.
bootstrapApplication(AppComponent, {
  providers: [
    // HttpClientModule’ü global olarak sağlayarak tüm uygulamada HTTP isteği yapılmasına izin verir.
    importProvidersFrom(HttpClientModule),

    // Firebase App’i başlat: environment.firebase içindeki ayarlarla.
    provideFirebaseApp(() => initializeApp(environment.firebase)),

    // Firebase Authentication servisini başlat ve getAuth() ile örneğini al.
    provideAuth(() => getAuth()),

    // Firestore servisini başlat ve getFirestore() ile örneğini al.
    provideFirestore(() => getFirestore()),

    // Router desteğini ekle: daha önce tanımladığımız routes dizisini kullan.
    provideRouter(routes)
  ]
})
// Eğer bootstrap sırasında bir hata olursa konsola yazdır.
.catch(err => console.error(err));
