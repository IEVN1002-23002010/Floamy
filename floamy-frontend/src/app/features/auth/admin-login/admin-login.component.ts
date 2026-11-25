import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf, LogoComponent],
  template: `
    <div class="login-page">
      <!-- Panel izquierdo con degradado, puntos e ilustraciones -->
      <div class="login-visual relative overflow-hidden bg-gradient-to-br from-[#011640] via-[#072152] to-[#0e3470]"
           style="justify-content: flex-start; gap: 54px;">
        <div class="absolute inset-0 opacity-[0.14] pointer-events-none"
             style="background-image: radial-gradient(#AAC8E0 1.3px, transparent 1.3px); background-size: 24px 24px;">
        </div>
        <div class="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>
        <div class="absolute bottom-16 -left-20 w-72 h-72 rounded-full bg-[#6DA0BF]/20 blur-3xl pointer-events-none"></div>

        <!-- Ilustraciones lineales sobre el panel azul -->
        <svg class="hidden sm:block absolute top-14 right-8 w-36 h-36 text-[#DFF0F7]/10 pointer-events-none rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M60 18c-3-7 3-12 9-10" />
          <circle cx="60" cy="24" r="6" />
          <path d="M36 52a24 24 0 0 1 48 0" />
          <path d="M32 68a18 18 0 0 1 28-14 18 18 0 0 1 28 14" />
          <path d="M26 70h68l-8 26a12 12 0 0 1-11 8H45a12 12 0 0 1-11-8l-8-26Z" />
          <path d="M48 104h24l4 8H44l4-8Z" />
        </svg>

        <svg class="hidden sm:block absolute bottom-20 right-12 w-32 h-32 text-[#DFF0F7]/10 pointer-events-none -rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M38 54a22 22 0 0 1 44 0" />
          <path d="M32 64c0-8 8-12 15-9 6-5 20-5 26 0 7-3 15 1 15 9" />
          <path d="M36 66l24 44 24-44Z" />
          <path d="M47 78l16 16M67 74l-18 18" />
        </svg>

        <app-logo [light]="true" style="position: relative; z-index: 2;" />
        <div style="position: relative; z-index: 2;">
          <span class="eyebrow">FRESCURA QUE FLUYE</span>
          <h1>Todo tu negocio,<br />en una sola <em>capa.</em></h1>
          <p>Ventas, producción y clientes en perfecta sincronía.</p>
        </div>
        <div class="ice-layers"><i></i><i></i><i></i></div>
      </div>

      <!-- Zona derecha con degradado, trama y decoraciones -->
      <div class="login-form relative overflow-hidden bg-gradient-to-b from-[#AAC8E0]/45 via-[#DFF0F7]/90 to-[#F7F3E9]">
        <div class="absolute inset-0 opacity-[0.28] pointer-events-none"
             style="background-image: radial-gradient(#6DA0BF 1.4px, transparent 1.4px); background-size: 24px 24px;">
        </div>
        <div class="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[#6DA0BF]/25 blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-20 w-80 h-80 rounded-full bg-[#AAC8E0]/45 blur-3xl pointer-events-none"></div>

        <svg class="hidden md:block absolute top-10 left-8 w-28 h-28 text-[#011640]/10 pointer-events-none -rotate-12" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M42 24a18 18 0 0 1 36 0v44a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V24Z" />
          <path d="M52 30v26M68 30v26" />
          <path d="M55 74v26a5 5 0 0 0 10 0V74" />
        </svg>

        <svg class="hidden md:block absolute bottom-10 right-8 w-32 h-32 text-[#011640]/10 pointer-events-none rotate-6" viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M74 18l14-8M74 18l-10 34" />
          <path d="M36 52c4-12 16-18 24-14 10-4 22 2 24 14" />
          <path d="M30 54h60l-7 42a8 8 0 0 1-8 7H45a8 8 0 0 1-8-7l-7-42Z" />
          <path d="M34 72c10 5 18-5 26 0s16 5 26 0" />
        </svg>

        <form class="login-box relative z-10 space-y-4 bg-white/95 backdrop-blur-md border border-[#AAC8E0]/80 shadow-xl shadow-[#011640]/10" (ngSubmit)="submit()">
          <app-logo />
          <div>
            <span class="eyebrow">BIENVENIDA DE VUELTA</span>
            <h2>Ingresa a Floamy</h2>
            <p>Usa tus credenciales para continuar.</p>
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Correo electrónico</label>
            <input type="email"
                   name="correo"
                   [(ngModel)]="correo"
                   required
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>

          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Contraseña</label>
            <div class="relative flex items-center">
              <input [type]="showPass() ? 'text' : 'password'"
                     name="password"
                     [(ngModel)]="password"
                     required
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5 pr-16" />
              <button type="button"
                      (click)="showPass.set(!showPass())"
                      class="absolute right-2.5 text-xs font-semibold text-[#6da0bf] hover:text-[#011640]">
                {{ showPass() ? 'Ocultar' : 'Ver' }}
              </button>
            </div>
          </div>

          <button type="button" class="forgot" (click)="forgotSent.set(true)">Olvidé mi contraseña</button>

          <div *ngIf="forgotSent()" role="alert" class="p-3 text-xs font-semibold text-sky-900 rounded-xl bg-[#dff0f7] border border-[#aac8e0]">
            Se envió un enlace de recuperación a tu correo registrado.
          </div>

          <div *ngIf="errorMsg()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
            {{ errorMsg() }}
          </div>

          <button type="submit"
                  class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 transition">
            Ingresar →
          </button>

          <a routerLink="/"
             class="w-full inline-flex justify-center items-center px-5 py-3 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
             style="text-decoration: none;">
            Volver a la tienda
          </a>

          <small class="block text-center text-slate-400">Acceso seguro para personal autorizado</small>
        </form>
      </div>
    </div>
  `
})
export class AdminLoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  correo = 'andrea@floamy.mx';
  password = 'floamy2025';
  showPass = signal(false);
  forgotSent = signal(false);
  errorMsg = signal('');

  submit() {
    this.errorMsg.set('');
    this.auth.login(this.correo, this.password, 'admin').subscribe({
      next: () => this.router.navigate(['/admin']),
      error: (err) => this.errorMsg.set(err.error?.error || 'Error al iniciar sesión')
    });
  }
}