import { Component, inject, OnInit, signal } from '@angular/core';
import ContentstackLivePreview from '@contentstack/live-preview-utils';
import { ContentstackService } from '../../services/contentstack.service';

@Component({
  selector: 'app-other',
  standalone: true,
  imports: [],
  templateUrl: './other.component.html'
})
export class OtherComponent implements OnInit {
  private readonly contentstackService = inject(ContentstackService);

  readonly page = signal<any>(null);
  readonly error = signal<string>('');

  getContent() {
    this.contentstackService.getEntryByUrl('page', '/other/page/here').subscribe({
      next: result => {
        this.page.set(result);
      },
      error: err => {
        this.error.set('Error loading content. Please check your Contentstack configuration.');
        console.error('Contentstack error:', err);
      }
    });
  }

  ngOnInit() {
    ContentstackLivePreview.onEntryChange(() => {
      this.getContent();
    });

    // Load initial content
    this.getContent();
  }
}
