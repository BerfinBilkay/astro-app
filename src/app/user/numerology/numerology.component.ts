import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { NumerologyResult } from '../../models/numerology_result';



@Component({
  selector: 'app-numerology',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './numerology.component.html',
  styleUrls: ['./numerology.component.css']
})
export class NumerologyComponent {
  private fb = inject(NonNullableFormBuilder);

  f = this.fb.group({
    fullName: ['', Validators.required],
    birthDate: ['', Validators.required]
  });

  result?: NumerologyResult;

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
      A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,
      J:1,K:2,L:3,M:4,N:5,O:6,P:7,Q:8,R:9,
      S:1,T:2,U:3,V:4,W:5,X:6,Y:7,Z:8
    };
    const vowels = new Set(['A','E','I','O','U','Ö','Ü','Â','Î']);
    return Array.from(name)
      .filter(ch => /[A-ZÇĞİÖŞÜ]/.test(ch))
      .filter(ch => onlyVowels   ? vowels.has(ch)
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
}