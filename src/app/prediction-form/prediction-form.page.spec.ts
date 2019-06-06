import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionFormPage } from './prediction-form.page';

describe('PredictionFormPage', () => {
  let component: PredictionFormPage;
  let fixture: ComponentFixture<PredictionFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PredictionFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PredictionFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
