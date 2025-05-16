import {
  Component, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, ViewEncapsulation,
  inject,
  ViewContainerRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HoroscopeService } from '../../services/horoscope.service';
import { Observable, of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { StarMapComponent } from '../../user/star-map/star-map.component';
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, PerspectiveCamera, Points, RawShaderMaterial, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js';
import { ZodiacMatchComponent } from '../../user/zodiac-match/zodiac-match.component';
import { AppUser } from '../../models/appuser';
import { BlogService } from '../../services/blog.service';
import { Blog } from '../../models/blog';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NumerologyResult } from '../../models/numerology_result';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ChatGptService } from '../../services/chatgpt.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('mainContent', { static: true }) mainContentRef!: ElementRef<HTMLDivElement>;
  @ViewChild('numerologyContent', { read: ViewContainerRef, static: true }) numerologyContentRef!: ViewContainerRef;
  @ViewChild('birthChartContent', { read: ViewContainerRef, static: true }) birthChartContentRef!: ViewContainerRef;

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private orbit!: OrbitControls;
  private currentSign!: string;
  private svc = inject(BlogService);
  private fb = inject(NonNullableFormBuilder);

  blogs$: Observable<Blog[]> = new Observable<Blog[]>();
  user$: Observable<AppUser | null>;
  horoscope$: Observable<string>;
  f = this.fb.group({
    fullName: ['', Validators.required],
    birthDate: ['', Validators.required]
  });
  result?: NumerologyResult;
  birthChartHtml?: SafeHtml;
  loading = true;

  constructor(
    private auth: AuthService,
    private chatgptService: ChatGptService,
    private horoscopeService: HoroscopeService,
    private router: Router,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.user$ = this.auth.currentUserProfile();
    this.horoscope$ = this.user$.pipe(
      switchMap(user => {
        if (!user) return of('Önce giriş yapın.');
        const sign = this.getZodiacSign(user.birthDate!);
        return this.horoscopeService.getDailyHoroscope(sign);
      })
    );
  }

  ngAfterViewInit(): void {
    this.initThree();
  }

  ngOnDestroy(): void {
    this.orbit.dispose();
    this.renderer.dispose();
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigateByUrl('/login'));
  }

  userUpdate(): void {
    this.router.navigateByUrl("user-update")
  }

  showStartMap() {
    this.dialog.open(StarMapComponent, {
      width: '380px',
      height: '380px',
      panelClass: 'star-map-panel',
      data: { sign: this.currentSign }
    });
  }

  showBirthChart() {
    this.auth.currentUserProfile()
      .pipe(
        // AppUser veya null dönüyorsa, null’ları eliyoruz:
        filter((u: AppUser | null): u is AppUser => !!u),
        // Sonra user’ı alıp doğum haritası HTML’ini isteyecek metoda yolluyoruz:
        switchMap((user: AppUser) => {
          if (user.birthChart) {
            // Daha önce oluşturulmuş HTML'i direkt döndür
            return of(user.birthChart);
          } else {
            // Servisi çağır, sonra isteğe bağlı olarak profile'a kaydet
            return this.chatgptService.generateBirthChart(user).pipe(
              tap(htmlString => {
                // Opsiyonel: Oluşan html'i user profiline kaydetmek isterseniz
                this.auth.updateProfile({ birthChart: htmlString })
                  .then(() => of(user.birthChart)).catch(err => console.error('Hata:', err));
              })
            );
          }
        }
        )
      )
      .subscribe({
        next: (htmlString: string) => {
          // Gelen raw HTML’i Angular sanitize’den muaf hâle getiriyoruz:
          this.birthChartHtml = this.sanitizer.bypassSecurityTrustHtml(htmlString);
          this.loading = false;
        },
        error: err => {
          console.error('Birth chart yüklenirken hata:', err);
          this.loading = false;
        }
      });
    this.mainContentRef.nativeElement.style.display = "none";
    this.birthChartContentRef.element.nativeElement.style.display = "block";
  }

  showNumerology() {
    this.mainContentRef.nativeElement.style.display = "none";
    this.numerologyContentRef.element.nativeElement.style.display = "block";
  }

  ShowMainContent() {
    this.mainContentRef.nativeElement.style.display = "block";
    this.numerologyContentRef.element.nativeElement.style.display = "none";
    this.birthChartContentRef.element.nativeElement.style.display = "none";
  }

  showZodiacMatch() {
    console.log(this.currentSign);
    this.dialog.open(ZodiacMatchComponent, {
      width: '380px',
      height: '380px',
      panelClass: 'zodiac-match-panel',
      data: { sign: this.currentSign }
    });
  }

  private getZodiacSign(dateStr: string): string {
    const d = new Date(dateStr), m = d.getMonth() + 1, day = d.getDate();
    this.currentSign = 'Oğlak';
    if ((m === 1 && day >= 20) || (m === 2 && day <= 18)) {
      this.currentSign = 'Kova';
    }
    if ((m === 2 && day >= 19) || (m === 3 && day <= 20)) {
      this.currentSign = 'Balık';
    }
    if ((m === 3 && day >= 21) || (m === 4 && day <= 19)) {
      this.currentSign = 'Koç';
    }
    if ((m === 4 && day >= 20) || (m === 5 && day <= 20)) {
      this.currentSign = 'Boğa';
    }
    if ((m === 5 && day >= 21) || (m === 6 && day <= 20)) {
      this.currentSign = 'İkizler';
    }
    if ((m === 6 && day >= 21) || (m === 7 && day <= 22)) {
      this.currentSign = 'Yengeç';
    }
    if ((m === 7 && day >= 23) || (m === 8 && day <= 22)) {
      this.currentSign = 'Aslan';
    }
    if ((m === 8 && day >= 23) || (m === 9 && day <= 22)) {
      this.currentSign = 'Başak';
    }
    if ((m === 9 && day >= 23) || (m === 10 && day <= 22)) {
      this.currentSign = 'Terazi';
    }
    if ((m === 10 && day >= 23) || (m === 11 && day <= 21)) {
      this.currentSign = 'Akrep';
    }
    if ((m === 11 && day >= 22) || (m === 12 && day <= 21)) {
      this.currentSign = 'Yay';
    }
    this.blogs$ = this.svc.getBlogs([this.currentSign, 'Genel']);
    return this.currentSign;
  }

  calculate() {
    const name = this.f.controls.fullName.value.trim().toUpperCase();
    const date = this.f.controls.birthDate.value;

    const lifePath = this.calcLifePath(date);
    const expression = this.reduce(this.sumName(name));
    const soulUrge = this.reduce(this.sumName(name, true));
    const personality = this.reduce(this.sumName(name, false, true));

    this.result = {
      lifePath,
      expression,
      soulUrge,
      personality,
      interpretation: {
        lifePath: this.describeLifePath(lifePath),
        expression: this.describeExpression(expression),
        soulUrge: this.describeSoulUrge(soulUrge),
        personality: this.describePersonality(personality)
      }
    };
  }

  private calcLifePath(dateStr: string): number {
    const digits = dateStr.replace(/\D/g, '').split('').map(Number);
    return this.reduce(digits.reduce((a, b) => a + b, 0));
  }

  private sumName(
    name: string,
    onlyVowels = false,
    onlyConsonants = false
  ): number {
    const map: Record<string, number> = {
      A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9,
      J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9,
      S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8
    };
    const vowels = new Set(['A', 'E', 'I', 'O', 'U', 'Ö', 'Ü', 'Â', 'Î']);
    return Array.from(name)
      .filter(ch => /[A-ZÇĞİÖŞÜ]/.test(ch))
      .filter(ch => onlyVowels ? vowels.has(ch)
        : onlyConsonants ? !vowels.has(ch)
          : true)
      .map(ch => map[ch] || 0)
      .reduce((a, b) => a + b, 0);
  }

  private reduce(num: number): number {
    if (num === 11 || num === 22) return num;
    const s = num.toString().split('').map(Number).reduce((a, b) => a + b, 0);
    return s > 9 ? this.reduce(s) : s;
  }

  private describeLifePath(n: number): string {
    const map: Record<number, string> = {
      1: 'Lider ruhu, yenilikçi ve bağımsızsın.',
      2: 'Uyum peşindesin, işbirliği ve diplomasi senin gücün.',
      3: 'Yaratıcılık ve iletişimde öne çıkarsın, neşelisin.',
      4: 'Pratik ve kararlısın, sağlam temeller inşa etmeyi seversin.',
      5: 'Özgürlük ve macera tutkulusun, değişime açıksın.',
      6: 'Sorumluluk sahibi ve şefkatlisin, aile ve topluma değer verirsin.',
      7: 'Araştırmacı ve içe dönüksün, derin anlayış ararsın.',
      8: 'Güçlü yönetici yeteneklerin var, başarı ve zenginlik odağın.',
      9: 'İdealist ve merhametlisin, insanlığa hizmet motivasyonun var.',
      11: 'Üstat sayı 11: Yüksek sezgiselliğin ve ruhsal vizyonun var.',
      22: 'Üstat sayı 22: Büyüklük ve büyük projeler inşa etme kapasiten var.'
    };
    return map[n] || 'Eşsiz bir titreşimin var.';
  }

  private describeExpression(n: number): string {
    const map: Record<number, string> = {
      1: 'Güçlü irade ve liderlik potansiyelin yüksek.',
      2: 'İkna kabiliyetin ve uyum yeteneğin öne çıkar.',
      3: 'Yaratıcı ifade ve sosyal beceriler senin ışığın.',
      4: 'Disiplinli çalışma stilinle güven verirsin.',
      5: 'Esnek ve uyumlu yapınla değişime ayak uydurursun.',
      6: 'Şefkatli ve destekleyici bir ifade tarzın var.',
      7: 'Analitik ve sorgulayıcı zihninle bilgin derin.',
      8: 'Organizasyon ve yönetimde doğal bir yeteneğin var.',
      9: 'Genel bakışınla insanlığa dokunan bir ifade tarzın var.',
      11: 'Üstat 11: İlham veren bir vizyon taşıyorsun.',
      22: 'Üstat 22: Somut sonuçlar yaratma yeteneğin var.'
    };
    return map[n] || '';
  }

  private describeSoulUrge(n: number): string {
    const map: Record<number, string> = {
      1: 'Özünde bağımsızlık ve liderlik arzusu taşırsın.',
      2: 'Huzur ve uyum senin en derin ihtiyacın.',
      3: 'Duygusal olarak ifade ve neşe ararsın.',
      4: 'Güvenlik ve düzen senin temel arzun.',
      5: 'Özgürlük ve macera ruhun atar.',
      6: 'Sevgi ve hizmet duygusu seni besler.',
      7: 'Ruhsal bilgi ve içsel keşif arzun var.',
      8: 'Güç ve maddi güvenlik arzun yüksek.',
      9: 'Evrensel sevgi ve insanlığa adanma arzun var.',
      11: 'Üstat 11: İlham ve aydınlanma peşindesin.',
      22: 'Üstat 22: Büyük projelere hizmet etme arzun var.'
    };
    return map[n] || '';
  }

  private describePersonality(n: number): string {
    const map: Record<number, string> = {
      1: 'Dışarıya kararlı ve cesur görünürsün.',
      2: 'Nazik ve diplomatik bir izlenim bırakırsın.',
      3: 'Canlı ve neşeli bir kişiliğin var.',
      4: 'Güklenilir ve düzenli bir izlenim verirsin.',
      5: 'Enerjik ve meraklı bir tip olarak algılanırsın.',
      6: 'Sıcak ve koruyucu bir aura yansıtırsın.',
      7: 'Gizemli ve düşünceli bir hava verirsin.',
      8: 'Güçlü ve otoriter bir izlenim bırakırsın.',
      9: 'Cömert ve evrensel bir enerji yayarsın.',
      11: 'Üstat 11: İlham verici ve ruhsal derinlik hissi yansıtırsın.',
      22: 'Üstat 22: Büyük ölçekli projelere liderlik edebilecek görünürsün.'
    };
    return map[n] || '';
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;

    // 1) Sahne ve Kamera
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 2, 3);

    // 2) Renderer
    this.renderer = new WebGLRenderer({ canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3) Kontroller
    this.orbit = new OrbitControls(this.camera, canvas);

    // 4) Alpha haritası (star shape)
    const ctx = document.createElement('canvas').getContext('2d')!;
    ctx.canvas.width = ctx.canvas.height = 32;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 32, 32);
    let grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0, '#fff');
    grd.addColorStop(1, '#000');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 32, 32);
    grd = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grd.addColorStop(0.1, '#ffff');
    grd.addColorStop(0.6, '#0000');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 32, 32);
    const alphaMap = new CanvasTexture(ctx.canvas);

    // 5) Shader yardımcı fonksiyonu
    const shaderUtils = `
      float random(vec2 st){ return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }
      vec3 scatter(vec3 seed){
        float u=random(seed.xy), v=random(seed.yz);
        float theta=u*6.2831853, phi=acos(2.0*v-1.0);
        return vec3(sin(phi)*cos(theta), sin(phi)*sin(theta), cos(phi));
      }
    `;

    // 6) Galaxy verileri
    const count = 128 ** 2;
    const galaxyPosition = new Float32Array(count * 3);
    const galaxySeed = new Float32Array(count * 3);
    const galaxySize = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      galaxyPosition[i * 3] = i / count;
      galaxyPosition[i * 3 + 1] = 0;
      galaxyPosition[i * 3 + 2] = 0;
      galaxySeed[i * 3] = Math.random();
      galaxySeed[i * 3 + 1] = Math.random();
      galaxySeed[i * 3 + 2] = Math.random();
      galaxySize[i] = Math.random() * 2 + 0.5;
    }

    const galaxyGeometry = new BufferGeometry();
    galaxyGeometry.setAttribute('position', new BufferAttribute(galaxyPosition, 3));
    galaxyGeometry.setAttribute('seed', new BufferAttribute(galaxySeed, 3));
    galaxyGeometry.setAttribute('size', new BufferAttribute(galaxySize, 1));

    // 7) Galaxy materyali
    const galaxyMaterial = new RawShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 3.12 },
        // uSize:       { value: this.renderer.getPixelRatio() },
        uBranches: { value: 4 },
        uRadius: { value: 3.4 },
        uSpin: { value: 11.33 },
        uRandomness: { value: 1 },
        uAlphaMap: { value: alphaMap },
        uColorInn: { value: new Color('#756e6c') },
        uColorOut: { value: new Color('#5011b6') },
      },
      vertexShader: `
        precision highp float;
        attribute vec3 position;
        attribute float size;
        attribute vec3 seed;
        uniform mat4 projectionMatrix, modelViewMatrix;
        uniform float uTime, uSize, uBranches, uRadius, uSpin, uRandomness;
        varying float vDistance;
        #define PI2 6.28318530718
        ${shaderUtils}
        void main() {
          vec3 p = position;
          float qt = p.x * p.x;
          float angle = qt * uSpin * (2.0 - sqrt(1.0 - qt));
          float branch = (PI2 / uBranches) * floor(seed.x * uBranches);
          p.x = position.x * cos(angle + branch) * uRadius;
          p.z = position.x * sin(angle + branch) * uRadius;
          p += scatter(seed) * random(seed.zx) * uRandomness * mix(sqrt(position.x), position.x*position.x, position.x);
          p.y *= 0.5 + qt * 0.5;
          vec3 tmp = p;
          float ac = cos(-uTime * (2.0 - sqrt(position.x)) * 0.5);
          float as = sin(-uTime * (2.0 - sqrt(position.x)) * 0.5);
          p.x = tmp.x * ac - tmp.z * as;
          p.z = tmp.x * as + tmp.z * ac;
          vDistance = mix(sqrt(position.x), position.x*position.x, position.x);
          vec4 mvp = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mvp;
          gl_PointSize = (10.0 * size * uSize) / -mvp.z;
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec3 uColorInn, uColorOut;
        uniform sampler2D uAlphaMap;
        varying float vDistance;
        void main() {
          vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
          float a = texture2D(uAlphaMap, uv).g;
          if (a < 0.1) discard;
          vec3 color = mix(uColorInn, uColorOut, vDistance);
          float c = step(0.99, (sin(gl_PointCoord.x * 3.1415926) + sin(gl_PointCoord.y * 3.1415926)) * 0.5);
          color = max(color, vec3(c));
          gl_FragColor = vec4(color, a);
        }
      `,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: AdditiveBlending
    });

    // 8) Points nesnesi ve sahneye ekleme
    const galaxy = new Points(galaxyGeometry, galaxyMaterial);
    this.scene.add(galaxy);

    // 9) GUI & animasyon
    const u = galaxyMaterial.uniforms;
    const gui = new GUI().close();
    gui.add(u['uSize'], 'value', 0, 4, 0.01).name('star size');
    gui.add(u['uBranches'], 'value', 1, 5, 1).name('branch num');
    const cRadius = gui.add(u['uRadius'], 'value', 0, 5, 0.01).name('scale');
    const cSpin = gui.add(u['uSpin'], 'value', -12.57, 12.57, 0.01).name('spin');
    const cRandomness = gui.add(u['uRandomness'], 'value', 0, 1, 0.01).name('scatter');
    gui.addColor({ color: (u['uColorInn'].value as Color).getHexString() }, 'color')
      .name('inn color')
      .onChange((hex: string) => u['uColorInn'].value = new Color(hex));
    gui.addColor({ color: (u['uColorOut'].value as Color).getHexString() }, 'color')
      .name('out color')
      .onChange((hex: string) => u['uColorOut'].value = new Color(hex));

    new Tween({ radius: 0, spin: 0, randomness: 0, rotate: 0 })
      .to({ radius: 1.618, spin: Math.PI * 2, randomness: 0.5, rotate: Math.PI * 4 }, 5000)
      .easing(Easing.Cubic.InOut)
      .onUpdate(({ radius, spin, randomness, rotate }: { radius: number; spin: number; randomness: number; rotate: number }) => {
        cRadius.setValue(radius); cRadius.updateDisplay();
        cSpin.setValue(spin); cSpin.updateDisplay();
        cRandomness.setValue(randomness); cRandomness.updateDisplay();
        galaxy.rotation.y = rotate;
      })
      .onComplete(() => gui.open())
      .start();
    gui.hide();

    // 10) Render döngüsü
    this.renderer.setAnimationLoop(() => {
      u['uTime'].value = (u['uTime'].value as number) + 0.001 / 2;
      tweenUpdate();
      this.orbit.update();
      this.renderer.render(this.scene, this.camera);
    });

    // 11) Pencere yeniden boyutlandığında
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
}
