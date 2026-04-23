import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaqSectionBlock } from '../../../../types';
import { FaqListComponent } from '../faq-list/faq-list.component';

@Component({
  selector: 'app-faq-section-block',
  standalone: true,
  imports: [FaqListComponent],
  template: `
    <app-faq-list
      [heading]="section()?.title ?? ''"
      [subtitle]="section()?.subtitle ?? ''"
      [faqs]="section()?.faqs ?? []"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FaqSectionBlockComponent {
  readonly data = input.required<FaqSectionBlock>();
  // Contentstack wraps single references as an array; unwrap the first entry.
  readonly section = computed(() => this.data().section[0]);
}
