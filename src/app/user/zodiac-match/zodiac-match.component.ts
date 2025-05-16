// src/app/user/zodiac-match/zodiac-match.component.ts

// Angular bileşen tanımı, DI token’ı ve lifecycle arayüzü için gerekli importlar
import { Component, Inject, Input, OnInit } from '@angular/core';
// Standalone bileşende yapısal direktifler için CommonModule
import { CommonModule } from '@angular/common';
// Template-driven formlar için FormsModule
import { FormsModule } from '@angular/forms';
// Angular Material dialog servisi ve veri token’ı
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  // HTML etiketi adı
  selector: 'app-zodiac-match',
  // Standalone import: CommonModule ve FormsModule burada sağlanır
  imports: [CommonModule, FormsModule],
  // Şablon ve stil dosyalarının yolu
  templateUrl: './zodiac-match.component.html',
  styleUrls: ['./zodiac-match.component.css']
})
export class ZodiacMatchComponent implements OnInit {
  /**
   * Açılışta dialog’a geçirilen burç verisi:
   * MAT_DIALOG_DATA token’ı ile dışarıdan { sign: string } alınır.
   */
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { sign: string }
  ) {}

  /** İlk burç seçimi: dialog açılırken gelen işaret buraya atanır */
  sign1: string = '';

  /** İkinci burç seçimi: kullanıcı dropdown’dan seçim yapar */
  sign2: string = '';

  /** Eşleşme yapıldığında sonuçların gösterilmesini kontrol eden flag */
  showResults: boolean = false;

  /** Bileşen başlatıldığında çalışır */
  ngOnInit(): void {
    // data.sign değerini küçük harfe çevirip sign1’e ata
    // böylece HTML’deki id eşleştirmeleri için normalize edilmiş olur
    this.sign1 = this.data.sign.toLowerCase();
    console.log(this.data.sign); // Debug amaçlı gelen burcu konsola yaz
  }

  /**
   * "Let's Match" butonuna basıldığında tetiklenir.
   * - sign1 ve sign2 doluysa sonuçları DOM üzerinden yönetir.
   */
  match(): void {
    console.log(this.sign1); // Debug: birinci burcu yazdır
    console.log(this.sign2); // Debug: ikinci burcu yazdır

    if (this.sign1 && this.sign2) {
      // İlk olarak .matchResults altındaki tüm sonuç bölümlerini gizle
      document
        .querySelectorAll('.matchResults .container > section > div')
        .forEach(div => {
          (div as HTMLElement).style.display = 'none';
        });

      // Ardından id’si "<sign1>_<sign2>" olan sonucu bul
      const el = document.getElementById(`${this.sign1}_${this.sign2}`);
      if (el) {
        // Bulunan elemanı görünür yap ve 'hidden' sınıfını kaldır
        el.style.display = 'block';
        el.classList.remove('hidden');
      }
    }
  }
}
