// src/app/user/profile-editor.component.ts
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Location } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Color, PerspectiveCamera, Points, RawShaderMaterial, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { Tween, Easing, update as tweenUpdate } from '@tweenjs/tween.js';

@Component({
  standalone: true,
  selector: 'app-user-update',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css']
})
export class UserUpdateComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  form!: FormGroup;
  private sub!: Subscription;
  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private orbit!: OrbitControls;
  private currentSign!: string;
  private originalData!: {
    displayName?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private location: Location
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      displayName: [''],
      email: [{ value: '', disabled: true }],
      birthDate: [''],
      birthTime: [''],
      birthLocation: ['']
    });

    this.sub = this.authService.currentUserProfile()
      .subscribe(user => {
        if (user) {
          // Orijinali sakla
          this.originalData = {
            displayName: user.displayName,
            birthDate: user.birthDate,
            birthTime: user.birthTime,
            birthLocation: user.birthLocation
          };
          this.form.patchValue(this.originalData);
        }
      });
  }

  async save() {
    if (this.form.invalid) return;
    const { displayName, birthDate, birthTime, birthLocation } = this.form.getRawValue();
    this.authService.updateProfile({ displayName, birthDate, birthTime, birthLocation })
      .then(() => this.location.back())
      .catch(err => console.error('Hata:', err));    
  }

  cancel() {
    // Formu orijinal değerlere geri döndür
    this.form.patchValue(this.originalData);
    this.location.back();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.orbit.dispose();
    this.renderer.dispose();
  }

  ngAfterViewInit(): void {
    this.initThree();
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
