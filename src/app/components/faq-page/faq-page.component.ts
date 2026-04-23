import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';
import { FaqListComponent } from '../faq-list/faq-list.component';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [FaqListComponent],
  templateUrl: './faq-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqPageComponent {
  readonly faqs = input.required<Faq[]>();
}
