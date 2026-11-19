import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="page-heading">
      <div>
        <span class="eyebrow">{{ eyebrow }}</span>
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <button *ngIf="button"
              type="button"
              (click)="action.emit()"
              class="text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 inline-flex items-center gap-2 shadow-sm transition">
        {{ button }}
      </button>
    </div>
  `
})
export class PageTitleComponent {
  @Input() eyebrow = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() button?: string;
  @Output() action = new EventEmitter<void>();
}