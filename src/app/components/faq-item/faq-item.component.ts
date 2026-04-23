import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  templateUrl: './faq-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqItemComponent {
  readonly question = input.required<string>();
  readonly answer = input.required<string>();
}
