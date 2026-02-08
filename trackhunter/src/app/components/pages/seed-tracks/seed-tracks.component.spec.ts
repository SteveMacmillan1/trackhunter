import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgxSpinnerService } from 'ngx-spinner';
import { SeedTracksComponent } from './seed-tracks.component';

describe('SeedTracksComponent', () => {
  let component: SeedTracksComponent;
  let fixture: ComponentFixture<SeedTracksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgxSpinnerModule,
        FontAwesomeModule
      ],
      declarations: [SeedTracksComponent],
      providers: [
        NgxSpinnerService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeedTracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
