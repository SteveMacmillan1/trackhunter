import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { By } from '@angular/platform-browser';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FontAwesomeModule],
      declarations: [AboutComponent]
    });
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('FAQ Question', () => {
    let toggleBtn: HTMLElement;

    [1,2,3].forEach((id) => {
      it(`should expand FAQ answer #${id} when clicked once`, () => {
        const toggleBtn = fixture.debugElement.query(By.css(`#expand-icon-${id}`)).nativeElement;
        const answerEl = fixture.debugElement.query(By.css(`#answer-div-${id}`)).nativeElement;

        toggleBtn.click();
        fixture.detectChanges();

        expect(window.getComputedStyle(answerEl).display).toBe('block');
      })
    });

    [1,2,3].forEach((id) => {
      it(`should close FAQ answer #${id} when clicked twice`, () => {
        const toggleBtn = fixture.debugElement.query(By.css(`#expand-icon-${id}`)).nativeElement;
        const answerEl = fixture.debugElement.query(By.css(`#answer-div-${id}`)).nativeElement;

        toggleBtn.click();
        toggleBtn.click();
        fixture.detectChanges();

        expect(window.getComputedStyle(answerEl).display).toBe('none');
      })
    });
  });

});
