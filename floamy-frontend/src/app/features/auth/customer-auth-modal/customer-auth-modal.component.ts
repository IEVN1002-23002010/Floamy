import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-customer-auth-modal',
  standalone: true,
  imports: [FormsModule, NgIf, LogoComponent],
  template: `
    <div tabindex="-1"
         role="dialog"
         aria-modal="true"
         (click)="close.emit()"
         class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-950/50 backdrop-blur-xs p-4">
      <div (click)="$event.stopPropagation()" class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div class="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <app-logo />
              <h2 class="text-xl font-bold text-[#011640] mt-2">
                {{ mode() === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta' }}
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                {{ mode() === 'login' ? 'Ingresa para acumular pedidos y guardar tus favoritos.' : 'Regístrate para pedir más rápido desde la PWA.' }}
              </p>
            </div>
            <button type="button"
                    (click)="close.emit()"
                    aria-label="Cerrar"
                    class="text-slate-400 bg-transparent hover:bg-slate-100 hover:text-[#011640] rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition">
              ✕
            </button>
          </div>

          <form class="space-y-3.5" (ngSubmit)="submit()">
            <div *ngIf="mode() === 'register'">
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Nombre completo</label>
              <input required name="nombre" [(ngModel)]="form.nombre" placeholder="Ej. Sofía Ramírez"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Correo electrónico</label>
              <input required type="email" name="correo" [(ngModel)]="form.correo" placeholder="tu@correo.com"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>

            <div *ngIf="mode() === 'register'">
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Teléfono (opcional)</label>
              <input name="telefono" [(ngModel)]="form.telefono" placeholder="477 123 4567"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>

            <div>
              <label class="block mb-1 text-xs font-semibold text-[#0b234a]">Contraseña</label>
              <input required type="password" name="password" [(ngModel)]="form.password" placeholder="••••••••"
                     class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
            </div>

            <div *ngIf="error()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
              {{ error() }}
            </div>

            <button type="submit"
                    [disabled]="loading()"
                    class="w-full text-white bg-[#011640] hover:bg-[#0b234a] focus:ring-4 focus:outline-none focus:ring-[#6da0bf]/40 font-semibold rounded-xl text-xs px-5 py-3 disabled:opacity-50 transition">
              {{ loading() ? 'Procesando...' : (mode() === 'login' ? 'Iniciar sesión →' : 'Crear mi cuenta →') }}
            </button>
          </form>

          <button type="button"
                  (click)="toggleMode()"
                  class="w-full mt-4 text-center text-xs text-slate-500 hover:text-[#011640] transition">
            {{ mode() === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes cuenta?' }}
            <span class="font-bold text-[#011640] underline ml-1">
              {{ mode() === 'login' ? 'Regístrate aquí' : 'Inicia sesión' }}
            </span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CustomerAuthModalComponent implements OnInit {
  @Input() initialMode: 'login' | 'register' = 'login';
  @Output() close = new EventEmitter<void>();

  private auth = inject(AuthService);
  mode = signal<'login' | 'register'>('login');
  loading = signal(false);
  error = signal('');

  form = {
    nombre: '',
    correo: '',
    telefono: '',
    password: ''
  };

  ngOnInit() {
    this.mode.set(this.initialMode);
  }

  toggleMode() {
    this.error.set('');
    this.mode.update((m) => (m === 'login' ? 'register' : 'login'));
  }

  submit() {
    this.error.set('');
    this.loading.set(true);

    const request$ = this.mode() === 'login'
      ? this.auth.login(this.form.correo, this.form.password)
      : this.auth.registerClient(this.form);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.close.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'Error de conexión con el servidor');
      }
    });
  }
}