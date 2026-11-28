import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CouponsService } from '../../../core/services/coupons.service';
import { Coupon } from '../../../core/models/coupon.model';

function emptyCoupon(): Coupon {
  return { nombre: '', codigo: '', tipo: 'porcentaje', valor: 10, limite: 1, usados: 0, activo: true };
}

@Component({
  standalone: true,
  imports: [FormsModule],
  styles: [`
    :host{display:block;color:#011640}h1{font-size:2rem;font-weight:800}h2{font-size:1.15rem;font-weight:700}
    section{background:white;border:1px solid #aac8e0;border-radius:1rem;padding:1.25rem;margin-top:1rem}
    form{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:1rem;margin-top:1rem}
    label{display:grid;gap:.3rem;font-size:.88rem}input,select{border:1px solid #aac8e0;border-radius:.6rem;padding:.55rem}
    .actions{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap}button{border:1px solid #aac8e0;border-radius:.6rem;padding:.4rem .7rem;cursor:pointer}
    button[type=submit]{background:#011640;color:white}button:disabled{opacity:.55}.list{overflow-x:auto}
    table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:.7rem;border-bottom:1px solid #dff0f7}
  `],
  template: `
    <h1>Cupones</h1>
    <section>
      <h2>{{ draft.id ? 'Editar cupón' : 'Crear cupón' }}</h2>
      <form #form="ngForm" (ngSubmit)="save()">
        <label>Nombre<input name="nombre" [(ngModel)]="draft.nombre" required maxlength="100"></label>
        <label>Código<input name="codigo" [(ngModel)]="draft.codigo" required pattern="[A-Za-z0-9_-]+" maxlength="40"></label>
        <label>Tipo de descuento<select name="tipo" [(ngModel)]="draft.tipo"><option value="porcentaje">Porcentaje</option><option value="pesos">Pesos (MXN)</option></select></label>
        <label>{{ draft.tipo === 'pesos' ? 'Descuento en pesos' : 'Porcentaje de descuento' }}<input name="valor" type="number" required min="0.01" step="0.01" [max]="draft.tipo === 'pesos' ? 99999999.99 : 100" [(ngModel)]="draft.valor"></label>
        <label>Límite total de canjes<input name="limite" type="number" required [min]="draft.usados || 1" step="1" [(ngModel)]="draft.limite"></label>
        <label class="actions"><input type="checkbox" name="activo" [(ngModel)]="draft.activo">Activo</label>
        <div class="actions"><button type="submit" [disabled]="form.invalid || busy()">Guardar</button>
        @if (draft.id) { <button type="button" (click)="reset()">Cancelar edición</button> }</div>
      </form>
    </section>
    <p role="status" aria-live="polite">{{ message() }}</p>
    <section class="list"><table><thead><tr><th>Nombre</th><th>Código</th><th>Descuento</th><th>Canjes</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>@for (item of rows(); track item.id) {
        <tr><td>{{ item.nombre }}</td><td>{{ item.codigo }}</td><td>{{ item.valor }} {{ item.tipo === 'pesos' ? 'MXN' : '%' }}</td>
        <td>{{ item.usados }} de {{ item.limite }}</td><td>{{ !item.activo ? 'Inactivo' : item.usados >= item.limite ? 'Agotado' : 'Activo' }}</td>
        <td><div class="actions"><button [disabled]="busy()" (click)="edit(item)">Editar</button><button [disabled]="busy()" (click)="remove(item)">Eliminar</button></div></td></tr>
      } @empty { <tr><td colspan="6">Sin cupones para mostrar.</td></tr> }</tbody>
    </table></section>
  `
})
export class CouponsComponent {
  private api = inject(CouponsService);
  rows = signal<Coupon[]>([]);
  busy = signal(false);
  message = signal('');
  draft = emptyCoupon();
  constructor() { this.load(); }
  load() {
    this.api.list().subscribe({ next: rows => this.rows.set(rows), error: err => this.message.set(err.error?.error || 'No se pudieron cargar los cupones.') });
  }
  reset() { this.draft = emptyCoupon(); }
  edit(item: Coupon) { this.draft = { ...item }; this.message.set(''); }
  save() { if (!this.busy()) this.perform(this.api.save(this.draft), 'Cupón guardado.'); }
  remove(item: Coupon) {
    if (item.id && confirm('¿Eliminar el cupón ' + item.codigo + '?')) this.perform(this.api.remove(item.id), 'Cupón eliminado.');
  }
  private perform(action: ReturnType<CouponsService['save']>, message: string) {
    this.busy.set(true);
    action.subscribe({
      next: () => { this.busy.set(false); this.reset(); this.message.set(message); this.load(); },
      error: err => { this.busy.set(false); this.message.set(err.error?.error || 'No se pudo completar la operación.'); }
    });
  }
}
