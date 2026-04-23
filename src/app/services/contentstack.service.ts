import { Injectable } from '@angular/core';
import * as contentstack from '@contentstack/delivery-sdk';
import { QueryOperation, Region } from '@contentstack/delivery-sdk';
import ContentstackLivePreview, { IStackSdk } from '@contentstack/live-preview-utils';
import { Observable, from } from 'rxjs';
import type { Faq, Page, PageWithBlocks } from '../../../types';
import { environment } from '../../environments/environment';

type Stack = ReturnType<typeof contentstack.default.stack>;

@Injectable({ providedIn: 'root' })
export class ContentstackService {
  private readonly stack: Stack;

  constructor() {
    const { contentstack: config } = environment;

    this.stack = contentstack.default.stack({
      apiKey: config.apiKey,
      deliveryToken: config.deliveryToken,
      environment: config.environment,
      region: config.region as Region,
      host: config.contentDelivery,
      live_preview: {
        enable: true,
        preview_token: config.previewToken,
        host: config.previewHost
      }
    });

    if (config.preview) {
      ContentstackLivePreview.init({
        ssr: false,
        enable: true,
        mode: 'builder',
        stackSdk: (this.stack as Stack).config as IStackSdk,
        stackDetails: {
          apiKey: config.apiKey,
          environment: config.environment,
          branch: 'main'
        },
        clientUrlParams: {
          host: config.applicationHost
        },
        editButton: {
          enable: true,
          exclude: ['outsideLivePreviewPortal']
        }
      });
    }
  }

  getEntryByUrl(contentType: string, url: string): Observable<any> {
    const { contentstack: config } = environment;

    return from(
      this.stack
        .contentType(contentType)
        .entry()
        .query()
        .where('url', QueryOperation.EQUALS, url)
        .find<Page>()
        .then((result: any) => {
          if (config.preview) {
            contentstack.default.Utils.addEditableTags(result.entries[0], contentType, true);
          }

          return result.entries[0];
        })
    );
  }

  getFaqs(): Observable<Faq[]> {
    return from(
      this.stack
        .contentType('faq')
        .entry()
        .query()
        .orderByAscending('display_order')
        .find<Faq>()
        .then((result: any) => result.entries as Faq[])
    );
  }

  getPageWithBlocks(url: string): Observable<PageWithBlocks | null> {
    return from(
      this.stack
        .contentType('page')
        .entry()
        .includeReference([
          'blocks.faq_section.section',
          'blocks.faq_section.section.faqs'
        ])
        .query()
        .where('url', QueryOperation.EQUALS, url)
        .find<PageWithBlocks>()
        .then((result: any) => (result.entries[0] ?? null) as PageWithBlocks | null)
    );
  }
}
