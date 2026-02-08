import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ViewedTracksComponent } from './viewed-tracks.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';

describe('ViewedTracksComponent', () => {
  let component: ViewedTracksComponent;
  let fixture: ComponentFixture<ViewedTracksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ 
        FontAwesomeModule, 
        NgxSpinnerModule
      ],
      declarations: [ ViewedTracksComponent ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        NgxSpinnerService
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewedTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
