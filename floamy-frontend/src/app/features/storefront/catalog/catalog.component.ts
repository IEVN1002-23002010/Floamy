import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { IceCreamBuilderComponent } from '../builder/ice-cream-builder.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgIf, PageTitleComponent, IceCreamBuilderComponent],
  template: `
    <main [class.catalog-page]="!embedded">
      <div *ngIf="!embedded" style="padding: 0 6vw;">
        <app-page-title
          eyebrow="PERSONALIZA TU HELADO"
          title="Arma tu helado"
          subtitle="Selecciona el tamaño, tu sabor favorito y los toppings que quieras." />
      </div>

      <app-ice-cream-builder />
    </main>
  `
})
export class CatalogComponent {
  @Input() embedded = false;
}