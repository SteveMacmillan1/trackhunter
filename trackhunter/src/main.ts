import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { provideRouter } from '@angular/router';
import * as jQuery from 'jquery';

(window as any).$ = (window as any).jQuery = jQuery;


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
