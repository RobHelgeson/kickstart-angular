import { provideZoneChangeDetection } from "@angular/core";
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { App } from './app/app.component';
import { HomeComponent } from './app/components/home/home.component';

const routes = [
  { path: '', component: HomeComponent },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(App, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes)
  ]
}).catch(err => console.error(err));