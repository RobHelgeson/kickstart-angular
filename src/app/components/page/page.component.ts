import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageWithBlocks } from '../../../../types';
import { FaqSectionBlockComponent } from '../faq-section-block/faq-section-block.component';
import { HeroBlockComponent } from '../hero-block/hero-block.component';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [HeroBlockComponent, FaqSectionBlockComponent],
  templateUrl: './page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent {
  readonly page = input.required<PageWithBlocks | null>();
}
