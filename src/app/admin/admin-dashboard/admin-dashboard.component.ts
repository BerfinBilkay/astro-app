// src/app/admin/admin-dashboard.component.ts

// Angular’ın çekirdek Component dekoratörü
import { Component }               from '@angular/core';
// Standalone bileşende ortak yapılar için CommonModule
import { CommonModule }            from '@angular/common';
// Angular Material sekmeler (tabs) modülü
import { MatTabsModule }           from '@angular/material/tabs';
// Kullanıcı listesini gösterecek bileşen
import { UserListComponent }       from '../user-list/user-list.component';
// Günlük burç yorumlarını düzenlemek için editör bileşeni
import { HoroscopeEditorComponent } from '../horoscope-editor/horoscope-editor.component';
// Blog listesini gösteren bileşen
import { AdminBlogListComponent } from '../blog-list/blog-list.component';

@Component({
  // Bu bileşen standalone, yani kendi NgModule’ü var
  standalone: true,
  // HTML içinde <app-admin-dashboard> etiketiyle kullanılır
  selector: 'app-admin-dashboard',
  // Bu bileşenin şablonunda ve içindeki diğer bileşenlerde ihtiyaç duyulan
  // modül ve bileşenleri burada import ediyoruz
  imports: [
    CommonModule,               // *ngIf, *ngFor vb. yapılar için
    MatTabsModule,              // Material Tabs (sekme) bileşeni
    UserListComponent,          // Kullanıcı listesi tabı
    AdminBlogListComponent,          // Blog listesi tabı
    HoroscopeEditorComponent    // Burç yorum editörü tabı
  ],
  // Dışarıda tanımlı HTML şablon dosyası
  templateUrl: './admin-dashboard.component.html'
})
// Dashboard görünümünü sağlayan boş bir sınıf; tüm işlevsellik içindeki
// alt bileşenler (UserList, HoroscopeEditor) üzerinden yürüyor.
export class AdminDashboardComponent {}
