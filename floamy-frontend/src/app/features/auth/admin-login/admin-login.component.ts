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
      <div class="login-visual" style="justify-content: flex-start; gap: 54px;">
        <app-logo [light]="true" />
        <div style="position: relative; z-index: 2;">
          <span class="eyebrow">FRESCURA QUE FLUYE</span>
          <h1>Todo tu negocio,<br />en una sola <em>capa.</em></h1>
          <p>Ventas, producción y clientes en perfecta sincronía.</p>
        </div>
        <div class="ice-layers"><i></i><i></i><i></i></div>
      </div>

      <div class="login-form">
        <form class="login-box space-y-4" (ngSubmit)="submit()">
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