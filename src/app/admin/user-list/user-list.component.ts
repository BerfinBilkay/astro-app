// src/app/admin/user-list.component.ts

// Angular bileşen ve yaşam döngüsü arayüzü OnInit için gerekli import
import { Component, OnInit } from '@angular/core';
// Standalone bileşenlerde yapısal direktifler (*ngIf, *ngFor vb.) için CommonModule
import { CommonModule } from '@angular/common';
// Angular Material tablo bileşeni
import { MatTableModule }  from '@angular/material/table';
// Angular Material buton bileşeni
import { MatButtonModule } from '@angular/material/button';
// Angular Material dialog servisi — detayları göstermek için
import { MatDialog }       from '@angular/material/dialog';
// Kullanıcı verilerini almak için AuthService
import { AuthService } from '../../services/auth.service';
// Dialog içinde kullanıcı detaylarını gösterecek bileşen
import { UserDetailDialogComponent } from '../user-detail-dialog/user-detail-dialog.component';
// Uygulama kullanıcı modelimiz
import { AppUser } from '../../models/appuser';

@Component({
  // Bu bileşen standalone, yani kendi NgModule tanımı var
  standalone: true,
  // HTML içinde <app-user-list> etiketiyle kullanılır
  selector: 'app-user-list',
  // Template’in ihtiyaç duyduğu modüller
  imports: [
    CommonModule,      // *ngIf, *ngFor vb.
    MatTableModule,    // <table mat-table> tasarımı için
    MatButtonModule    // <button mat-button> stili için
  ],
  // Dışarıda tanımlı HTML şablon dosyası
  templateUrl: './user-list.component.html',
  // Dışarıda tanımlı stil dosyası
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  // Firestore’dan alınan kullanıcı listesi bu dizi içinde tutulacak
  users: AppUser[] = [];

  // MatTable’a hangi kolonların gösterileceğini söyler
  displayedColumns = ['email', 'displayName', 'actions'];

  constructor(
    // Kullanıcı listesini çekmek için AuthService
    private auth: AuthService,
    // Dialog açmak için MatDialog servisi
    private dialog: MatDialog
  ) {}

  /**
   * Bileşen ilk yüklendiğinde (ngOnInit) çalışır.
   * AuthService.listUsers() ile kullanıcıları çekip `users` dizisine atar.
   */
  ngOnInit() {
    this.auth.listUsers().subscribe(list => {
      this.users = list;
    });
  }

  /**
   * "Detayları Gör" butonuna tıklandığında çağrılır.
   * Seçilen kullanıcı bilgisini modal dialog içinde UserDetailDialogComponent’e gönderir.
   * @param user Detayları gösterilecek AppUser objesi
   */
  viewDetails(user: AppUser) {
    this.dialog.open(UserDetailDialogComponent, {
      width: '400px',                    // Dialog genişliği
      panelClass: 'astrology-dialog-panel', // Özelleştirilmiş CSS sınıfı
      data: user                         // MAT_DIALOG_DATA ile UserDetailDialogComponent’e iletilir
    });
  }
}
