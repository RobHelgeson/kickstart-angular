import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Faq } from '../../../types';
import { ContentstackService } from '../services/contentstack.service';

export const faqResolver: ResolveFn<Faq[]> = () =>
  inject(ContentstackService)
    .getFaqs()
    .pipe(
      catchError(error => {
        console.log(
          `I know i have said not to catch these errors and use dummy data,
          but this is a demo and we do not have the proper failure path processors.`
        );
        console.error('Failed to load FAQs: ', error);
        return of([]);
      })
    );
