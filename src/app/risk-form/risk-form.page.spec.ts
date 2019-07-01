import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskFormPage } from './risk-form.page';

describe('RiskFormPage', () => {
  let component: RiskFormPage;
  let fixture: ComponentFixture<RiskFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RiskFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RiskFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
