import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';
import { FaqItemComponent } from '../faq-item/faq-item.component';

@Component({
  selector: 'app-faq-content-stack-connector',
  standalone: true,
  imports: [FaqItemComponent],
  template: `<app-faq-item [question]="faq().title" [answer]="faq().answer" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqContentStackConnectorComponent {
  readonly faq = input.required<Faq>();
}
