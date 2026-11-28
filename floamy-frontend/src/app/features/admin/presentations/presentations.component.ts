import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CatalogOptionsService } from '../../../core/services/catalog-options.service';
import { ProductsService } from '../../../core/services/products.service';
import { PresentationOption } from '../../../core/models/product.model';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { CurrencyMxnPipe } from '../../../shared/pipes/currency-mxn.pipe';

@Component({
  selector: 'app-presentations',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent, ModalComponent, CurrencyMxnPipe],
  template: `
    <app-page-title
      eyebrow="CATÁLOGO"
      title="Tamaños y presentaciones"
      [subtitle]="optionsService.presentations().length + ' presentaciones disponibles'"
      button="+ Nuevo tamaño"
      (action)="openNew()" />

    <div class="relative overflow-x-auto bg-white shadow-sm rounded-2xl border border-slate-200">
      <table class="w-full text-sm text-left text-slate-600">
        <thead class="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" class="px-6 py-3.5">ID</th>
            <th scope="col" class="px-6 py-3.5">Imagen</th>
            <th scope="col" class="px-6 py-3.5">Nombre del tamaño</th>
            <th scope="col" class="px-6 py-3.5">Precio base</th>
            <th scope="col" class="px-6 py-3.5 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr *ngFor="let p of optionsService.presentations()" class="bg-white hover:bg-slate-50/80 transition">
            <td class="px-6 py-4 text-xs text-slate-400">#{{ p.id }}</td>
            <td class="px-6 py-3">
              <div class="w-12 h-12 rounded-xl overflow-hidden bg-[#f7f3e9] border border-slate-200 flex items-center justify-center">
                <img *ngIf="p.imagen_url" [src]="p.imagen_url" [alt]="p.nombre" class="w-full h-full object-cover" />
                <span *ngIf="!p.imagen_url" class="text-[10px] font-semibold text-slate-400">Sin foto</span>
              </div>
            </td>
            <td class="px-6 py-4 font-bold text-[#011640]">{{ p.nombre }}</td>
            <td class="px-6 py-4">
              <span class="bg-[#dff0f7] text-[#011640] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {{ p.precio | currencyMxn }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button type="button"
                        (click)="openEdit(p)"
                        class="px-3 py-1.5 text-xs font-semibold text-[#011640] bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  Editar
                </button>
                <button type="button"
                        (click)="remove(p)"
                        class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <app-modal *ngIf="modalOpen()" [title]="editingId() ? 'Editar tamaño' : 'Agregar tamaño'" (close)="closeModal()">
      <form class="space-y-4" (ngSubmit)="save()">
        <div>
          <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Nombre (ej. Cono doble, Medio litro)</label>
          <input required name="nombre" [(ngModel)]="form.nombre"
                 class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Precio MXN</label>
            <input required type="number" step="0.5" min="1" name="precio" [(ngModel)]="form.precio"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
          <div *ngIf="!editingId()">
            <label class="block mb-1.5 text-xs font-semibold text-[#0b234a]">Stock inicial por sabor</label>
            <input required type="number" min="0" name="stockInicial" [(ngModel)]="form.stockInicial"
                   class="bg-slate-50 border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>
        </div>

        <!-- Selector doble: Subir archivo o Enlace URL -->
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-[#0b234a]">Imagen del tamaño</label>
            <div class="inline-flex rounded-xl bg-white p-0.5 border border-slate-200">
              <button type="button"
                      (click)="switchImageMode('file')"
                      [class]="imageMode() === 'file'
                        ? 'px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#011640] text-white transition'
                        : 'px-2.5 py-1 text-[11px] font-semibold rounded-lg text-slate-600 hover:text-[#011640] transition'">
                Subir archivo
              </button>
              <button type="button"
                      (click)="switchImageMode('url')"
                      [class]="imageMode() === 'url'
                        ? 'px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#011640] text-white transition'
                        : 'px-2.5 py-1 text-[11px] font-semibold rounded-lg text-slate-600 hover:text-[#011640] transition'">
                Enlace URL
              </button>
            </div>
          </div>

          <div *ngIf="imageMode() === 'file'">
            <input type="file"
                   accept="image/png,image/jpeg,image/webp,image/gif"
                   (change)="onFileSelected($event)"
                   class="block w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#dff0f7] file:text-[#011640] hover:file:bg-[#aac8e0]/60 cursor-pointer" />
            <p class="text-[11px] text-slate-400 mt-1">Formatos permitidos: JPG, PNG, WEBP o GIF.</p>
          </div>

          <div *ngIf="imageMode() === 'url'">
            <input type="url"
                   name="imagen_url"
                   [(ngModel)]="form.imagen_url"
                   (ngModelChange)="onUrlChanged($event)"
                   placeholder="https://ejemplo.com/imagen-cono.jpg"
                   class="bg-white border border-slate-300 text-[#011640] text-sm rounded-xl focus:ring-[#6da0bf] focus:border-[#6da0bf] block w-full p-2.5" />
          </div>

          <!-- Vista previa -->
          <div *ngIf="previewUrl()" class="flex items-center gap-3 pt-1">
            <img [src]="previewUrl()!"
                 alt="Vista previa"
                 class="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white" />
            <div class="flex-1 min-w-0">
              <span class="block text-xs font-semibold text-[#011640] truncate">
                {{ selectedFile ? selectedFile.name : 'Imagen vinculada' }}
              </span>
              <button type="button"
                      (click)="clearImage()"
                      class="text-[11px] font-semibold text-red-600 hover:underline mt-0.5">
                Quitar imagen
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button type="button" (click)="closeModal()" class="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2.5 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a]">
            Guardar ✓
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class PresentationsComponent {
  optionsService = inject(CatalogOptionsService);
  private productsService = inject(ProductsService);

  modalOpen = signal(false);
  editingId = signal<number | null>(null);
  imageMode = signal<'file' | 'url'>('file');
  previewUrl = signal<string | null>(null);

  selectedFile: File | null = null;
  private objectUrlToRevoke: string | null = null;

  form = { nombre: '', precio: 55, stockInicial: 0, imagen_url: '' };

  openNew() {
    this.revokeObjectUrl();
    this.editingId.set(null);
    this.selectedFile = null;
    this.imageMode.set('file');
    this.previewUrl.set(null);
    this.form = { nombre: '', precio: 55, stockInicial: 0, imagen_url: '' };
    this.modalOpen.set(true);
  }

  openEdit(p: PresentationOption) {
    this.revokeObjectUrl();
    this.editingId.set(p.id || null);
    this.selectedFile = null;
    const currentUrl = p.imagen_url || '';
    this.imageMode.set(currentUrl ? 'url' : 'file');
    this.previewUrl.set(currentUrl || null);
    this.form = { nombre: p.nombre, precio: p.precio, stockInicial: 0, imagen_url: currentUrl };
    this.modalOpen.set(true);
  }

  switchImageMode(mode: 'file' | 'url') {
    this.imageMode.set(mode);
    if (mode === 'url') {
      this.revokeObjectUrl();
      this.selectedFile = null;
      this.previewUrl.set(this.form.imagen_url.trim() || null);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.revokeObjectUrl();
    this.selectedFile = file;

    if (file) {
      const objUrl = URL.createObjectURL(file);
      this.objectUrlToRevoke = objUrl;
      this.previewUrl.set(objUrl);
    } else {
      this.previewUrl.set(this.form.imagen_url.trim() || null);
    }
  }

  onUrlChanged(url: string) {
    this.previewUrl.set(url.trim() || null);
  }

  clearImage() {
    this.revokeObjectUrl();
    this.selectedFile = null;
    this.form.imagen_url = '';
    this.previewUrl.set(null);
  }

  closeModal() {
    this.revokeObjectUrl();
    this.modalOpen.set(false);
  }

  save() {
    const id = this.editingId();
    const payload = {
      nombre: this.form.nombre,
      precio: this.form.precio,
      stockInicial: this.form.stockInicial,
      imagen_url: this.form.imagen_url.trim() || null,
      imagen_file: this.selectedFile
    };

    const req$ = id
      ? this.optionsService.updatePresentation(id, payload)
      : this.optionsService.createPresentation(payload);

    req$.subscribe({
      next: () => {
        this.closeModal();
        this.productsService.loadProducts().subscribe();
      },
      error: (err) => alert(err?.error?.error || 'No se pudo guardar el tamaño.')
    });
  }

  remove(p: PresentationOption) {
    if (!p.id) return;
    if (!confirm(`¿Eliminar el tamaño "${p.nombre}" de todos los sabores?`)) return;
    this.optionsService.deletePresentation(p.id).subscribe(() => {
      this.productsService.loadProducts().subscribe();
    });
  }

  private revokeObjectUrl() {
    if (this.objectUrlToRevoke) {
      URL.revokeObjectURL(this.objectUrlToRevoke);
      this.objectUrlToRevoke = null;
    }
  }
}