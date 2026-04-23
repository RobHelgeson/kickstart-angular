import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Faq } from '../../../../types';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  templateUrl: './faq-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqItemComponent {
  readonly faq = input.required<Faq>();
}
