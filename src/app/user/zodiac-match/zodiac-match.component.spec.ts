import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZodiacMatchComponent } from './zodiac-match.component';

describe('ZodiacMatchComponent', () => {
  let component: ZodiacMatchComponent;
  let fixture: ComponentFixture<ZodiacMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZodiacMatchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZodiacMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
