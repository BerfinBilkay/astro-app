// src/app/services/chatgpt.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AppUser } from '../models/appuser';
import { ChatCompletionResponse } from '../models/chat_completion_response';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatGptService {
  private apiKey = environment.openai.apiKey;
  private apiUrl = environment.openai.apiUrl;
  private model = environment.openai.model;

  constructor(private http: HttpClient) { }

  generateBirthChart(user: AppUser): Observable<string> {
    const messages = [
      {
        role: 'system',
        content: `Sen bir astrolog teyze gibisin; emoji’ler kullanarak, 
        inline CSS ile HTML (<div>, <h1>, <p>, <span> etiketleri) formatında 
        Doğum Haritası Analizi hazırla. Etiket olarak en dışta <div> etiketi bulunsun 
        ve arkaplan transparent olsun. Yazıların rengini sakın koyu tonlarda ayarlama.
        Bu analiz, .... doğum haritasına
        dayanmaktadır vesaire deme`
      },
      {
        role: 'user',
        content: `
Ad: ${user.displayName}
Doğum Tarihi: ${user.birthDate}
Doğum Saati: ${user.birthTime}
Doğum Yeri: ${user.birthLocation}
        `
      }
    ];

    const body = {
      model: this.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 1024
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`
    });

    return this.http.post<ChatCompletionResponse>(this.apiUrl, body, { headers }).pipe(
      map(res => {
        const choice = res.choices?.[0];
        if (choice?.message?.content) {
          return choice.message.content.trim().replace("```html", "").replace("```", "");
        }
        throw new Error('ChatGPT’den geçerli bir içerik dönmedi.');
      }),
      catchError(err => {
        console.error('ChatGPT API hatası:', err);
        return throwError(() => new Error('Doğum haritası oluşturulamadı (ChatGPT).'));
      })
    );
  }
}
