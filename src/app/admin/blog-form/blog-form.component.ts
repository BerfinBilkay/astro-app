// src/app/components/blog-form/blog-form.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  Validators,
  FormBuilder
} from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { MatSelectModule }    from '@angular/material/select';
import { switchMap, of }      from 'rxjs';

import { BlogService } from '../../services/blog.service';
import { Blog }        from '../../models/blog';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule    // ← Ekledik
  ],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.css'
})
export class BlogFormComponent {
  private fb     = inject(FormBuilder);
  private svc    = inject(BlogService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  // Burç listesi
  zodiacSigns = [
    'Genel','Koç','Boğa','İkizler','Yengeç','Aslan','Başak',
    'Terazi','Akrep','Yay','Oğlak','Kova','Balık'
  ];

  // Form grubu
  f = this.fb.nonNullable.group({
    title:      ['', Validators.required],
    content:    ['', Validators.required],
    zodiacSign:['', Validators.required]  // ← Yeni kontrol
  });

  edit    = false;
  file?: File;
  prv?: string;
  blogId?: string;

  constructor() {
    this.route.paramMap.pipe(
      switchMap(p => {
        const id = p.get('id');
        if (id) {
          this.edit   = true;
          this.blogId = id;
          return this.svc.getBlog(id);
        }
        return of(null);
      })
    ).subscribe(b => {
      if (b) {
        this.f.patchValue({
          title:      b.title,
          content:    b.content,
          zodiacSign: b.zodiacSign // ← Mevcut blog'dan burçu yüklüyoruz
        });
        this.prv = b.imageUrl;
      }
    });
  }

  fc(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.file = file;
    const rdr = new FileReader();
    rdr.onload = e => this.prv = e.target!.result as string;
    rdr.readAsDataURL(file);
  }

  async save() {
    const data: Blog = {
      title:      this.f.get('title')!.value,
      content:    this.f.get('content')!.value,
      zodiacSign:this.f.get('zodiacSign')!.value, // ← Burç verisi
      createdAt:  new Date()
    };

    if (this.edit && this.blogId) {
      await this.svc.updateBlog(this.blogId, data, this.file);
    } else {
      await this.svc.addBlog(data, this.file);
    }

    this.router.navigate(['/admin/dashboard']);
  }
}
