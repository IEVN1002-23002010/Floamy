import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { DashboardService } from '../../../core/services/dashboard.service';
import { PageTitleComponent } from '../../../shared/components/page-title/page-title.component';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, PageTitleComponent],
  template: `
    <app-page-title eyebrow="EXPERIENCIA" title="Reseñas y respuestas" subtitle="Lee las opiniones de tus clientes y publica respuestas oficiales." />

    <div class="reviews-list">
      <div class="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col gap-3" *ngFor="let r of reviews()">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-2.5 flex-1">
            <span class="avatar">{{ r.cliente_nombre[0] }}</span>
            <div>
              <strong class="text-sm text-[#011640]">{{ r.cliente_nombre }}</strong>
              <div class="stars">{{ '★'.repeat(r.calificacion || 5) }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <small class="text-slate-400 text-[11px]">{{ r.fecha }}</small>
            <button type="button" (click)="deleteReview(r)" class="px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition">
              Eliminar
            </button>
          </div>
        </div>

        <p class="text-sm text-slate-700">“{{ r.comentario }}”</p>

        <div class="p-3 rounded-xl bg-[#dff0f7]/60 border border-[#aac8e0]/50 text-xs" *ngIf="r.respuesta && editingId() !== r.id">
          <strong class="text-[#011640]">Respuesta publicada:</strong>
          <p class="mt-1 text-slate-700">{{ r.respuesta }}</p>
          <button type="button" class="mt-2 font-semibold text-[#6da0bf] hover:underline" (click)="startReply(r)">
            Editar respuesta
          </button>
        </div>

        <div class="flex flex-col gap-2" *ngIf="!r.respuesta || editingId() === r.id">
          <textarea rows="2"
                    [(ngModel)]="drafts[r.id]"
                    placeholder="Escribe una respuesta para el cliente..."
                    class="block p-2.5 w-full text-xs text-[#011640] bg-slate-50 rounded-xl border border-slate-300 focus:ring-[#6da0bf] focus:border-[#6da0bf]"></textarea>
          <div class="flex gap-2 justify-end">
            <button *ngIf="editingId() === r.id" type="button" (click)="editingId.set(null)" class="px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100">
              Cancelar
            </button>
            <button type="button" (click)="sendReply(r)" class="px-4 py-2 text-xs font-semibold text-white bg-[#011640] rounded-xl hover:bg-[#0b234a] focus:ring-4 focus:ring-[#6da0bf]/40">
              Publicar respuesta
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReviewsComponent implements OnInit {
  private dashService = inject(DashboardService);
  reviews = signal<any[]>([]);
  editingId = signal<number | null>(null);
  drafts: Record<number, string> = {};

  ngOnInit() { this.load(); }

  load() {
    this.dashService.getReviews().subscribe((list) => {
      this.reviews.set(list);
      this.editingId.set(null);
      this.drafts = {};
    });
  }

  startReply(r: any) {
    this.drafts[r.id] = r.respuesta || '';
    this.editingId.set(r.id);
  }

  sendReply(r: any) {
    const text = (this.drafts[r.id] || '').trim();
    if (!text) return;
    this.dashService.replyReview(r.id, text).subscribe(() => this.load());
  }

  deleteReview(r: any) {
    if (!r.id) return;
    if (!confirm(`¿Eliminar la reseña de "${r.cliente_nombre}"?`)) return;
    this.dashService.deleteReview(r.id).subscribe(() => this.load());
  }
}