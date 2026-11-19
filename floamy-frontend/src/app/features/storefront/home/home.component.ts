import { Component, OnInit, inject, signal } from '@angular/core';
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
    <main>
      <section class="hero">
        <div class="hero-copy">
          <span class="eyebrow">HELADO ARTESANAL · HECHO HOY</span>
          <h1>Una pausa<br />que se <em>derrite.</em></h1>
          <p>Creamos helado fresco en pequeños lotes, con ingredientes reales y mucha paciencia.</p>
          <div class="hero-actions">
            <a routerLink="/sabores"
               class="text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 inline-flex items-center transition"
               style="text-decoration:none;">
              Explorar sabores →
            </a>
            <button *ngIf="!auth.currentUser()"
                    type="button"
                    (click)="registerModalOpen.set(true)"
                    class="px-5 py-3 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition">
              Crear mi cuenta
            </button>
          </div>
          <div class="hero-proof">
            <div class="faces"><span>AM</span><span>SR</span><span>JL</span></div>
            <div><div class="stars">★★★★★</div><small>Favorito de más de 500 personas</small></div>
          </div>
        </div>
        <div class="hero-image">
          <div class="floe one"></div><div class="floe two"></div>
          <img src="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=1000&q=85" alt="Cono de helado artesanal" />
          <span class="float-card"><span><strong>Listo en 15 min</strong><small>Recoge sin filas</small></span></span>
        </div>
      </section>

      <section class="flavor-intro">
        <span class="eyebrow">NUESTROS FAVORITOS</span>
        <h2>Elige tu mood, nosotros ponemos el helado.</h2>
        <p>Cinco sabores honestos, preparados cada mañana.</p>
      </section>
      <app-catalog [embedded]="true" />

      <section class="promo">
        <div><span>PRIMER PEDIDO</span><strong>10% de descuento</strong><p>Usa el código <b>HOLAFLOAMY</b> al pagar desde la PWA.</p></div>
        <div class="promo-scoops"><i></i><i></i><i></i></div>
      </section>

      <section class="storefront-reviews">
        <div class="reviews-header">
          <div>
            <span class="eyebrow">LO QUE DICEN NUESTROS CLIENTES</span>
            <h2>Historias frescas en cada visita</h2>
          </div>
        </div>

        <div class="reviews-layout">
          <div class="public-reviews-grid">
            <article class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-3" *ngFor="let r of reviews()">
              <div class="flex items-center gap-2.5">
                <span class="avatar">{{ r.cliente_nombre[0] }}</span>
                <div>
                  <strong class="text-sm text-[#011640]">{{ r.cliente_nombre }}</strong>
                  <div class="stars">{{ '★'.repeat(r.calificacion || 5) }}</div>
                </div>
              </div>
              <p class="text-sm text-slate-700">“{{ r.comentario }}”</p>
              <div class="p-3 rounded-xl bg-[#dff0f7]/60 border border-[#aac8e0]/50 text-xs" *ngIf="r.respuesta">
                <strong class="text-[#011640]">Respuesta de Floamy</strong>
                <p class="mt-1 text-slate-700">{{ r.respuesta }}</p>
              </div>
            </article>
          </div>

          <form class="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3" (ngSubmit)="submitReview()">
            <div>
              <span class="eyebrow">TU OPINIÓN CUENTA</span>
              <h3 class="text-xl font-bold text-[#011640]">Déjanos tu comentario</h3>
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Tu nombre</label>
              <input required name="nombre" [(ngModel)]="form.cliente_nombre" placeholder="Ej. Sofía Ramírez"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Calificación</label>
              <div class="star-picker">
                <button type="button" *ngFor="let s of [1,2,3,4,5]"
                        [class.active]="form.calificacion >= s"
                        (click)="form.calificacion = s">★</button>
              </div>
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Tu experiencia</label>
              <textarea required rows="3" name="comentario" [(ngModel)]="form.comentario" placeholder="¿Qué sabor probaste hoy?"
                        class="block p-2.5 w-full text-sm text-[#011640] bg-slate-50 rounded-xl border border-slate-300 focus:ring-[#6da0bf] focus:border-[#6da0bf]"></textarea>
            </div>

            <div *ngIf="sentMsg()" role="alert" class="p-3 text-xs font-semibold text-emerald-800 rounded-xl bg-emerald-50 border border-emerald-200">
              {{ sentMsg() }}
            </div>

            <button type="submit"
                    class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 transition">
              Publicar reseña →
            </button>
          </form>
        </div>
      </section>

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
    this.dashService.getReviews().subscribe((list) => this.reviews.set(list));
  }

  submitReview() {
    if (!this.form.comentario.trim()) return;
    this.dashService.createReview(this.form).subscribe(() => {
      this.form.comentario = '';
      this.form.calificacion = 5;
      this.sentMsg.set('¡Gracias! Tu comentario ya aparece en la página.');
      this.loadReviews();
      setTimeout(() => this.sentMsg.set(''), 4000);
    });
  }
}