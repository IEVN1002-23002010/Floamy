import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ClientsService } from '../../../core/services/clients.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent],
  template: `
    <app-page-title eyebrow="COMUNIDAD" title="Gestión de clientes" subtitle="Conoce a quienes vuelven por otra cucharada." button="+ Nuevo cliente" (action)="openModal()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">Cliente</th>
            <th scope="col" class="px-6 py-3.5">Correo</th>
            <th scope="col" class="px-6 py-3.5">Teléfono</th>
            <th scope="col" class="px-6 py-3.5">Consumo</th>
            <th scope="col" class="px-6 py-3.5">Nivel</th>
            <th scope="col" class="px-6 py-3.5">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let c of clients()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 font-semibold text-[#011640]">
              <div class="flex items-center gap-2.5">
                <span class="avatar">{{ (c.name || c.nombre || 'C')[0] }}</span>
                <span>{{ c.name || c.nombre }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-xs">{{ c.email || c.correo }}</td>
            <td class="px-6 py-4 text-xs">{{ c.phone || c.telefono || '—' }}</td>
            <td class="px-6 py-4 font-bold text-[#011640]">\${{ Number(c.spent ?? c.gastado ?? 0).toFixed(2) }}</td>
            <td class="px-6 py-4">
              <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ c.tier || c.nivel || 'Nuevo' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <button type="button" (click)="removeClient(c)" class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                Quitar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="adding()" eyebrow="REGISTRO" title="Registrar cliente" (close)="adding.set(false)">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre completo</label>
          <input required name="name" [(ngModel)]="form.name" placeholder="Ej. Sofía Ramírez"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Correo electrónico</label>
          <input required type="email" name="email" [(ngModel)]="form.email" placeholder="cliente@correo.com"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Teléfono</label>
          <input name="phone" [(ngModel)]="form.phone" placeholder="4771234567"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div *ngIf="error()" role="alert" class="p-3 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-200">
          {{ error() }}
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="adding.set(false)" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" [disabled]="saving()" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] disabled:opacity-50">
            {{ saving() ? 'Guardando...' : 'Guardar ✓' }}
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class ClientsComponent implements OnInit {
  private clientsService = inject(ClientsService);
  protected Number = Number;

  clients = signal<any[]>([]);
  adding = signal(false);
  saving = signal(false);
  error = signal('');

  form = { name: '', email: '', phone: '' };

  ngOnInit() { this.load(); }

  load() {
    this.clientsService.getClients().subscribe((list) => this.clients.set(list));
  }

  openModal() {
    this.error.set('');
    this.form = { name: '', email: '', phone: '' };
    this.adding.set(true);
  }

  save() {
    if (!this.form.name.trim() || !this.form.email.trim()) {
      this.error.set('Completa nombre y correo.');
      return;
    }

    this.error.set('');
    this.saving.set(true);

    const payload = {
      name: this.form.name.trim(),
      nombre: this.form.name.trim(),
      email: this.form.email.trim(),
      correo: this.form.email.trim(),
      phone: this.form.phone.trim(),
      telefono: this.form.phone.trim()
    };

    this.clientsService.createClient(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.adding.set(false);
        this.load();
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(err?.error?.error || 'No se pudo guardar el cliente.');
      }
    });
  }

  removeClient(c: any) {
    if (!c.id) return;
    if (!confirm(`¿Eliminar a "${c.name || c.nombre}"?`)) return;
    this.clientsService.deleteClient(c.id).subscribe(() => this.load());
  }
}