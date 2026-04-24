export interface PublishDetails {
  environment: string;
  locale: string;
  time: string;
  user: string;
}

export interface File {
  uid: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  content_type: string;
  file_size: string;
  tags: string[];
  filename: string;
  url: string;
  ACL: any[];
  is_dir: boolean;
  parent_uid: string;
  _version: number;
  title: string;
  publish_details: PublishDetails;
  $: any;
}

export interface Page {
  uid: string;
  $: any;
  _version?: number;
  title: string;
  url?: string;
  description?: string;
  image?: File | null;
  rich_text?: string;
}

export interface Faq {
  uid: string;
  _version?: number;
  title: string; // the question
  answer: string;
  display_order: number;
}

export interface FaqSection {
  uid: string;
  _version?: number;
  title: string; // heading
  subtitle?: string;
  faqs: Faq[]; // resolved via .includeReference(...)
}

// Each entry in page.blocks is an object with exactly ONE variant key.
// That key identifies which block variant the editor chose in the CMS.
export type HeroBlock = {
  title?: string;
  copy?: string;
  image?: File | null;
  layout?: 'image_left' | 'image_right';
};

export type FaqSectionBlock = {
  section: FaqSection[]; // Contentstack returns reference fields as arrays
};

export type PageBlock = { block: HeroBlock } | { faq_section: FaqSectionBlock };

// BlockKey is derived from PageBlock so adding a new union member automatically
// expands the key set — the registry's `satisfies` clause will then require a
// matching entry or the build fails.
export type BlockKey = keyof { [K in PageBlock as keyof K]: unknown };

// Extracts the payload type for a given block key from the discriminated union.
export type PayloadFor<K extends BlockKey> = Extract<PageBlock, Record<K, unknown>>[K];

export interface PageWithBlocks extends Page {
  blocks?: PageBlock[];
}
