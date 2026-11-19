import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo" [class.logo-light]="light">
      <img [src]="light ? '/floamy-logo-light.png' : '/floamy-logo-dark.png'" alt="Floamy" />
    </div>
  `
})
export class LogoComponent {
  @Input() light = false;
}