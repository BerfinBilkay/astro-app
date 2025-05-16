// src/app/services/auth.service.ts

// Angular çekirdeğinden Injectable dekoratörünü ve NgZone servisini alıyoruz.
// - Injectable: Bu sınıfın Angular’ın DI (Dependency Injection) konteynerine kayıt edilmesini sağlar.
// - NgZone: Angular’ın change detection dışındaki kodları Angular zone’u içine alıp UI güncellemelerini garanti eder.
import { Injectable, NgZone } from '@angular/core';

// AngularFire Auth modülünden aşağıdaki elemanları alıyoruz:
// - Auth: Firebase Authentication’ın ana servisi.
// - createUserWithEmailAndPassword: E-posta/şifre ile yeni kullanıcı oluşturma.
// - signInWithEmailAndPassword: E-posta/şifre ile oturum açma.
// - signOut: Oturumu kapatma.
// - authState: Kullanıcının oturum durumu Observable’ı.
// - User: Firebase User tipi.
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User
} from '@angular/fire/auth';

// AngularFire Firestore modülünden aşağıdaki fonksiyon ve tipleri alıyoruz:
// - Firestore: Firestore veritabanı servisi.
// - doc: Belirli bir dokümana referans oluşturur.
// - setDoc: Yeni doküman oluşturur veya var olanı overwrite eder.
// - docData: Bir dokümanın Observable olarak verisini alır.
// - collection: Koleksiyon referansı oluşturur.
// - collectionData: Koleksiyondaki tüm dokümanları Observable olarak alır.
// - updateDoc: Mevcut bir dokümanı kısmi olarak günceller.
import {
  Firestore,
  doc,
  setDoc,
  docData,
  collection,
  collectionData,
  updateDoc
} from '@angular/fire/firestore';

// RxJS kütüphanesinden Observable tipi ve dönüştürme operatörleri
// - Observable: Akış (stream) yapısı.
// - from: Promise’i Observable’a çevirir.
// - of: Sabit bir değerle Observable oluşturur.
import { Observable, from, of } from 'rxjs';

// RxJS operatörleri:
// - switchMap: Gelen Observable’ı iptal edip yeni bir Observable’a geçer.
// - map: Gelen değeri dönüştürür.
import { switchMap, map } from 'rxjs/operators';

// Uygulama kullanıcı modelini içeren arayüz (interface).
import { AppUser } from '../models/appuser';

// ChatGpt servisi: Doğum haritası HTML çıktısını üretmek için kullanıyoruz.
import { ChatGptService } from './chatgpt.service';

// Injectable dekoratörünü kullanarak bu servisi root seviyede (tüm uygulamada) erişilebilir yapıyoruz.
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Yapıcı metodunda gerekli servisleri inject ediyoruz:
  // - auth: Firebase Auth servisi
  // - firestore: Firestore servisi
  // - hf: HuggingfaceService (harita oluşturma)
  // - ngZone: Angular zone yönetimi
  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private ngZone: NgZone,
    private chatGpt: ChatGptService,
  ) { }

  /**
   * Yeni kullanıcı kaydı oluşturur.
   * 1. Firebase Auth ile kullanıcı oluşturur.
   * 2. Firestore’a temel profil bilgisini yazar.
   * 3. Huggingface API’dan doğum haritası HTML’i alır.
   * 4. Firestore’daki kullanıcı dokümanına harita HTML’ini ekler.
   * @param user Kullanıcının kayıt bilgileri
   * @returns Oluşan Firebase User’ı Observable ile döner
   */

  register(user: {
    displayName: string;
    email: string;
    password: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
  }): Observable<User> {
    return this.ngZone.run(() =>
      from(createUserWithEmailAndPassword(this.auth, user.email, user.password)).pipe(
        switchMap(cred => {
          const uid = cred.user.uid;
          const profile: AppUser = {
            uid,
            email: user.email,
            displayName: user.displayName,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthLocation: user.birthLocation
          };
          const ref = doc(this.firestore, 'users', uid);

          return from(setDoc(ref, profile)).pipe(
            // Huggingface yerine ChatGPT servisini kullan:
            switchMap(() => this.chatGpt.generateBirthChart(profile)),
            switchMap(html => from(updateDoc(ref, { birthChart: html }))),
            map(() => cred.user)
          );
        })
      )
    );
  }

  /**
   * Mevcut kullanıcıyla oturum açar.
   * @param email E-posta adresi
   * @param password Şifre
   * @returns Başarılı olursa Firebase User’ı dönen Observable
   */
  login(email: string, password: string): Observable<User> {
    // signInWithEmailAndPassword Promise’ini Observable’a çevirip user objesini map ile çıkartıyoruz.
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(c => c.user)
    );
  }

  /**
   * Oturumu kapatır.
   * @returns void dönen Observable
   */
  logout(): Observable<void> {
    // signOut Promise’ini Observable’a dönüştürüyoruz.
    return from(signOut(this.auth));
  }

  /**
   * Şu anki authenticated kullanıcının profil verisini Firestore’dan dinleyerek alır.
   * Eğer oturum yoksa null döner.
   * @returns AppUser veya null dönen Observable
   */
  currentUserProfile(): Observable<AppUser | null> {
    // authState: Kullanıcının oturum durumunu yayınlar
    return authState(this.auth).pipe(
      switchMap(u => {
        if (!u) {
          // Oturum yoksa hemen null yayınla
          return of(null);
        }
        // Varolan kullanıcı UID’siyle Firestore dokümanını Observable olarak oku
        return docData(doc(this.firestore, 'users', u.uid)) as Observable<AppUser>;
      })
    );
  }

  /**
   * Kullanıcı profilini günceller.
   * @param data Güncellenecek alanları içeren Partial<AppUser>
   * @throws Hata: Eğer oturum yoksa hata fırlatır.
   */
  async updateProfile(data: Partial<AppUser>): Promise<void> {
    const u = this.auth.currentUser;      // Geçerli kullanıcıyı al
    if (!u) throw new Error('Oturum yok'); // Yoksa hata ver
    // updateDoc ile belirtilen alanları Firestore’da güncelle
    await updateDoc(doc(this.firestore, 'users', u.uid), data);
  }

  /**
   * Firestore’daki tüm kullanıcıları listeler.
   * @returns AppUser dizisi dönen Observable
   */
  listUsers(): Observable<AppUser[]> {
    // ‘users’ koleksiyonundaki tüm dokümanları al ve her dokümana idField: 'uid' ekle
    return collectionData(
      collection(this.firestore, 'users'),
      { idField: 'uid' }
    ) as Observable<AppUser[]>;
  }
}
