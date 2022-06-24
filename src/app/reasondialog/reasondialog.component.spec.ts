import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReasondialogComponent } from './reasondialog.component';

describe('ReasondialogComponent', () => {
  let component: ReasondialogComponent;
  let fixture: ComponentFixture<ReasondialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReasondialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReasondialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
