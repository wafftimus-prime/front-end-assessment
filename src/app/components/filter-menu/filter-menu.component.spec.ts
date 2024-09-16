/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { VowelSearchComponent } from './filter-menu.component';

describe('VowelSearchComponent', () => {
  let component: VowelSearchComponent;
  let fixture: ComponentFixture<VowelSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VowelSearchComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VowelSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
