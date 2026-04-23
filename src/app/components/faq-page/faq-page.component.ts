import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';
import { FaqContentStackConnectorComponent } from '../faq-content-stack-connector/faq-content-stack-connector.component';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [FaqContentStackConnectorComponent],
  templateUrl: './faq-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqPageComponent {
  readonly faqs = input.required<Faq[]>();
}
