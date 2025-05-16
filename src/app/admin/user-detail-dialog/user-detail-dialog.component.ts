// src/app/admin/user-detail-dialog.component.ts

// Component dekoratörü ve Inject token’ı için gerekli import
import { Component, Inject } from '@angular/core';
// Standalone bileşenlerde yapısal direktifler için CommonModule
import { CommonModule }   from '@angular/common';
// Angular Material dialog modülü ve veri enjeksiyonu token’ı
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
// Angular Material buton modülü (Kapat butonu için)
import { MatButtonModule }                 from '@angular/material/button';
// AppUser modeli: dialog’a gelen veri tipini tanımlar
import { AppUser } from '../../models/appuser';

@Component({
  // Bu bileşen standalone, kendi NgModule’üne sahip
  standalone: true,
  // HTML içinde <app-user-detail-dialog> etiketiyle kullanılır
  selector: 'app-user-detail-dialog',
  // Şablonda kullanılan Angular Material ve Angular modülleri
  imports: [
    CommonModule,      // *ngIf, *ngFor vb. yapılar için
    MatDialogModule,   // <mat-dialog> etiketi ve related özellikler
    MatButtonModule    // <button mat-button> stili
  ],
  // Template’i inline olarak burada tanımlıyoruz
  template: `
    <!-- Dialog’un başlığı -->
    <h2 mat-dialog-title>Kullanıcı Detayları</h2>

    <!-- Dialog içeriği -->
    <mat-dialog-content>
      <!-- UID alanını gösterir -->
      <p><strong>UID:</strong> {{data.uid}}</p>
      <!-- Email alanını gösterir -->
      <p><strong>Email:</strong> {{data.email}}</p>
      <!-- Kullanıcının adı -->
      <p><strong>Ad:</strong> {{data.displayName}}</p>
      <!-- Doğum tarihi -->
      <p><strong>Doğum Tarihi:</strong> {{data.birthDate}}</p>
      <!-- Doğum saati -->
      <p><strong>Doğum Saati:</strong> {{data.birthTime}}</p>
      <!-- Doğum yeri -->
      <p><strong>Doğum Yeri:</strong> {{data.birthLocation}}</p>
    </mat-dialog-content>

    <!-- Dialog altındaki butonlar -->
    <mat-dialog-actions align="end">
      <!-- Kapat butonu, tıklanınca dialog kapanır -->
      <button mat-button mat-dialog-close>Kapat</button>
    </mat-dialog-actions>
  `
})
export class UserDetailDialogComponent {
  /**
   * MAT_DIALOG_DATA token’ı ile parent komponentten gelen AppUser verisini alır.
   * public data: AppUser olarak tanımlandığı için template içinde kullanılabilir.
   */
  constructor(@Inject(MAT_DIALOG_DATA) public data: AppUser) {}
}
