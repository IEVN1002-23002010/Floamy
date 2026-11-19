import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div tabindex="-1"
         role="dialog"
         aria-modal="true"
         (mousedown)="close.emit()"
         class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-950/50 backdrop-blur-xs p-4">
      <div (mousedown)="$event.stopPropagation()" class="relative w-full max-w-md max-h-full">
        <div class="relative bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div class="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <span class="eyebrow">{{ eyebrow }}</span>
              <h2 class="text-xl font-bold text-[#011640] mt-0.5">{{ title }}</h2>
            </div>
            <button type="button"
                    (click)="close.emit()"
                    aria-label="Cerrar modal"
                    class="text-slate-400 bg-transparent hover:bg-slate-100 hover:text-[#011640] rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center transition">
              <svg class="w-3.5 h-3.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
              </svg>
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() eyebrow = 'REGISTRO';
  @Input() title = '';
  @Output() close = new EventEmitter<void>();
}