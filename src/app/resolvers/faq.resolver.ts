import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Faq } from '../../../types';
import { ContentstackService } from '../services/contentstack.service';

export const faqResolver: ResolveFn<Faq[]> = () => inject(ContentstackService).getFaqs();
