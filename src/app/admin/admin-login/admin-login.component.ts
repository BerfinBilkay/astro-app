// src/app/admin/admin-login.component.ts

// Angular’ın çekirdek Component dekoratörü ve tipi
import { Component } from '@angular/core';
// Standalone komponentlerde ortak yapılar için CommonModule
import { CommonModule } from '@angular/common';
// Reactive Form araçları: FormBuilder ile form inşa, FormGroup form nesnesi, Validators formlar için doğrulama
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
// Yönlendirme (routing) kontrolü için Router ve bağımlılık olarak RouterModule
import { Router, RouterModule } from '@angular/router';
// Kendi AuthService’imizi import ediyoruz; oturum kontrolü vs. için
import { AuthService } from '../../services/auth.service';
// Angular Material form field modülü
import { MatFormFieldModule } from '@angular/material/form-field';
// Angular Material input modülü
import { MatInputModule }     from '@angular/material/input';
// Angular Material buton modülü
import { MatButtonModule }    from '@angular/material/button';

@Component({
  // Bu komponent standalone, yani bir NgModule’a bağlı değil
  standalone: true,
  // HTML içinde <app-admin-login> etiketiyle kullanılır
  selector: 'app-admin-login',
  // Standalone olduğunda ihtiyacı olan diğer modülleri burada import ediyoruz
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  // Şablon dosyası
  templateUrl: './admin-login.component.html',
  // Stil dosyası
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {
  // Hata mesajını tutacak alan; şablonda gösterilebilir
  error = '';
  // Reactive Form için FormGroup tipi; constructor’da örneklenecek
  form: FormGroup;

  constructor(
    // FormBuilder form kontrol gruplarını kolayca oluşturmak için
    private fb: FormBuilder,
    // Oturum işlemleri için AuthService (şu an kullanılmıyor ama future-ready)
    private auth: AuthService,
    // Başarılı girişte navigasyon için Router
    private router: Router
  ) {
    // Constructor’ta Reactive Form’u kuruyoruz:
    // form grup iki kontrol içeriyor: email ve password
    this.form = this.fb.group({
      email:    [
        '',                             // Varsayılan değer: boş string
        [Validators.required, Validators.email] // Gerekli ve geçerli e-posta formatı şartı
      ],
      password: [
        '',                             // Varsayılan değer: boş string
        Validators.required             // Gerekli alan
      ]
    });
  }

  // Giriş butonuna basıldığında çağrılacak metod
  login() {
    // Form geçersizse işlem yapma
    if (this.form.invalid) { 
      return; 
    }

    // Form değerlerini alıyoruz
    const { email, password } = this.form.value;
    // Basit bir admin kimlik kontrolü (örnek amaçlı hard-coded)
    if (email === 'berfin@gmail.com' && password === 'enes') {
      // Eşleşiyorsa admin dashboard’a yönlendir
      this.router.navigate(['admin', 'dashboard']);
    } else {
      // Hatalı girişte error alanını doldurup ekranda gösterebilirsin
      this.error = 'Geçersiz kullanıcı adı veya şifre.';
    }
  }
}
