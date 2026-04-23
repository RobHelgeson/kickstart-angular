import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { HeroBlock } from '../../../../types';

@Component({
  selector: 'app-hero-block',
  standalone: true,
  templateUrl: './hero-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroBlockComponent {
  readonly block = input.required<HeroBlock>();
}
