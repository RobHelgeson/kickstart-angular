import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';
import { FaqItemComponent } from '../faq-item/faq-item.component';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [FaqItemComponent],
  templateUrl: './faq-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqPageComponent {
  readonly faqs = input.required<Faq[]>();
}
