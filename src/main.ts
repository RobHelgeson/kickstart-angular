import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { App } from './app/app.component';
import { FaqPageComponent } from './app/components/faq-page/faq-page.component';
import { HomeComponent } from './app/components/home/home.component';
import { PageComponent } from './app/components/page/page.component';
import { faqResolver } from './app/resolvers/faq.resolver';
import { pageResolver } from './app/resolvers/page.resolver';

const routes = [
  { path: '', component: HomeComponent },
  { path: 'faq', component: FaqPageComponent, resolve: { faqs: faqResolver } },
  { path: 'pages/:slug', component: PageComponent, resolve: { page: pageResolver } },
  { path: 'other/page/here', loadComponent: () => import('./app/components/other/other.component').then(m => m.OtherComponent) },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(App, {
  providers: [provideZoneChangeDetection(), provideRouter(routes, withComponentInputBinding())]
}).catch(err => console.error(err));
