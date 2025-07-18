import { Component, Inject, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface Star {
  x: number;
  y: number;
  r: number;
  p: number[];
  a: number;
}

@Component({
  selector: 'app-star-map',
  templateUrl: './star-map.component.html',
  styleUrl: './star-map.component.css'
})
export class StarMapComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(
    private dialogRef: MatDialogRef<StarMapComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { sign: string }
  ) {}

  ngAfterViewInit() {
    this.drawSign(this.data.sign);
  }
  

  close() {
    this.dialogRef.close();
  }

  // "zero" placeholder
  private zero: Star = { x: 0, y: 0, r: 0, p: [], a: 1 };

  // Tüm burç verilerini burada tut
  private constellationData: Record<string, Star[]> = {
    Oğlak: [   // capricorn
      { x: -119, y: -12, r: 3, p: [1], a: 1 },
      { x: -97, y: -8, r: 3, p: [2], a: 1 },
      { x: -59, y: -4, r: 3, p: [3], a: 1 },
      { x: -15, y: -8, r: 3, p: [4], a: 1 },
      { x: 81, y: -29, r: 4, p: [5], a: 1 },
      { x: 69, y: -3, r: 0, p: [], a: 1 },
      { x: 29, y: 65, r: 3, p: [7, 14], a: 1 },
      { x: 13, y: 79, r: 3, p: [8], a: 1 },
      { x: -21, y: 66, r: 3, p: [9], a: 1 },
      { x: -13, y: 19, r: 3, p: [3, 18], a: 1 },
      { x: -62, y: 43, r: 3, p: [11, 3], a: 1 },
      { x: -69, y: 36, r: 3, p: [2], a: 1 },
      { x: 64, y: -3, r: 2, p: [], a: 1 },
      { x: 73, y: -1, r: 2, p: [], a: 1 },
      { x: 65, y: 5, r: 2, p: [], a: 1 },
      { x: 92, y: -55, r: 3, p: [4], a: 1 },
      { x: 85, y: -53, r: 2, p: [], a: 1 },
      { x: 98, y: -55, r: 2, p: [], a: 1 },
      { x: 60, y: 2, r: 0, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Kova: [   // aquarius
      { x: -112, y: 62, r: 3, p: [1], a: 1 },
      { x: -102, y: 60, r: 3, p: [2], a: 1 },
      { x: -98, y: 52, r: 3, p: [3], a: 1 },
      { x: -93, y: -12, r: 3, p: [4, 5], a: 1 },
      { x: -91, y: -29, r: 3, p: [5], a: 1 },
      { x: -61, y: -22, r: 3, p: [6, 17], a: 1 },
      { x: -5, y: -27, r: 3, p: [7], a: 1 },
      { x: 3, y: -66, r: 3, p: [8, 11], a: 1 },
      { x: -17, y: -58, r: 3, p: [9], a: 1 },
      { x: -46, y: -65, r: 3, p: [10], a: 1 },
      { x: -24, y: -76, r: 3, p: [7], a: 1 },
      { x: 54, y: -39, r: 3, p: [12], a: 1 },
      { x: 89, y: -6, r: 3, p: [13], a: 1 },
      { x: 115, y: -18, r: 3, p: [14], a: 1 },
      { x: 124, y: -16, r: 3, p: [], a: 1 },
      { x: 9, y: 10, r: 3, p: [11], a: 1 },
      { x: -32, y: -67, r: 2, p: [], a: 1 },
      { x: -51, y: 13, r: 3, p: [18], a: 1 },
      { x: -60, y: 28, r: 3, p: [3], a: 1 },
      { x: -70, y: 72, r: 3, p: [20], a: 1 },
      { x: -77, y: 66, r: 3, p: [21], a: 1 },
      { x: -78, y: 56, r: 3, p: [3], a: 1 },
      { x: -101, y: -6, r: 2, p: [], a: 1 },
      { x: -98, y: -10, r: 2, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero
    ],
    Balık: [   // pisces
      { x: -53, y: -76, r: 3, p: [1, 2], a: 1 },
      { x: -43, y: -86, r: 3, p: [2], a: 1 },
      { x: -43, y: -58, r: 3, p: [3], a: 1 },
      { x: -62, y: -27, r: 3, p: [4], a: 1 },
      { x: -70, y: -8, r: 3, p: [5], a: 1 },
      { x: -93, y: 24, r: 3, p: [6], a: 1 },
      { x: -111, y: 60, r: 3, p: [7], a: 1 },
      { x: -83, y: 45, r: 3, p: [8], a: 1 },
      { x: -67, y: 43, r: 3, p: [9], a: 1 },
      { x: -44, y: 36, r: 3, p: [10], a: 1 },
      { x: -32, y: 33, r: 3, p: [11], a: 1 },
      { x: -12, y: 37, r: 3, p: [12], a: 1 },
      { x: 49, y: 35, r: 3, p: [13], a: 1 },
      { x: 76, y: 42, r: 3, p: [14], a: 1 },
      { x: 95, y: 36, r: 3, p: [15], a: 1 },
      { x: 108, y: 40, r: 3, p: [16], a: 1 },
      { x: 111, y: 51, r: 3, p: [17], a: 1 },
      { x: 99, y: 64, r: 3, p: [18], a: 1 },
      { x: 78, y: 66, r: 3, p: [13], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Koç: [   // aries
      { x: -94, y: 49, r: 3, p: [1], a: 1 },
      { x: -60, y: 22, r: 3, p: [2], a: 1 },
      { x: -53, y: -43, r: 3, p: [3, 4], a: 1 },
      { x: -53, y: -67, r: 3, p: [4], a: 1 },
      { x: -34, y: -47, r: 3, p: [5], a: 1 },
      { x: 59, y: -26, r: 4, p: [6], a: 1 },
      { x: 86, y: -35, r: 3, p: [7], a: 1 },
      { x: 97, y: -4, r: 3, p: [5], a: 1 },
      { x: 100, y: 15, r: 3, p: [9], a: 1 },
      { x: 54, y: 7, r: 3, p: [5, 1], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Boğa: [   // taurus
      { x: 6.5, y: 8.5, r: 3, p: [1, 10], a: 1 },
      { x: -6.5, y: 10.5, r: 3, p: [2], a: 1 },
      { x: -18.5, y: 8.5, r: 5, p: [3], a: 1 },
      { x: -113.5, y: -13.5, r: 3, p: [4], a: 1 },
      { x: -33.5, y: -26.5, r: 3, p: [5], a: 1 },
      { x: -11.5, y: -32.5, r: 3, p: [6], a: 1 },
      { x: -8.5, y: -27.5, r: 3, p: [7], a: 1 },
      { x: -9.5, y: -11.5, r: 3, p: [8], a: 1 },
      { x: -1.5, y: -7.5, r: 2, p: [9], a: 1 },
      { x: 3.5, y: -2.5, r: 3, p: [0], a: 1 },
      { x: 39.5, y: 19.5, r: 3, p: [11], a: 1 },
      { x: 85.5, y: 21.5, r: 3, p: [12], a: 1 },
      { x: 93.5, y: 24.5, r: 3, p: [13], a: 1 },
      { x: 87.5, y: 76.5, r: 3, p: [], a: 1 },
      { x: 47.5, y: 53.5, r: 3, p: [11], a: 1 },
      { x: 20.5, y: 45.5, r: 3, p: [0], a: 1 },
      { x: -11.5, y: 43.5, r: 3, p: [17], a: 1 },
      { x: -17.5, y: 27.5, r: 3, p: [0], a: 1 },
      { x: -97.5, y: -53.5, r: 4, p: [4], a: 1 },
      { x: 31.5, y: -47.5, r: 2, p: [5], a: 1 },
      { x: 36.5, y: -49.5, r: 2, p: [21], a: 1 },
      { x: 39.5, y: -52.5, r: 2, p: [22], a: 1 },
      { x: 43.5, y: -55.5, r: 2, p: [23], a: 1 },
      { x: 41.5, y: -48.5, r: 2, p: [24], a: 1 },
      { x: 45.5, y: -50.5, r: 2, p: [], a: 1 },
      { x: 77.5, y: 4.5, r: 3, p: [11], a: 1 },
      { x: -6.5, y: 5.5, r: 2, p: [], a: 1 }
    ],
    İkizler: [   // gemini
      { x: -50, y: 103, r: 3, p: [1], a: 1 },
      { x: -89, y: 27, r: 3, p: [2], a: 1 },
      { x: -58, y: -15, r: 3, p: [3], a: 1 },
      { x: -55, y: -70, r: 3, p: [4], a: 1 },
      { x: -28, y: -61, r: 3, p: [5], a: 1 },
      { x: 11, y: -57, r: 3, p: [6], a: 1 },
      { x: 24, y: 9, r: 3, p: [7], a: 1 },
      { x: 51, y: 66, r: 4, p: [8], a: 1 },
      { x: 69, y: 73, r: 3, p: [9], a: 1 },
      { x: 94, y: 76, r: 3, p: [], a: 1 },
      { x: 23, y: 77, r: 3, p: [6], a: 1 },
      { x: -13, y: 90, r: 4, p: [12], a: 1 },
      { x: -36, y: 23, r: 3, p: [2], a: 1 },
      { x: -81, y: -66, r: 3, p: [3], a: 1 },
      { x: -59, y: -91, r: 5, p: [3], a: 1 },
      { x: -44, y: -95, r: 3, p: [], a: 1 },
      { x: -12, y: -104, r: 5, p: [17], a: 1 },
      { x: -3, y: -91, r: 3, p: [5], a: 1 },
      { x: 65, y: -59, r: 3, p: [5], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Yengeç: [   // cancer
      { x: -91, y: -5, r: 3, p: [1], a: 1 },
      { x: -17, y: -18, r: 3, p: [2], a: 1 },
      { x: 21, y: -39, r: 3, p: [3], a: 1 },
      { x: 34, y: 52, r: 3, p: [4], a: 1 },
      { x: -52, y: 103, r: 3, p: [1], a: 1 },
      { x: 71, y: -96, r: 3, p: [2], a: 1 },
      { x: 4, y: -16, r: 3, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Aslan: [   // leo
      { x: -112, y: 22, r: 4, p: [1], a: 1 },
      { x: -57, y: -13, r: 3, p: [2], a: 1 },
      { x: -36, y: -13, r: 3, p: [3], a: 1 },
      { x: 28, y: -21, r: 4, p: [4], a: 1 },
      { x: 31, y: -44, r: 3, p: [5], a: 1 },
      { x: 55, y: -63, r: 3, p: [6], a: 1 },
      { x: 94, y: -71, r: 3, p: [7], a: 1 },
      { x: 89, y: -51, r: 3, p: [8], a: 1 },
      { x: 68, y: -52, r: 3, p: [9, 5], a: 1 },
      { x: 49, y: -6, r: 3, p: [10, 3], a: 1 },
      { x: -53, y: 19, r: 3, p: [11, 1], a: 1 },
      { x: -66, y: 50, r: 3, p: [12], a: 1 },
      { x: -57, y: 78, r: 3, p: [], a: 1 },
      { x: 20, y: 47, r: 3, p: [10], a: 1 },
      { x: 53, y: 29, r: 5, p: [9], a: 1 },
      { x: 93, y: 36, r: 3, p: [9], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Başak: [   // virgo
      { x: -115, y: 14, r: 3, p: [1], a: 1 },
      { x: -62, y: 4, r: 3, p: [2], a: 1 },
      { x: -16, y: 12, r: 3, p: [3], a: 1 },
      { x: 17, y: -24, r: 3, p: [4], a: 1 },
      { x: 46, y: 0, r: 4, p: [5], a: 1 },
      { x: 69, y: -59, r: 3, p: [6], a: 1 },
      { x: 99, y: -57, r: 3, p: [7], a: 1 },
      { x: 99, y: -31, r: 3, p: [8], a: 1 },
      { x: 73, y: -7, r: 3, p: [4], a: 1 },
      { x: 18, y: 26, r: 3, p: [10, 4], a: 1 },
      { x: 1, y: 57, r: 5, p: [11, 2], a: 1 },
      { x: -52, y: 64, r: 3, p: [12], a: 1 },
      { x: -61, y: 44, r: 3, p: [13, 1], a: 1 },
      { x: -92, y: 54, r: 3, p: [], a: 1 },
      { x: -1, y: -58, r: 3, p: [3], a: 1 },
      { x: 77, y: -50, r: 2, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Terazi: [   // libra
      { x: -17, y: 98, r: 4, p: [1], a: 1 },
      { x: -15, y: 81, r: 4, p: [2], a: 1 },
      { x: -61, y: -35, r: 4, p: [3, 4], a: 1 },
      { x: -31, y: -98, r: 5, p: [4], a: 1 },
      { x: 49, y: -55, r: 5, p: [5], a: 1 },
      { x: 46, y: 41, r: 4, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Akrep: [   // scorpio
      { x: -104, y: 17, r: 3, p: [1], a: 1 },
      { x: -82, y: 16, r: 4, p: [2], a: 1 },
      { x: -71, y: 19, r: 3, p: [3], a: 1 },
      { x: -84, y: 31, r: 3, p: [4], a: 1 },
      { x: -97, y: 36, r: 3, p: [5], a: 1 },
      { x: -105, y: 46, r: 3, p: [6], a: 1 },
      { x: -90, y: 62, r: 4, p: [7], a: 1 },
      { x: -54, y: 69, r: 3, p: [8], a: 1 },
      { x: -28, y: 65, r: 3, p: [9], a: 1 },
      { x: -19, y: 38, r: 3, p: [10], a: 1 },
      { x: -12, y: 12, r: 4, p: [11], a: 1 },
      { x: 22, y: -21, r: 3, p: [12], a: 1 },
      { x: 37, y: -34, r: 5, p: [13], a: 1 },
      { x: 57, y: -32, r: 3, p: [14], a: 1 },
      { x: 74, y: -73, r: 3, p: [15], a: 1 },
      { x: 87, y: -69, r: 3, p: [16], a: 1 },
      { x: 97, y: -45, r: 3, p: [17], a: 1 },
      { x: 92, y: -20, r: 3, p: [18], a: 1 },
      { x: 89, y: 3, r: 3, p: [19], a: 1 },
      { x: 62, y: -14, r: 3, p: [13], a: 1 },
      { x: 84, y: -60, r: 3, p: [15], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ],
    Yay: [   // sagittarius
      { x: -77, y: 94, r: 3, p: [1], a: 1 },
      { x: -96, y: 45, r: 3, p: [2, 14], a: 1 },
      { x: -14, y: -18, r: 3, p: [3], a: 1 },
      { x: 10, y: -32, r: 5, p: [4, 6], a: 1 },
      { x: -18, y: -69, r: 3, p: [5, 16], a: 1 },
      { x: 1, y: -70, r: 3, p: [3], a: 1 },
      { x: 26, y: -21, r: 3, p: [7, 13], a: 1 },
      { x: 63, y: -4, r: 3, p: [8, 10], a: 1 },
      { x: 54, y: -34, r: 3, p: [9], a: 1 },
      { x: 78, y: -68, r: 3, p: [10], a: 1 },
      { x: 90, y: 5, r: 3, p: [11], a: 1 },
      { x: 66, y: 50, r: 3, p: [12], a: 1 },
      { x: 53, y: 29, r: 4, p: [7], a: 1 },
      { x: 0, y: 2, r: 3, p: [14], a: 1 },
      { x: -35, y: 78, r: 3, p: [15], a: 1 },
      { x: -28, y: 106, r: 3, p: [], a: 1 },
      { x: -46, y: -89, r: 3, p: [17], a: 1 },
      { x: -42, y: -110, r: 3, p: [], a: 1 },
      { x: -4, y: -60, r: 3, p: [], a: 1 },
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero,
      this.zero
    ]
  };

  private drawSign(sign: string) {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const data = this.constellationData[sign] || [];
  
    // 1) Canvas boyutları
    const W = canvas.width;
    const H = canvas.height;
    const padding = 20; // kenarlarda boşluk
  
    // 2) Görünecek yıldızları al, min/max hesapla
    const pts = data.filter(s => s.r > 0);
    if (pts.length) {
      const xs = pts.map(s => s.x);
      const ys = pts.map(s => s.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      const boxW = maxX - minX, boxH = maxY - minY;
  
      // 3) Scale faktörü: hem yatay hem dikey fit olsun
      const scale = Math.min(
        (W - 2 * padding) / boxW,
        (H - 2 * padding) / boxH
      );
  
      // 4) Veri koordinat sisteminin merkezi
      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
  
      // 5) Temizle, dönüştürmeleri uygula
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      // önce canvas merkezine taşı
      ctx.translate(W / 2, H / 2);
      // sonra ölçek uygula
      ctx.scale(scale, scale);
      // nihayet orijinal veri merkezini (0,0)'a getir
      ctx.translate(-centerX, -centerY);
  
      // --- çizim adımları ---
      // a) çizgiler
      ctx.beginPath();
      data.forEach(star => {
        star.p.forEach(pi => {
          const next = data[pi - 1];
          if (next && next.r > 0) {
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(next.x, next.y);
          }
        });
      });
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
  
      // b) yıldız noktaları
      data.forEach(star => {
        if (star.r <= 0) return;
        ctx.globalAlpha = star.a;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
  
      // 6) transformları geri al
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }  
}