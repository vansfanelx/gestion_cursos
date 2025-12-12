import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCurso } from './form-curso';

describe('FormCurso', () => {
  let component: FormCurso;
  let fixture: ComponentFixture<FormCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormCurso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
