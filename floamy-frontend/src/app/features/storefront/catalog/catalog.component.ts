import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { IceCreamBuilderComponent } from '../builder/ice-cream-builder.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgIf, IceCreamBuilderComponent],
  template: `
    <ng-container *ngIf="embedded; else fullPageTpl">
      <app-ice-cream-builder />
    </ng-container>

    <ng-template #fullPageTpl>
      <main class="relative min-h-screen pt-10 pb-16 bg-gradient-to-b from-[#AAC8E0]/55 via-[#DFF0F7] to-[#AAC8E0]/40 overflow-x-clip">
        
        <!-- Trama de puntos -->
        <div class="absolute inset-0 opacity-[0.28] pointer-events-none"
             style="background-image: radial-gradient(#6DA0BF 1.4px, transparent 1.4px); background-size: 24px 24px;">
        </div>

        <!-- Esferas difuminadas -->
        <div class="absolute -top-24 -left-24 w-[30rem] h-[30rem] rounded-full bg-[#6DA0BF]/30 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/4 -right-28 w-[34rem] h-[34rem] rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-12 left-1/3 w-[26rem] h-[26rem] rounded-full bg-[#011640]/10 blur-3xl pointer-events-none"></div>

        <!-- Ilustraciones lineales decorativas -->
        <svg class="hidden md:block absolute top-10 right-8 xl:right-14 w-44 h-44 text-[#011640]/12 pointer-events-none rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M60 18c-3-7 3-12 9-10" />
          <circle cx="60" cy="24" r="6" />
          <path d="M36 52a24 24 0 0 1 48 0" />
          <path d="M32 68a18 18 0 0 1 28-14 18 18 0 0 1 28 14" />
          <path d="M26 70h68l-8 26a12 12 0 0 1-11 8H45a12 12 0 0 1-11-8l-8-26Z" />
          <path d="M48 104h24l4 8H44l4-8Z" />
        </svg>

        <svg class="hidden lg:block absolute top-28 left-6 xl:left-12 w-40 h-40 text-[#011640]/12 pointer-events-none -rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M38 54a22 22 0 0 1 44 0" />
          <path d="M32 64c0-8 8-12 15-9 6-5 20-5 26 0 7-3 15 1 15 9" />
          <path d="M36 66l24 44 24-44Z" />
          <path d="M47 78l16 16M67 74l-18 18" />
        </svg>

        <svg class="hidden xl:block absolute top-1/2 -translate-y-1/2 right-8 w-36 h-36 text-[#011640]/12 pointer-events-none rotate-[18deg]" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M42 24a18 18 0 0 1 36 0v44a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V24Z" />
          <path d="M52 30v26M68 30v26" />
          <path d="M55 74v26a5 5 0 0 0 10 0V74" />
        </svg>

        <svg class="hidden lg:block absolute bottom-16 left-8 xl:left-14 w-40 h-40 text-[#011640]/12 pointer-events-none rotate-6" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M74 18l14-8M74 18l-10 34" />
          <path d="M36 52c4-12 16-18 24-14 10-4 22 2 24 14" />
          <path d="M30 54h60l-7 42a8 8 0 0 1-8 7H45a8 8 0 0 1-8-7l-7-42Z" />
          <path d="M34 72c10 5 18-5 26 0s16 5 26 0" />
        </svg>

        <svg class="hidden md:block absolute bottom-14 right-14 w-32 h-32 text-[#011640]/12 pointer-events-none -rotate-6" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M45 22v24M33 34h24" />
          <path d="M82 48v32M66 64h32" />
          <path d="M42 78v18M33 87h18" />
          <circle cx="72" cy="30" r="3" />
          <circle cx="28" cy="60" r="3" />
        </svg>

        <!-- Contenido centrado -->
        <div class="relative z-10 max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div class="space-y-2">
              <span class="inline-block px-3.5 py-1 rounded-full bg-[#011640] text-[#F7F3E9] text-[10px] font-bold tracking-widest uppercase shadow-xs">
                ARMA TU PEDIDO
              </span>
              <h1 class="text-3xl sm:text-4xl font-extrabold text-[#011640]">
                Elige tu mood, nosotros ponemos el helado.
              </h1>
            </div>
            <p class="text-sm text-[#011640]/85 max-w-sm font-medium">
              Selecciona tu tamaño, sabor natural y toppings artesanales para recoger sin filas.
            </p>
          </div>

          <app-ice-cream-builder />
        </div>
      </main>
    </ng-template>
  `
})
export class CatalogComponent {
  @Input() embedded = false;
}