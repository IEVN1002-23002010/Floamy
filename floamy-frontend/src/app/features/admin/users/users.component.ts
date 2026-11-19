import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { UsersService } from '../../../core/services/users.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  template: `
    <app-page-title eyebrow="EQUIPO" title="Usuarios internos" subtitle="Altas, bajas y roles del personal de Floamy." button="+ Invitar usuario" (action)="adding.set(true)" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">Nombre</th>
            <th scope="col" class="px-6 py-3.5">Correo</th>
            <th scope="col" class="px-6 py-3.5">Rol</th>
            <th scope="col" class="px-6 py-3.5">Estado</th>
            <th scope="col" class="px-6 py-3.5 text-right">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let u of users()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 font-semibold text-[#011640]">{{ u.nombre }}</td>
            <td class="px-6 py-4 text-xs">{{ u.correo }}</td>
            <td class="px-6 py-4">
              <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">{{ u.rol }}</span>
            </td>
            <td class="px-6 py-4">
              <span *ngIf="!isInactive(u)" class="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Activo
              </span>
              <span *ngIf="isInactive(u)" class="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Inactivo
              </span>
            </td>
            <td class="px-6 py-4 text-right">
              <button type="button"
                      (click)="toggle(u.id)"
                      class="px-3.5 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-300 rounded-full hover:bg-[#dff0f7] hover:border-[#011640] focus:ring-2 focus:ring-[#6da0bf] transition">
                {{ getActionText(u) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="adding()" title="Invitar usuario" (close)="adding.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre completo</label>
          <input required name="name" [(ngModel)]="form.name"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Correo institucional</label>
          <input required type="email" name="email" [(ngModel)]="form.email"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Rol</label>
          <select name="role" [(ngModel)]="form.role"
                  class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5">
            <option value="Administrador">Administrador</option>
            <option value="Empleado">Empleado</option>
            <option value="Cocina">Cocina</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="adding.set(false)" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] focus:ring-4 focus:ring-[#6da0bf]/40">
            Invitar ✓
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class UsersComponent implements OnInit {
  private usersService = inject(UsersService);
  users = signal<any[]>([]);
  adding = signal(false);
  form = { name: '', email: '', role: 'Empleado' };

  ngOnInit() { this.load(); }
  load() { this.usersService.getUsers().subscribe((list) => this.users.set(list)); }

  isInactive(u: any): boolean {
    const val = String(u.estado ?? u.activo ?? '').trim().toLowerCase();
    return val === 'inactivo' || val === 'baja' || val === '0' || val === 'false';
  }

  getActionText(u: any): string {
    return this.isInactive(u) ? 'Activar' : 'Desactivar';
  }

  toggle(id: number) {
    this.usersService.toggleUser(id).subscribe(() => this.load());
  }

  save() {
    this.usersService.createUser(this.form).subscribe(() => {
      this.adding.set(false);
      this.load();
    });
  }
}