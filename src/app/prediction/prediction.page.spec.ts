import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionPage } from './prediction.page';

describe('PredictionPage', () => {
  let component: PredictionPage;
  let fixture: ComponentFixture<PredictionPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PredictionPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
