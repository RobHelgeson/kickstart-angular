import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { catchError, of } from 'rxjs';
import { PageWithBlocks } from '../../../types';
import { ContentstackService } from '../services/contentstack.service';

export const pageResolver: ResolveFn<PageWithBlocks | null> = route => {
  const slug = route.paramMap.get('slug');
  const url = `/pages/${slug}`;

  return inject(ContentstackService)
    .getPageWithBlocks(url)
    .pipe(
      catchError(error => {
        console.log(
          `I know i have said not to catch these errors and use dummy data,
          but this is a demo and we do not have the proper failure path processors.`
        );
        console.error(`Failed to load page ${url}:`, error);
        return of(null);
      })
    );
};
