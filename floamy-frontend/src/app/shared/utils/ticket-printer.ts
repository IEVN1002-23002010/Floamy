export interface TicketData {
  folio: string;
  paymentFolio?: string;
  customer: string;
  date: string;
  paymentMethod: string;
  canal: string;
  items: Array<{ name: string; size?: string; qty: number; price: number; toppings?: string[] }>;
  subtotal: number;
  discount?: number;
  total: number;
}

export function printFloamyTicket(ticket: TicketData) {
  const win = window.open('', '_blank', 'width=380,height=640');
  if (!win) return;

  const rows = ticket.items
    .map((i) => {
      const tops = i.toppings?.length ? `<div style="font-size:11px;color:#555;">+ ${i.toppings.join(', ')}</div>` : '';
      return `
        <tr>
          <td style="padding:4px 0;vertical-align:top;">
            <strong>${i.qty}x ${i.name}</strong>${i.size ? ` (${i.size})` : ''}${tops}
          </td>
          <td style="padding:4px 0;text-align:right;vertical-align:top;">
            $${(i.qty * i.price).toFixed(2)}
          </td>
        </tr>`;
    })
    .join('');

  win.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Ticket ${ticket.folio}</title>
      <style>
        body { font-family: 'Courier New', monospace; width: 280px; margin: 0 auto; padding: 16px 8px; color: #111; font-size: 12px; }
        h1 { font-size: 18px; text-align: center; margin: 0; letter-spacing: 1px; }
        .center { text-align: center; }
        .line { border-top: 1px dashed #444; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; }
        .tot { font-size: 15px; font-weight: bold; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <h1>FLOAMY</h1>
      <div class="center">Heladería Artesanal · León, Gto.</div>
      <div class="line"></div>
      <div><strong>Folio:</strong> ${ticket.folio}</div>
      ${ticket.paymentFolio ? `<div><strong>Pago:</strong> ${ticket.paymentFolio}</div>` : ''}
      <div><strong>Fecha:</strong> ${ticket.date}</div>
      <div><strong>Cliente:</strong> ${ticket.customer}</div>
      <div><strong>Canal:</strong> ${ticket.canal} · ${ticket.paymentMethod}</div>
      <div class="line"></div>
      <table>${rows}</table>
      <div class="line"></div>
      <table>
        <tr><td>Subtotal:</td><td style="text-align:right;">$${ticket.subtotal.toFixed(2)}</td></tr>
        ${ticket.discount ? `<tr><td>Descuento:</td><td style="text-align:right;">-$${ticket.discount.toFixed(2)}</td></tr>` : ''}
        <tr class="tot"><td>TOTAL MXN:</td><td style="text-align:right;">$${ticket.total.toFixed(2)}</td></tr>
      </table>
      <div class="line"></div>
      <div class="center" style="margin-top:12px;">¡Gracias por tu preferencia!</div>
      <div class="center" style="margin-top:14px;">
        <button onclick="window.print()" style="padding:8px 16px;cursor:pointer;">Imprimir</button>
      </div>
      <script>window.onload = () => { window.print(); };</script>
    </body>
    </html>
  `);
  win.document.close();
}