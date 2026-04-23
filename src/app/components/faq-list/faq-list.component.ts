import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';
import { FaqContentStackConnectorComponent } from '../faq-content-stack-connector/faq-content-stack-connector.component';

@Component({
  selector: 'app-faq-list',
  standalone: true,
  imports: [FaqContentStackConnectorComponent],
  templateUrl: './faq-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqListComponent {
  readonly heading = input<string>('Frequently Asked Questions');
  readonly subtitle = input<string>('');
  readonly faqs = input.required<Faq[]>();
}
