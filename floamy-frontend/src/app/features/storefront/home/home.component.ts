import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardService } from '../../../core/services/dashboard.service';
import { CatalogComponent } from '../catalog/catalog.component';
import { CustomerAuthModalComponent } from '../../auth/customer-auth-modal/customer-auth-modal.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule, NgFor, NgIf, CatalogComponent, CustomerAuthModalComponent],
  template: `
    <main class="bg-[#F7F3E9] text-[#011640] overflow-x-clip">
      
      <!-- 1. HERO SECTION -->
      <section class="relative bg-gradient-to-b from-[#F7F3E9] via-[#F7F3E9] to-[#DFF0F7]/50 pt-8 pb-16 lg:py-20">
        <div class="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div class="lg:col-span-6 space-y-6">
            <span class="inline-block px-3.5 py-1.5 rounded-full bg-[#DFF0F7] text-[#011640] text-[11px] font-bold tracking-widest uppercase border border-[#AAC8E0]/60">
              HELADO ARTESANAL · HECHO HOY
            </span>
            <h1 class="text-5xl sm:text-6xl font-extrabold tracking-tight text-[#011640] leading-[1.08]">
              Una pausa<br />que se <em class="font-serif italic text-[#6DA0BF]">derrite.</em>
            </h1>
            <p class="text-base sm:text-lg text-[#011640]/80 max-w-md leading-relaxed">
              Creamos helado fresco en pequeños lotes, combinando cremosidad artesanal y finas capas crujientes de hielo.
            </p>
            
            <div class="flex flex-wrap items-center gap-3.5 pt-2">
              <a routerLink="/sabores"
                 class="text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6DA0BF]/40 font-semibold rounded-xl text-xs px-6 py-3.5 inline-flex items-center transition shadow-md shadow-[#011640]/15"
                 style="text-decoration:none;">
                Explorar sabores →
              </a>
              <button *ngIf="!auth.currentUser()"
                      type="button"
                      (click)="registerModalOpen.set(true)"
                      class="px-6 py-3.5 text-xs font-semibold text-[#011640] bg-white/90 border border-[#AAC8E0] rounded-xl hover:bg-[#DFF0F7]/60 transition">
                Crear mi cuenta
              </button>
            </div>

            <div class="flex items-center gap-4 pt-4 border-t border-[#AAC8E0]/40 max-w-sm">
              <div class="flex -space-x-2">
                <span class="w-8 h-8 rounded-full bg-[#011640] text-[#F7F3E9] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#F7F3E9]">AM</span>
                <span class="w-8 h-8 rounded-full bg-[#6DA0BF] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#F7F3E9]">SR</span>
                <span class="w-8 h-8 rounded-full bg-[#AAC8E0] text-[#011640] text-[10px] font-bold flex items-center justify-center ring-2 ring-[#F7F3E9]">JL</span>
              </div>
              <div>
                <div class="text-amber-500 text-xs tracking-wider">★★★★★</div>
                <small class="text-xs text-[#011640]/70 font-medium">Favorito de más de 500 personas</small>
              </div>
            </div>
          </div>

          <div class="lg:col-span-6 hero-image relative flex justify-center">
            <div class="floe one"></div>
            <div class="floe two"></div>
            <img src="front.jpeg" alt="Cono de helado artesanal" class="relative z-10 max-w-full h-auto" />
            <span class="float-card z-20">
              <span>
                <strong>Listo en 15 min</strong>
                <small>Recoge sin filas</small>
              </span>
            </span>
          </div>

        </div>
      </section>

      <!-- 2. SECCIÓN INMERSIVA: LA TEXTURA FLOE -->
      <section class="relative py-24 bg-cover bg-center bg-fixed"
               style="background-image: url('https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=1600&q=80');">
        <div class="absolute inset-0 bg-gradient-to-r from-[#011640]/95 via-[#011640]/85 to-[#6DA0BF]/75"></div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center text-[#F7F3E9]">
          <div class="lg:col-span-7 space-y-5">
            <span class="inline-block px-3.5 py-1 rounded-full bg-[#6DA0BF]/30 border border-[#AAC8E0]/40 text-[#DFF0F7] text-[11px] font-bold tracking-widest uppercase">
              CREAMY + FLOE
            </span>
            <h2 class="text-3xl sm:text-5xl font-extrabold leading-tight">
              Cremosidad artesanal con<br />
              <span class="text-[#AAC8E0]">finas capas de hielo crujiente.</span>
            </h2>
            <p class="text-sm sm:text-base text-[#DFF0F7]/90 max-w-xl leading-relaxed">
              Nuestro nombre nace de unir <em>Creamy</em> y <em>Floe</em>. Preparamos cada helado desde cero a la vista con fruta real, logrando una textura sedosa y refrescante única en cada cucharada.
            </p>
            <div class="pt-3 flex flex-wrap gap-8">
              <div>
                <span class="block text-3xl font-extrabold text-[#F7F3E9]">100%</span>
                <span class="text-xs text-[#AAC8E0]">Natural y con fruta real</span>
              </div>
              <div>
                <span class="block text-3xl font-extrabold text-[#F7F3E9]">Al momento</span>
                <span class="text-xs text-[#AAC8E0]">Preparación a la vista</span>
              </div>
              <div>
                <span class="block text-3xl font-extrabold text-[#F7F3E9]">0%</span>
                <span class="text-xs text-[#AAC8E0]">Saborizantes artificiales</span>
              </div>
            </div>
          </div>

          <div class="lg:col-span-5">
            <div class="p-6 rounded-3xl bg-[#F7F3E9]/10 backdrop-blur-md border border-[#AAC8E0]/30 space-y-4 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80" 
                   alt="Helado artesanal Floamy" 
                   class="w-full h-56 object-cover rounded-2xl shadow-lg" />
              <div class="flex items-center justify-between text-xs text-[#DFF0F7]">
                <span class="font-semibold">Sucursal Floamy · Recoge en barra</span>
                <span class="px-2.5 py-1 rounded-lg bg-[#011640] text-[#F7F3E9]">Listo en 15 min</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. CATÁLOGO DE SABORES FAVORITOS -->
      <section class="relative py-20 bg-gradient-to-b from-[#AAC8E0]/55 via-[#DFF0F7] to-[#AAC8E0]/40 overflow-x-clip">
        
        <div class="absolute inset-0 opacity-[0.28] pointer-events-none"
             style="background-image: radial-gradient(#6DA0BF 1.4px, transparent 1.4px); background-size: 24px 24px;">
        </div>

        <div class="absolute -top-24 -left-24 w-[30rem] h-[30rem] rounded-full bg-[#6DA0BF]/30 blur-3xl pointer-events-none"></div>
        <div class="absolute top-1/4 -right-28 w-[34rem] h-[34rem] rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-12 left-1/3 w-[26rem] h-[26rem] rounded-full bg-[#011640]/10 blur-3xl pointer-events-none"></div>

        <!-- Ilustraciones lineales -->
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

        <div class="relative z-10 max-w-7xl mx-auto px-6">
          <div class="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div class="space-y-2">
              <span class="inline-block px-3.5 py-1 rounded-full bg-[#011640] text-[#F7F3E9] text-[10px] font-bold tracking-widest uppercase shadow-xs">
                ARMA TU PEDIDO
              </span>
              <h2 class="text-3xl sm:text-4xl font-extrabold text-[#011640]">
                Elige tu mood, nosotros ponemos el helado.
              </h2>
            </div>
            <p class="text-sm text-[#011640]/85 max-w-sm font-medium">
              Selecciona tu tamaño, sabor natural y toppings artesanales para recoger sin filas.
            </p>
          </div>
          
          <app-catalog [embedded]="true" />
        </div>
      </section>

      <!-- 4. NUESTRAS 3 PRESENTACIONES REALES + CUPÓN -->
      <section class="relative py-24 bg-cover bg-center"
               style="background-image: url('https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1600&q=80');">
        <div class="absolute inset-0 bg-gradient-to-br from-[#011640]/95 via-[#0b2859]/90 to-[#6DA0BF]/80"></div>

        <div class="relative z-10 max-w-7xl mx-auto px-6 space-y-10">
          <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 text-[#F7F3E9]">
            <div class="space-y-2">
              <span class="inline-block px-3.5 py-1 rounded-full bg-[#F7F3E9]/15 border border-[#AAC8E0]/30 text-[#DFF0F7] text-[10px] font-bold tracking-widest uppercase">
                NUESTRAS PRESENTACIONES
              </span>
              <h2 class="text-3xl sm:text-4xl font-extrabold">Tres tamaños, un mismo sabor artesanal</h2>
            </div>
            <p class="text-sm text-[#DFF0F7]/85 max-w-md">
              Desde un antojo rápido al caminar hasta un litro completo para compartir en casa.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <!-- 1. Cono -->
            <div class="group p-4 rounded-3xl bg-[#F7F3E9]/10 backdrop-blur-md border border-[#AAC8E0]/30 text-[#F7F3E9] flex flex-col justify-between space-y-4 hover:bg-[#F7F3E9]/15 transition">
              <div class="space-y-3">
                <div class="h-44 rounded-2xl overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1516559828984-fb3b99548b21?auto=format&fit=crop&w=600&q=80" 
                       alt="Cono de helado artesanal" 
                       class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#011640]/90 text-xs font-extrabold text-[#F7F3E9]">
                    $35
                  </span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#AAC8E0]">CLÁSICO CRUJIENTE</span>
                  <h3 class="text-lg font-bold text-white">Cono</h3>
                  <p class="text-xs text-[#DFF0F7]/80 mt-1 leading-relaxed">
                    Barquillo crujiente servido al momento con tu sabor favorito y los toppings que elijas.
                  </p>
                </div>
              </div>
              <a routerLink="/sabores" class="text-xs font-bold text-[#AAC8E0] group-hover:text-white transition inline-flex items-center gap-1" style="text-decoration:none;">
                Elegir Cono →
              </a>
            </div>

            <!-- 2. Vaso 8 oz -->
            <div class="group p-4 rounded-3xl bg-[#F7F3E9]/10 backdrop-blur-md border border-[#AAC8E0]/30 text-[#F7F3E9] flex flex-col justify-between space-y-4 hover:bg-[#F7F3E9]/15 transition">
              <div class="space-y-3">
                <div class="h-44 rounded-2xl overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80" 
                       alt="Vaso 8 oz de helado artesanal" 
                       class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#011640]/90 text-xs font-extrabold text-[#F7F3E9]">
                    $45
                  </span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#AAC8E0]">PORCIÓN IDEAL</span>
                  <h3 class="text-lg font-bold text-white">Vaso 8 oz</h3>
                  <p class="text-xs text-[#DFF0F7]/80 mt-1 leading-relaxed">
                    La medida perfecta para disfrutar con cuchara nuestra textura cremosa y capas de hielo.
                  </p>
                </div>
              </div>
              <a routerLink="/sabores" class="text-xs font-bold text-[#AAC8E0] group-hover:text-white transition inline-flex items-center gap-1" style="text-decoration:none;">
                Elegir Vaso 8 oz →
              </a>
            </div>

            <!-- 3. Litro -->
            <div class="group p-4 rounded-3xl bg-[#F7F3E9]/10 backdrop-blur-md border border-[#AAC8E0]/30 text-[#F7F3E9] flex flex-col justify-between space-y-4 hover:bg-[#F7F3E9]/15 transition">
              <div class="space-y-3">
                <div class="h-44 rounded-2xl overflow-hidden relative">
                  <img src="https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=600&q=80" 
                       alt="Litro de helado artesanal" 
                       class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <span class="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-[#011640]/90 text-xs font-extrabold text-[#F7F3E9]">
                    $150
                  </span>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-wider text-[#AAC8E0]">PARA COMPARTIR</span>
                  <h3 class="text-lg font-bold text-white">Litro</h3>
                  <p class="text-xs text-[#DFF0F7]/80 mt-1 leading-relaxed">
                    Empacado al momento para conservar toda su frescura intacta y disfrutar en casa.
                  </p>
                </div>
              </div>
              <a routerLink="/sabores" class="text-xs font-bold text-[#AAC8E0] group-hover:text-white transition inline-flex items-center gap-1" style="text-decoration:none;">
                Elegir Litro →
              </a>
            </div>

            <!-- 4. Tarjeta de Cupón -->
            <div class="p-5 rounded-3xl bg-gradient-to-b from-[#6DA0BF]/40 to-[#011640]/80 backdrop-blur-md border border-[#AAC8E0]/50 text-[#F7F3E9] flex flex-col justify-between space-y-5">
              <div class="space-y-2.5">
                <span class="inline-block px-3 py-1 rounded-full bg-[#F7F3E9] text-[#011640] text-[10px] font-extrabold tracking-widest uppercase">
                  BENEFICIO APP · 10% OFF
                </span>
                <h3 class="text-xl font-extrabold leading-snug">
                  Tu primer helado va con descuento usn
                </h3>
                <p class="text-xs text-[#DFF0F7]/90 leading-relaxed">
                  Ordena desde la PWA, recoge sin filas en 15 min y aplica tu cupón de bienvenida.
                </p>
              </div>

              <div class="space-y-2.5">
                <div class="p-3 rounded-xl bg-[#011640]/75 border border-[#AAC8E0]/30 flex items-center justify-between">
                  <span class="text-[11px] text-[#AAC8E0]">Código:</span>
                  <strong class="font-mono text-xs tracking-wider text-white">HOLAFLOAMY</strong>
                </div>
                <a routerLink="/sabores"
                   class="w-full py-3 rounded-xl bg-[#F7F3E9] text-[#011640] font-bold text-xs flex items-center justify-center hover:bg-[#DFF0F7] transition shadow-lg"
                   style="text-decoration:none;">
                  Armar mi helado →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. RECOLECCIÓN Y PREGUNTAS FRECUENTES -->
      <section id="recoleccion" class="relative isolate overflow-hidden pt-20 sm:pt-24 pb-6 sm:pb-8 bg-[#F7F3E9]">
        <div class="relative z-10 max-w-7xl mx-auto px-6">
          <div class="max-w-2xl mb-10 sm:mb-12">
            <span class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#DFF0F7] border border-[#AAC8E0]/70 text-[#011640] text-[10px] font-extrabold tracking-[0.18em] uppercase">
              <span class="w-1.5 h-1.5 rounded-full bg-[#6DA0BF]"></span>
              COMPRA Y RECOLECCIÓN
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#011640]">
              Tu momento Floamy,<br class="hidden sm:block" /> sin complicaciones.
            </h2>
            <p class="mt-3 text-sm sm:text-base text-[#011640]/70 leading-relaxed max-w-xl">
              Pide en línea, consulta el avance y pasa por tu helado recién preparado.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <!-- Tarjeta destacada: modalidad de compra -->
            <article class="lg:col-span-5 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#011640] via-[#0b2859] to-[#315d83] p-6 sm:p-8 text-[#F7F3E9] shadow-xl shadow-[#011640]/15">
              <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[24px] border-white/5"></div>
              <div class="absolute right-7 top-24 h-3 w-3 rounded-full bg-[#AAC8E0]/70"></div>
              <div class="absolute right-16 top-16 h-2 w-2 rounded-full bg-[#DFF0F7]/70"></div>

              <div class="relative">
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center gap-2 rounded-full border border-[#AAC8E0]/35 bg-white/10 px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase text-[#DFF0F7]">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" stroke="currentColor" stroke-width="1.8" />
                      <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="1.8" />
                    </svg>
                    Solo recolección
                  </span>
                  <span class="text-xs font-semibold text-[#AAC8E0]">Floamy</span>
                </div>

                <h3 class="mt-6 text-2xl sm:text-3xl font-extrabold leading-tight">
                  Hecho al momento.<br /><span class="text-[#AAC8E0]">Listo para ti.</span>
                </h3>
                <p class="mt-3 text-sm leading-relaxed text-[#DFF0F7]/85">
                  Por ahora no contamos con entrega a domicilio. Tus pedidos se recogen en sucursal y el tiempo estimado de preparación es de 15 minutos.
                </p>

                <div class="mt-7 space-y-4">
                  <div class="flex gap-3.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-xs font-extrabold text-[#011640]">1</span>
                    <div class="pt-0.5">
                      <strong class="block text-sm font-bold text-white">Arma tu pedido</strong>
                      <span class="mt-0.5 block text-xs leading-relaxed text-[#DFF0F7]/75">Elige tamaño, sabor y toppings desde la página.</span>
                    </div>
                  </div>
                  <div class="flex gap-3.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-xs font-extrabold text-[#011640]">2</span>
                    <div class="pt-0.5">
                      <strong class="block text-sm font-bold text-white">Revisa el estado</strong>
                      <span class="mt-0.5 block text-xs leading-relaxed text-[#DFF0F7]/75">Consulta el avance y guarda el folio en “Mi pedido”.</span>
                    </div>
                  </div>
                  <div class="flex gap-3.5">
                    <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-xs font-extrabold text-[#011640]">3</span>
                    <div class="pt-0.5">
                      <strong class="block text-sm font-bold text-white">Pasa por tu helado</strong>
                      <span class="mt-0.5 block text-xs leading-relaxed text-[#DFF0F7]/75">Cuando esté listo, presenta tu folio en la sucursal.</span>
                    </div>
                  </div>
                </div>

                <div class="mt-7 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-4">
                  <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AAC8E0]/20 text-[#DFF0F7]">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8" />
                      <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span>
                    <strong class="block text-sm font-extrabold text-white">Aproximadamente 15 min</strong>
                    <small class="mt-0.5 block text-[11px] text-[#DFF0F7]/75">El tiempo puede variar según la demanda.</small>
                  </span>
                </div>
              </div>
            </article>

            <!-- Preguntas frecuentes -->
            <div class="lg:col-span-7 rounded-[2rem] border border-[#AAC8E0]/70 bg-white/85 p-5 sm:p-7 lg:p-8 shadow-lg shadow-[#011640]/5 backdrop-blur-sm">
              <div class="mb-5 sm:mb-6">
                <span class="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#6DA0BF]">TE AYUDAMOS</span>
                <h3 class="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-[#011640]">Preguntas frecuentes</h3>
              </div>

              <div class="space-y-3">
                <details class="group overflow-hidden rounded-2xl border border-[#AAC8E0]/65 bg-[#F7F3E9]/65 open:border-[#6DA0BF]/70 open:bg-white transition-colors">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 text-sm font-bold text-[#011640]">
                    ¿Hacen entregas a domicilio?
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-lg font-medium text-[#011640] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#011640]/70">
                    Por el momento no. Todos los pedidos se recogen en nuestra sucursal.
                  </p>
                </details>

                <details class="group overflow-hidden rounded-2xl border border-[#AAC8E0]/65 bg-[#F7F3E9]/65 open:border-[#6DA0BF]/70 open:bg-white transition-colors">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 text-sm font-bold text-[#011640]">
                    ¿Cuánto tarda en estar listo?
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-lg font-medium text-[#011640] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#011640]/70">
                    El tiempo estimado es de 15 minutos. Puede variar según la demanda; revisa el estado de tu pedido antes de venir.
                  </p>
                </details>

                <details class="group overflow-hidden rounded-2xl border border-[#AAC8E0]/65 bg-[#F7F3E9]/65 open:border-[#6DA0BF]/70 open:bg-white transition-colors">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 text-sm font-bold text-[#011640]">
                    ¿Qué formas de pago aceptan?
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-lg font-medium text-[#011640] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#011640]/70">
                    Puedes pagar en efectivo al recoger o con tarjeta de débito o crédito en línea.
                  </p>
                </details>

                <details class="group overflow-hidden rounded-2xl border border-[#AAC8E0]/65 bg-[#F7F3E9]/65 open:border-[#6DA0BF]/70 open:bg-white transition-colors">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 text-sm font-bold text-[#011640]">
                    ¿Puedo cambiar o cancelar mi pedido?
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-lg font-medium text-[#011640] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#011640]/70">
                    Solicita cualquier cambio o cancelación lo antes posible. Podemos realizarlo mientras el pedido aún no haya comenzado a prepararse; una vez en preparación, no podemos garantizar cambios ni cancelaciones porque elaboramos los productos al momento.
                  </p>
                </details>

                <details class="group overflow-hidden rounded-2xl border border-[#AAC8E0]/65 bg-[#F7F3E9]/65 open:border-[#6DA0BF]/70 open:bg-white transition-colors">
                  <summary class="flex cursor-pointer list-none items-center justify-between gap-4 p-4 sm:p-5 text-sm font-bold text-[#011640]">
                    ¿Qué hago si recibo un pedido incorrecto?
                    <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DFF0F7] text-lg font-medium text-[#011640] transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs leading-relaxed text-[#011640]/70">
                    Muéstranos tu folio al recoger y cuéntanos qué ocurrió para que podamos revisar el caso.
                  </p>
                </details>
              </div>

              <div class="mt-5 flex gap-3 rounded-2xl border border-[#AAC8E0]/60 bg-[#DFF0F7]/70 p-4">
                <span class="mt-0.5 text-[#6DA0BF]" aria-hidden="true">✦</span>
                <p class="text-[11px] leading-relaxed text-[#011640]/75">
                  <strong class="text-[#011640]">Cambios y cancelaciones:</strong> las solicitudes dependen de que el pedido aún no haya comenzado a prepararse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. SECCIÓN DE RESEÑAS SIMÉTRICA Y ORDENADA -->
      <section class="relative pt-8 sm:pt-10 pb-20 bg-[#F7F3E9]">
        <div class="max-w-7xl mx-auto px-6 space-y-8">
          
          <!-- Encabezado alineado -->
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/80 backdrop-blur-xs p-6 sm:p-8 rounded-3xl border border-[#AAC8E0]/60 shadow-xs">
            <div class="space-y-1.5">
              <span class="inline-block px-3 py-1 rounded-full bg-[#DFF0F7] text-[#011640] text-[10px] font-bold tracking-widest uppercase">
                RESEÑAS VERIFICADAS
              </span>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-[#011640]">
                Lo que opinan nuestros clientes
              </h2>
            </div>

            <div class="flex flex-wrap items-center gap-4">
              <!-- Calificación promedio -->
              <div class="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#F7F3E9] border border-[#AAC8E0]/50">
                <span class="text-2xl font-extrabold text-[#011640]">{{ avgRating() }}</span>
                <div class="leading-tight">
                  <div class="text-amber-500 text-xs">★★★★★</div>
                  <span class="text-[11px] text-[#011640]/70 font-medium">{{ reviews().length }} opiniones</span>
                </div>
              </div>

              <!-- Botón modal -->
              <button type="button"
                      (click)="reviewModalOpen.set(true)"
                      class="px-5 py-3 rounded-2xl bg-[#011640] text-[#F7F3E9] hover:bg-[#0b2859] text-xs font-bold transition shadow-sm cursor-pointer">
                + Escribir reseña
              </button>
            </div>
          </div>

          <!-- Aviso de confirmación -->
          <div *ngIf="sentMsg()" role="alert"
               class="p-3.5 text-xs font-bold text-[#011640] rounded-2xl bg-[#DFF0F7] border border-[#6DA0BF] text-center">
            {{ sentMsg() }}
          </div>

          <!-- Cuadrícula fija de 3 columnas con altura uniforme -->
          <div *ngIf="visibleReviews().length > 0"
               class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            <article *ngFor="let r of visibleReviews()"
                     class="h-56 bg-white rounded-3xl p-6 border border-[#AAC8E0]/60 shadow-xs flex flex-col justify-between">
              
              <!-- Fila superior: Autor y estrellas -->
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 min-w-0">
                  <div class="w-9 h-9 rounded-full bg-[#011640] text-[#F7F3E9] font-bold text-xs flex items-center justify-center shrink-0">
                    {{ r.cliente_nombre ? r.cliente_nombre[0].toUpperCase() : 'F' }}
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-sm font-bold text-[#011640] truncate">{{ r.cliente_nombre }}</h3>
                    <div class="text-amber-500 text-xs leading-none mt-0.5">{{ '★'.repeat(r.calificacion || 5) }}</div>
                  </div>
                </div>
                <span class="text-xs font-bold text-[#6DA0BF] bg-[#DFF0F7]/70 px-2.5 py-1 rounded-lg shrink-0">
                  {{ r.calificacion || 5 }}.0
                </span>
              </div>

              <!-- Centro: Comentario acotado a 3 líneas máximo -->
              <p class="text-sm text-[#011640]/85 leading-relaxed line-clamp-3 my-auto">
                “{{ r.comentario }}”
              </p>

              <!-- Pie fijo: Respuesta de Floamy o etiqueta limpia -->
              <div class="pt-3 border-t border-[#F7F3E9] text-xs truncate">
                <ng-container *ngIf="r.respuesta; else sinRespuesta">
                  <span class="font-bold text-[#011640]">Floamy: </span>
                  <span class="text-[#011640]/70">{{ r.respuesta }}</span>
                </ng-container>
                <ng-template #sinRespuesta>
                  <span class="text-[#6DA0BF] font-medium">✓ Experiencia en sucursal</span>
                </ng-template>
              </div>

            </article>
          </div>

          <!-- Paginación limpia (solo si hay más de 3 reseñas) -->
          <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-3 pt-2">
            <button type="button"
                    (click)="prevPage()"
                    [disabled]="currentPage() === 0"
                    class="px-4 py-2 rounded-xl bg-white border border-[#AAC8E0] text-xs font-bold text-[#011640] disabled:opacity-40 hover:bg-[#DFF0F7] transition cursor-pointer">
              ← Anterior
            </button>
            <span class="text-xs font-semibold text-[#011640]/70">
              Página {{ currentPage() + 1 }} de {{ totalPages() }}
            </span>
            <button type="button"
                    (click)="nextPage()"
                    [disabled]="currentPage() >= totalPages() - 1"
                    class="px-4 py-2 rounded-xl bg-white border border-[#AAC8E0] text-xs font-bold text-[#011640] disabled:opacity-40 hover:bg-[#DFF0F7] transition cursor-pointer">
              Siguiente →
            </button>
          </div>

          <!-- Estado vacío -->
          <div *ngIf="reviews().length === 0"
               class="py-12 px-6 rounded-3xl bg-white/70 border border-dashed border-[#AAC8E0] text-center space-y-1">
            <p class="text-sm font-bold text-[#011640]">Aún no hay reseñas</p>
            <p class="text-xs text-[#011640]/70">Sé el primero en compartir tu opinión.</p>
          </div>

        </div>
      </section>

      <!-- MODAL LIMPIO PARA DEJAR RESEÑA -->
      <div *ngIf="reviewModalOpen()"
           role="dialog"
           aria-modal="true"
           class="fixed inset-0 z-50 flex items-center justify-center bg-[#011640]/60 backdrop-blur-xs p-4">
        <form (ngSubmit)="submitReview()"
              class="w-full max-w-md bg-[#F7F3E9] rounded-3xl shadow-2xl border border-[#AAC8E0] p-6 sm:p-7 space-y-4">
          
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[10px] font-bold tracking-widest uppercase text-[#6DA0BF]">TU OPINIÓN CUENTA</span>
              <h3 class="text-xl font-extrabold text-[#011640]">Déjanos tu reseña</h3>
            </div>
            <button type="button"
                    (click)="reviewModalOpen.set(false)"
                    class="w-8 h-8 rounded-xl bg-white border border-[#AAC8E0] text-[#011640] text-xs font-bold hover:bg-[#DFF0F7]">
              ✕
            </button>
          </div>

          <div>
            <label class="block mb-1 text-xs font-bold text-[#011640]">Tu nombre</label>
            <input required name="nombre" [(ngModel)]="form.cliente_nombre" placeholder="Ej. Sofía Ramírez"
                   class="w-full px-3.5 py-2.5 text-sm bg-white border border-[#AAC8E0] rounded-xl text-[#011640] focus:ring-[#6DA0BF] focus:border-[#6DA0BF]" />
          </div>

          <div>
            <label class="block mb-1 text-xs font-bold text-[#011640]">Calificación</label>
            <div class="flex gap-1.5">
              <button type="button" *ngFor="let s of [1,2,3,4,5]"
                      class="text-2xl leading-none transition transform hover:scale-110"
                      [class.text-amber-400]="form.calificacion >= s"
                      [class.text-[#AAC8E0]/50]="form.calificacion < s"
                      (click)="form.calificacion = s">★</button>
            </div>
          </div>

          <div>
            <label class="block mb-1 text-xs font-bold text-[#011640]">Tu experiencia</label>
            <textarea required rows="3" name="comentario" [(ngModel)]="form.comentario"
                      placeholder="¿Qué sabor probaste hoy?"
                      class="w-full p-3 text-sm bg-white border border-[#AAC8E0] rounded-xl text-[#011640] focus:ring-[#6DA0BF] focus:border-[#6DA0BF] resize-none"></textarea>
          </div>

          <div class="flex gap-2.5 pt-1">
            <button type="button"
                    (click)="reviewModalOpen.set(false)"
                    class="flex-1 py-3 rounded-xl bg-white border border-[#AAC8E0] text-[#011640] font-bold text-xs hover:bg-[#DFF0F7]/50 transition">
              Cancelar
            </button>
            <button type="submit"
                    class="flex-1 py-3 rounded-xl bg-[#011640] text-[#F7F3E9] font-bold text-xs hover:bg-[#0b2859] transition shadow-md">
              Publicar reseña →
            </button>
          </div>
        </form>
      </div>

      <app-customer-auth-modal *ngIf="registerModalOpen()" initialMode="register" (close)="registerModalOpen.set(false)" />
    </main>
  `
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  private dashService = inject(DashboardService);

  reviews = signal<any[]>([]);
  sentMsg = signal('');
  registerModalOpen = signal(false);
  reviewModalOpen = signal(false);
  currentPage = signal(0);
  readonly pageSize = 3;

  avgRating = computed(() => {
    const list = this.reviews();
    if (!list.length) return '5.0';
    const total = list.reduce((acc, item) => acc + (Number(item.calificacion) || 5), 0);
    return (total / list.length).toFixed(1);
  });

  totalPages = computed(() => Math.ceil(this.reviews().length / this.pageSize));

  visibleReviews = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.reviews().slice(start, start + this.pageSize);
  });

  form = {
    cliente_nombre: '',
    calificacion: 5,
    comentario: ''
  };

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) this.form.cliente_nombre = user.nombre;
    this.loadReviews();
  }

  loadReviews() {
    this.dashService.getReviews().subscribe((list) => {
      this.reviews.set(list);
      this.currentPage.set(0);
    });
  }

  prevPage() {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  submitReview() {
    if (!this.form.comentario.trim()) return;
    this.dashService.createReview(this.form).subscribe(() => {
      this.form.comentario = '';
      this.form.calificacion = 5;
      this.reviewModalOpen.set(false);
      this.sentMsg.set('¡Gracias! Tu comentario ya está publicado.');
      this.loadReviews();
      setTimeout(() => this.sentMsg.set(''), 4000);
    });
  }
}