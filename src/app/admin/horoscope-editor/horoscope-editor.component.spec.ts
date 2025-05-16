import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoroscopeEditorComponent } from './horoscope-editor.component';

describe('HoroscopeEditorComponent', () => {
  let component: HoroscopeEditorComponent;
  let fixture: ComponentFixture<HoroscopeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoroscopeEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoroscopeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
