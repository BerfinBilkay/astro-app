// src/app/auth/login.component.ts

// Component dekoratörü ve tipi için Angular çekirdek modülü
import { Component } from '@angular/core';
// Reactive Form araçları: FormBuilder ile form oluşturmak, FormGroup form nesnesi, Validators ile doğrulama kuralları
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// *ngIf, *ngFor vb. yapısal direktifler için CommonModule
import { CommonModule } from '@angular/common';
// Yönlendirme işlemleri için Router
import { Router } from '@angular/router';
// Angular Material form alanı (mat-form-field) modülü
import { MatFormFieldModule } from '@angular/material/form-field';
// Angular Material input (mat-input) modülü
import { MatInputModule }     from '@angular/material/input';
// Angular Material button (mat-button) modülü
import { MatButtonModule }    from '@angular/material/button';

// Oturum açma işlemleri için AuthService
import { AuthService } from '../../services/auth.service';
// Firebase User tipi (TS tip tanımı)
import type { User } from 'firebase/auth';

@Component({
  // Bu bileşenin HTML etiket adı
  selector: 'app-login',
  // Standalone component olduğu için ihtiyaç duyduğu modülleri burada import ediyoruz
  standalone: true,
  imports: [
    CommonModule,         // *ngIf, *ngFor
    ReactiveFormsModule,  // Reactive Forms
    MatFormFieldModule,   // <mat-form-field>
    MatInputModule,       // <input matInput>
    MatButtonModule       // <button mat-button>
  ],
  // HTML şablon dosyasının yolu
  templateUrl: './login.component.html',
  // Stil dosyasının yolu
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Reactive Form nesnesi
  form: FormGroup;
  // Giriş isteği gönderildiğinde true olur, spinner vs. göstermek için
  loading = false;
  // Hata mesajını tutar; null ise hata yok
  error: string | null = null;

  constructor(
    // FormBuilder ile form kontrollerini kuracağız
    private fb: FormBuilder,
    // AuthService ile Firebase üzerinden login işlemi yapılır
    private auth: AuthService,
    // Başarılı login sonrası yönlendirme için Router
    private router: Router
  ) {
    // Formu iki kontrol ile inşa ediyoruz: email ve password
    this.form = this.fb.group({
      email:    [
        '',                         // Başlangıç değeri: boş
        [Validators.required, Validators.email] // Zorunlu ve geçerli bir e-posta olmalı
      ],
      password: [
        '',                         // Başlangıç değeri: boş
        [Validators.required, Validators.minLength(6)] // Zorunlu ve en az 6 karakter
      ]
    });
  }

  /** 
   * Form submit edildiğinde çalışır.
   * - Form geçerli değilse hiçbir şey yapmaz.
   * - Geçerliyse loading durumunu true yapar, önceki hatayı temizler.
   * - AuthService.login ile giriş talebi gönderir.
   * - next: login başarılıysa anasayfaya yönlendirir.
   * - error: hata mesajını yakalayıp error alanına yazar.
   */
  onSubmit(): void {
    // Form geçersizse çık
    if (this.form.invalid) { 
      return; 
    }

    // Yükleniyor durumunu aktif et ve önceki hatayı temizle
    this.loading = true;
    this.error   = null;

    // Form değerlerini al
    const { email, password } = this.form.value;

    // AuthService üzerinden login isteği yap
    this.auth.login(email, password)
      .subscribe({
        // Başarılı olursa user objesi gelir
        next:  (user: User) => {
          this.loading = false;              // spinner’ı durdur
          this.router.navigateByUrl('/');    // Ana sayfaya yönlendir
        },
        // Hata olursa yakala
        error: (err: any) => {
          this.loading = false;              // spinner’ı durdur
          // Hata mesajı varsa göster, yoksa genel bir mesaj
          this.error = err?.message || 'Giriş sırasında bir hata oluştu.';
        }
      });
  }
}
