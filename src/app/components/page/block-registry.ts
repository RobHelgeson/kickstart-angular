import { Type } from '@angular/core';
import { BlockKey, FaqSectionBlock, HeroBlock, PageBlock, PayloadFor } from '../../../../types';
import { FaqSectionBlockComponent } from '../faq-section-block/faq-section-block.component';
import { HeroBlockComponent } from '../hero-block/hero-block.component';

// The generic form used when registering an entry: toInputs is checked against
// the exact payload type for that key, so mistakes are caught at compile time.
type TypedEntry<K extends BlockKey> = {
  component: Type<unknown>;
  toInputs: (value: PayloadFor<K>) => Record<string, unknown>;
};

// The non-generic form used at runtime dispatch, after the key is already known.
type RuntimeEntry = {
  component: Type<unknown>;
  toInputs: (value: unknown) => Record<string, unknown>;
};

// Map each Contentstack block UID to the Angular component that renders it plus
// an adapter that converts the CMS payload into that component's @Input() shape.
//
// The `satisfies` clause is the type-safety lock: if a new member is added to
// the PageBlock union, BlockKey expands, and TypeScript will require a matching
// entry here before the build succeeds.
export const BLOCK_REGISTRY = {
  block: {
    component: HeroBlockComponent,
    toInputs: (v: HeroBlock) => ({ block: v })
  },
  faq_section: {
    component: FaqSectionBlockComponent,
    toInputs: (v: FaqSectionBlock) => ({ data: v })
  }
} satisfies { [K in BlockKey]: TypedEntry<K> };

// Resolve a single PageBlock item into the component class + inputs object
// expected by NgComponentOutlet. The `as RuntimeEntry` cast is safe because
// the `satisfies` constraint above already verified correctness per-key.
export function resolveBlock(item: PageBlock): { component: Type<unknown>; inputs: Record<string, unknown> } {
  const key = Object.keys(item)[0] as BlockKey;
  const { component, toInputs } = BLOCK_REGISTRY[key] as RuntimeEntry;
  return { component, inputs: toInputs((item as Record<BlockKey, unknown>)[key]) };
}
