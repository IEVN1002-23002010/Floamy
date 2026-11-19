import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
         [attr.fill]="filled ? 'currentColor' : 'none'"
         stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <ng-content />
    </svg>
  `
})
export class IconComponent {
  @Input() size = 19;
  @Input() filled = false;
}