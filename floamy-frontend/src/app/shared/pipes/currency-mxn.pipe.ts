import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyMxn', standalone: true })
export class CurrencyMxnPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const num = Number(value || 0);
    return `$${num.toFixed(2)}`;
  }
}