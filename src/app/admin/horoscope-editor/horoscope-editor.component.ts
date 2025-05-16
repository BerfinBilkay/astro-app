// src/app/admin/horoscope-editor.component.ts

// Angular’ın Component dekoratörü ve lifecycle arayüzü OnInit
import { Component, OnInit } from '@angular/core';
// Standalone bileşenlerde *ngIf, *ngFor vb. yapılar için CommonModule
import { CommonModule } from '@angular/common';
// Reactive ve template-driven formlar için gerekli modüller
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// Angular Material form field (etiket) modülü
import { MatFormFieldModule }   from '@angular/material/form-field';
// Angular Material select (açılır liste) modülü
import { MatSelectModule }      from '@angular/material/select';
// Angular Material input (metin girişi) modülü
import { MatInputModule }       from '@angular/material/input';
// Angular Material button (buton) modülü
import { MatButtonModule }      from '@angular/material/button';
// Burç yorumları almak ve güncellemek için servis
import { HoroscopeService }     from '../../services/horoscope.service';

@Component({
  // Bu bileşen standalone, yani kendi NgModule’üne sahip
  standalone: true,
  // HTML etiketi: <app-horoscope-editor>
  selector: 'app-horoscope-editor',
  // Şablonun ihtiyaç duyduğu modüller ve bileşenler
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  // Şablon ve stil dosyaları
  templateUrl: './horoscope-editor.component.html',
  styleUrls: ['./horoscope-editor.component.css']
})
export class HoroscopeEditorComponent implements OnInit {
  // Düzenlenecek burç adlarının listesi
  signs = [
    'Kova', 'Balık', 'Koç', 'Boğa',
    'İkizler', 'Yengeç', 'Aslan', 'Başak',
    'Terazi', 'Akrep', 'Yay', 'Oğlak'
  ];

  // Reactive FormGroup tipinde form nesnemiz
  form: FormGroup;

  constructor(
    // FormBuilder, form kontrollerini kolayca oluşturmak için
    private fb: FormBuilder,
    // Burç servisi, Firestore’dan veri okumak ve yazmak için
    private hs: HoroscopeService
  ) {
    // Constructor içinde formu inşa ediyoruz:
    // - 'sign': seçili burcu tutar; varsayılan olarak ilk burç
    // - 'text': o burç için yorum metni
    this.form = this.fb.group({
      sign: [ this.signs[0] ],
      text: ['']
    });
  }

  // Bileşen ayağa kalktığında çalışan lifecycle metodu
  ngOnInit() {
    // 'sign' kontrolünün değeri değiştiğinde load() metodunu çağır
    this.form.get('sign')!.valueChanges.subscribe(s => {
      if (s) {
        this.load(s);
      }
    });

    // Başlangıçta formdaki ilk burcu yükle
    const initSign = this.form.get('sign')!.value!;
    this.load(initSign);
  }

  /**
   * Belirtilen burç için Firestore’dan günlük yorumu okur
   * ve formun 'text' kontrolüne set eder.
   */
  private load(sign: string) {
    this.hs.getDailyHoroscope(sign).subscribe(txt => {
      this.form.get('text')!.setValue(txt);
    });
  }
  
  /**
   * Form verisini alır, konsola log’lar ve
   * HoroscopeService üzerinden Firestore’u günceller.
   */
  save() {
    console.log('Form değeri:', this.form.value);
    const { sign, text } = this.form.value;
    this.hs.setDailyHoroscope(sign, text)
      .then(() => {
        // Başarılı kayıtta istersen kullanıcıya bildirim ekleyebilirsin
      })
      .catch(err => console.error(err));
  }
}
