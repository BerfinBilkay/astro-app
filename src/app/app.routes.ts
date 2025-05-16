// src/app/app.routes.ts

// Angular Router’dan Routes tipini alıyoruz.
// Routes, route konfigürasyonlarını tanımlamak için kullanılan bir dizi tipidir.
import { Routes } from '@angular/router';

// Uygulamanın farklı sayfalarını temsil eden component’leri import ediyoruz:
import { HomeComponent } from './user/home/home.component';           // Anasayfa
import { RegisterComponent } from './user/register/register.component';   // Kayıt sayfası
import { LoginComponent } from './user/login/login.component';         // Giriş sayfası
import { UserUpdateComponent } from './user/user-update/user-update.component'; // Profil düzenleme
import { StarMapComponent } from './user/star-map/star-map.component';   // Yıldız haritası dialog’u
import { AdminLoginComponent } from './admin/admin-login/admin-login.component';     // Admin girişi
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component'; // Admin paneli
import { BlogFormComponent } from './admin/blog-form/blog-form.component';
import { BlogDetailComponent } from './user/blog-detail/blog-detail.component';
import { NumerologyComponent } from './user/numerology/numerology.component';

// routes dizisi, uygulamadaki URL patikalarını ve hangi komponentin yükleneceğini tanımlar.
export const routes: Routes = [
    // Boş path ('') anasayfa -> HomeComponent
    { path: '', component: HomeComponent },

    // '/login' URL’si -> LoginComponent
    { path: 'login', component: LoginComponent },

    // '/admin' URL’si -> AdminLoginComponent (admin girişi)
    { path: 'admin', component: AdminLoginComponent },

    // '/admin/dashboard' URL’si -> AdminDashboardComponent (admin paneli)
    { path: 'admin/dashboard', component: AdminDashboardComponent },

    // 'admin/blog/new' URL’si -> BlogFormComponent (admin paneli)
    { path: 'admin/blog/new', component: BlogFormComponent },

    // 'admin/blog/:id/edit' URL’si -> BlogFormComponent (admin paneli)
    { path: 'admin/blog/:id/edit', component: BlogFormComponent },

    // '/register' URL’si -> RegisterComponent (yeni kullanıcı kaydı)
    { path: 'register', component: RegisterComponent },

    // '/user-update' URL’si -> UserUpdateComponent (profil düzenleme)
    { path: 'user-update', component: UserUpdateComponent },

    // '/star-map' URL’si -> StarMapComponent (yıldız haritası dialog’u)
    { path: 'star-map', component: StarMapComponent },
    
    // '/blogs/:id' URL’si -> BlogDetailComponent (Blog detay)
    { path: 'blogs/:id', component: BlogDetailComponent },
    // '/blogs/:id' URL’si -> BlogDetailComponent (Blog detay)
    { path: 'num', component: NumerologyComponent },
];
