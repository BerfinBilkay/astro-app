// src/app/auth/register.component.ts

// Angular çekirdek Component dekoratörü için
import { Component } from '@angular/core';
// Reactive Forms araçları: FormBuilder form oluşturmak, FormGroup form nesnesi, Validators doğrulama kuralları
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Yapısal direktifler (*ngIf, *ngFor vb.) için
import { CommonModule } from '@angular/common';
// Başarılı kayıt sonrası sayfa yönlendirmesi için
import { Router } from '@angular/router';

// Kayıt işlemlerini yapan servis
import { AuthService } from '../../services/auth.service';
// Firebase User tipi, register’dan dönen user objesinin tipi
import type { User } from 'firebase/auth';

@Component({
  // HTML’de <app-register> etiketiyle kullanılır
  selector: 'app-register',
  // Standalone component olarak ihtiyaç duyduğu modüller
  standalone: true,
  imports: [
    CommonModule,         // *ngIf, *ngFor gibi yapılar için
    ReactiveFormsModule   // Reactive Forms’u projemize dahil eder
  ],
  // HTML şablon dosyası
  templateUrl: './register.component.html',
  // CSS stil dosyası
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  // Reactive Form nesnemiz; constructor’da inşa edilecek
  form: FormGroup;
  // Kayıt isteği sırasında yükleniyor göstergesi
  loading = false;
  // Hata mesajını tutan alan; null ise hata yok
  error: string | null = null;

  constructor(
    // FormBuilder ile form kontrollerini kolayca oluşturacağız
    private fb: FormBuilder,
    // Kayıt, login vb. işlemleri yapan servis
    private auth: AuthService,
    // Kayıt sonrası yönlendirme için Router
    private router: Router
  ) {
    // FormBuilder inject edildikten sonra formu burada inşa ediyoruz
    this.form = this.fb.group({
      // Kullanıcı adı: zorunlu, en az 2 karakter
      displayName:   ['', [Validators.required, Validators.minLength(2)]],
      // E-posta: zorunlu, geçerli formatta
      email:         ['', [Validators.required, Validators.email]],
      // Şifre: zorunlu, en az 6 karakter
      password:      ['', [Validators.required, Validators.minLength(6)]],
      // Doğum tarihi: zorunlu (HTML’de type="date")
      birthDate:     ['', Validators.required],
      // Doğum saati: zorunlu (HTML’de type="time")
      birthTime:     ['', Validators.required],
      // Doğum yeri: zorunlu, serbest metin
      birthLocation: ['', Validators.required]
    });
  }

  /**
   * Form gönderildiğinde çalışır.
   * - Form geçersizse hiçbir işlem yapmaz.
   * - Valid ise loading’i true yapar, önceki hatayı temizler.
   * - AuthService.register ile kayıt isteği gönderir.
   * - next: kayıt başarıyla tamamlanırsa anasayfaya yönlendirir.
   * - error: hata mesajını yakalayıp error alanına atar.
   */
  onSubmit(): void {
    // Form geçersizse çık
    if (this.form.invalid) { 
      return; 
    }

    // Yükleniyor durumunu aktif et ve önceki hatayı temizle
    this.loading = true;
    this.error   = null;

    // Form değerlerini al ve tipli destructure yap
    const {
      displayName,
      email,
      password,
      birthDate,
      birthTime,
      birthLocation
    } = this.form.value;

    // AuthService üzerinden kayıt işlemi yap
    this.auth.register({
      displayName,
      email,
      password,
      birthDate,
      birthTime,
      birthLocation
    })
    .subscribe({
      // Kayıt başarılıysa user objesi döner
      next: (user: User) => {
        this.loading = false;            // Yükleniyor spinner’ını durdur
        this.router.navigateByUrl('/');  // Ana sayfaya yönlendir
      },
      // Hata durumunda çalışır
      error: (err: any) => {
        this.loading = false;            // Spinner’ı durdur
        // Hata mesajı varsa göster, yoksa genel mesaj
        this.error = err?.message || 'Kayıt sırasında bir hata oluştu.';
      }
    });
  }
}
