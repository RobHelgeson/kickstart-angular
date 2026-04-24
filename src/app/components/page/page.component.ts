import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PageWithBlocks } from '../../../../types';
import { resolveBlock } from './block-registry';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageComponent {
  readonly page = input.required<PageWithBlocks | null>();
  readonly blocks = computed(() => (this.page()?.blocks ?? []).map(resolveBlock));
}
