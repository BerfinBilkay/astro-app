// src/app/services/blog.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  Query,
  query,
  where,
  DocumentData
} from '@angular/fire/firestore';
import { Blog } from '../models/blog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private col = 'blogs';
  constructor(private fs: Firestore) {}

  getBlogs(zodiacSigns?: string | string[]): Observable<Blog[]> {
    const baseCol = collection(
      this.fs,
      this.col
    ) as CollectionReference<DocumentData>;
    let blogsQuery: Query<DocumentData> = baseCol;

    if (zodiacSigns != null) {
      // Tek string gelmişse
      if (typeof zodiacSigns === 'string') {
        const s = zodiacSigns.trim();
        if (s !== '') {
          blogsQuery = query(baseCol, where('zodiacSign', '==', s));
        }
      }
      // Dizi gelmişse
      else if (Array.isArray(zodiacSigns)) {
        // Undefined/empty öğeleri çıkar
        const filtered = zodiacSigns
          .map(x => x?.trim())
          .filter(x => x) as string[];
        // En az bir öğe kaldıysa 'in' filtresi uygula
        if (filtered.length > 0) {
          blogsQuery = query(baseCol, where('zodiacSign', 'in', filtered));
        }
      }
    }

    return collectionData(blogsQuery, { idField: 'id' }).pipe(
      map((arr: any[]) =>
        arr.map(b => ({
          ...b,
          createdAt: b.createdAt.toDate()
        })) as Blog[]
      )
    );
  }
  
  getBlog(id: string): Observable<Blog> {
    const d = doc(this.fs, `${this.col}/${id}`);
    return docData(d, { idField: 'id' }).pipe(
      map((b: any) => ({ ...b, createdAt: b.createdAt.toDate() }))
    );
  }

  async addBlog(blog: Blog, file?: File) {
    let img: string | undefined;
    if (file) {
      img = await this.compressAndGetDataURL(file, 800, 0.7);
    }
    // payload içerisine spread ile zodiacSign de dahil oluyor
    return addDoc(collection(this.fs, this.col), {
      title:      blog.title,
      content:    blog.content,
      imageUrl:   img,
      createdAt:  new Date(),
      zodiacSign: blog.zodiacSign
    });
  }

  async updateBlog(id: string, data: Partial<Blog>, file?: File) {
    if (file) {
      data.imageUrl = await this.compressAndGetDataURL(file, 800, 0.7);
    }
    // data içinde varsa zodiacSign ve diğer alanlar da güncellenir
    return updateDoc(doc(this.fs, `${this.col}/${id}`), {
      ...data,
      ...(data.zodiacSign !== undefined && { zodiacSign: data.zodiacSign })
    });
  }

  deleteBlog(id: string) {
    return deleteDoc(doc(this.fs, `${this.col}/${id}`));
  }

  /** FileReader ile base64 string’e çevirir */
  private compressAndGetDataURL(
    file: File,
    maxWidth: number,
    quality: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = event => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height = height * (maxWidth / width);
            width = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context alınamadı');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = err => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });
  }
}
