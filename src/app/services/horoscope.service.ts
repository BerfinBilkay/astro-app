// src/app/services/horoscope.service.ts

// Injectable dekoratörü ile bu servisin Angular DI konteynerine root seviyede
// (tüm uygulama) kayıt edilmesini sağlıyoruz.
import { Injectable } from '@angular/core';

// AngularFire Firestore modülünden ihtiyacımız olan fonksiyon ve tipleri alırız:
// - Firestore: Firestore veritabanı servisi örneği.
// - doc: Belirli bir dokümana referans oluşturmamıza yarar.
// - docData: Bir dokümanın içeriğini Observable olarak okumamızı sağlar.
// - getDoc: Bir dokümanın bir kerelik snapshot’ını almamıza yarar.
// - setDoc: Yeni doküman oluşturur veya mevcut dokümana komple set eder.
// - updateDoc: Mevcut bir dokümana kısmi güncelleme yapar.
import {
  Firestore,
  doc,
  docData,
  getDoc,
  setDoc,
  updateDoc
} from '@angular/fire/firestore';

// RxJS operatör ve fonksiyonları:
// - Observable: Akış (stream) yapısı tipi.
// - of: Sabit bir değerle Observable oluşturur.
// - switchMap: İç içe Observable’ları zincirleyip önceki akışı iptal eder.
import { Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HoroscopeService {
  // Firestore’daki günlük burç yorumlarının saklandığı dokümanın yolu.
  // Koleksiyon: 'horoscope', Doküman ID: 'daily'
  private readonly path = 'horoscope/daily';

  // Firestore servisini constructor’da inject ediyoruz.
  constructor(private readonly firestore: Firestore) { }

  /**
   * Belirli bir burç (sign) için günlük yorumu alır.
   * Eğer doküman veya ilgili alan yoksa:
   *  1) Tüm burç alanlarını boş metinlerle initialize eder,
   *  2) "Bugün için henüz yorum eklenmedi." mesajı döner.
   *
   * @param sign Örneğin: 'Koç', 'Boğa' vb.
   * @returns İlgili burcun yorumunu içeren Observable<string>
   */
  getDailyHoroscope(sign: string): Observable<string> {
    // Doküman referansı oluştur
    const ref = doc(this.firestore, this.path);

    // docData ile doküman verisini Observable olarak oku
    return docData(ref).pipe(
      switchMap(data => {
        // Eğer doküman var ve istenen sign alanı string ise doğrudan döndür
        if (data && typeof data[sign] === 'string') {
          return of(data[sign]);
        }
        // Aksi halde dokümanı boş burç alanlarıyla initialize et
        const empty = this.emptySigns();
        // setDoc ile merge: true kullanarak yalnızca eksik alanları ekle
        setDoc(ref, empty, { merge: true });
        // Placeholder mesajı döndür
        return of('Bugün için henüz yorum eklenmedi.');
      })
    );
  }

  /**
   * Admin fonksiyonu: Tek bir burç alanını günceller veya ekler.
   * @param sign Alan adı (örneğin 'Yengeç')
   * @param text Güncellenecek yorum metni
   */
  async setDailyHoroscope(sign: string, text: string): Promise<void> {
    // path'i '/' ile bölerek koleksiyon ve doküman ID’sini ayıkla
    const [collection, docId] = this.path.replace(/^\//, '').split('/');
    // Firestore doküman referansını oluştur
    const ref = doc(this.firestore, collection, docId);

    // Konsola log ile debug bilgisi yazıyoruz
    console.log('📌 Güncellenecek belge yolu:', ref.path);
    console.log(`📌 Alan: ${sign}, Metin: ${text}`);

    try {
      // updateDoc ile sadece belirttiğimiz sign alanını güncelle
      await updateDoc(ref, { [sign]: text });
      console.log(`✅ "${sign}" alanı güncellendi, şimdi okuyoruz...`);

      // Güncellenmiş dokümanı bir kez oku
      const snap = await getDoc(ref);
      console.log('📄 Belge içeriği:', snap.data());
    } catch (err) {
      // Hata durumunda konsola yaz
      console.error('❌ Hata:', err);
    }
  }

  /**
   * Tüm burç yorumlarını tek seferde getiren admin fonksiyonu.
   * @returns Burç adlarını anahtar, yorum metinlerini değer olarak içeren
   *          bir nesneyi Observable olarak döner.
   */
  getAllDailyHoroscopes(): Observable<Record<string, string>> {
    // Aynı path üzerinden doküman referansı oluştur
    const ref = doc(this.firestore, this.path);
    // Tüm doküman verisini Observable<Record<string, string>> olarak döndür
    return docData(ref) as Observable<Record<string, string>>;
  }

  /**
   * Tüm 12 burç için boş metinlerden oluşan bir nesne üretir.
   * Dokümanı initialize etmek üzere kullanılır.
   */
  private emptySigns(): Record<string, string> {
    return {
      Kova: '', Balık: '', Koç: '', Boğa: '',
      İkizler: '', Yengeç: '', Aslan: '', Başak: '',
      Terazi: '', Akrep: '', Yay: '', Oğlak: ''
    };
  }
}
