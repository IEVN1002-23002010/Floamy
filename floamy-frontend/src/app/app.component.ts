import { Component, OnInit, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { initFlowbite } from 'flowbite';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private http = inject(HttpClient);

  ngOnInit() {
    initFlowbite();
    this.trackStoreVisit(this.router.url);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        setTimeout(() => initFlowbite(), 0);
        this.trackStoreVisit(event.urlAfterRedirects || event.url || '/');
      });
  }

  private trackStoreVisit(url: string) {
    if (url.startsWith('/admin') || url.startsWith('/acceso-equipo')) return;
    if (sessionStorage.getItem('floamy_visit_tracked')) return;

    const sessionToken = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('floamy_visit_tracked', sessionToken);

    this.http.post(`${environment.apiUrl}/dashboard/visit`, {
      session_token: sessionToken,
      ruta: url,
      canal: 'PWA'
    }).subscribe({ error: () => {} });
  }
}