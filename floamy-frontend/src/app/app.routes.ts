import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { StorefrontLayoutComponent } from './features/storefront/layout/storefront-layout.component';
import { HomeComponent } from './features/storefront/home/home.component';
import { CatalogComponent } from './features/storefront/catalog/catalog.component';
import { CheckoutComponent } from './features/storefront/checkout/checkout.component';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { PosComponent } from './features/admin/pos/pos.component';
import { OrdersComponent } from './features/admin/orders/orders.component';
import { CashRegisterComponent } from './features/admin/cash-register/cash-register.component';
import { ProductsComponent } from './features/admin/products/products.component';
import { PresentationsComponent } from './features/admin/presentations/presentations.component';
import { ToppingsComponent } from './features/admin/toppings/toppings.component';
import { InventoryComponent } from './features/admin/inventory/inventory.component';
import { MovementsComponent } from './features/admin/movements/movements.component';
import { SuppliersComponent } from './features/admin/suppliers/suppliers.component';
import { ClientsComponent } from './features/admin/clients/clients.component';
import { UsersComponent } from './features/admin/users/users.component';
import { RolesComponent } from './features/admin/roles/roles.component';
import { ReviewsComponent } from './features/admin/reviews/reviews.component';

const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  return user && user.rol !== 'Cliente' ? true : router.createUrlTree(['/login']);
};

export const routes: Routes = [
  {
    path: '',
    component: StorefrontLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'sabores', component: CatalogComponent },
      { path: 'pedido', component: CheckoutComponent },
      { path: 'checkout', component: CheckoutComponent },
      { path: 'carrito', component: CheckoutComponent }
    ]
  },
  { path: 'login', component: AdminLoginComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'resumen', pathMatch: 'full' },
      { path: 'resumen', component: DashboardComponent },
      { path: 'pos', component: PosComponent },
      { path: 'pedidos', component: OrdersComponent },
      { path: 'corte-caja', component: CashRegisterComponent },
      { path: 'productos', component: ProductsComponent },
      { path: 'tamanos', component: PresentationsComponent },
      { path: 'toppings', component: ToppingsComponent },
      { path: 'inventario', component: InventoryComponent },
      { path: 'movimientos', component: MovementsComponent },
      { path: 'proveedores', component: SuppliersComponent },
      { path: 'clientes', component: ClientsComponent },
      { path: 'usuarios', component: UsersComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'resenas', component: ReviewsComponent },
      { path: 'reseñas', redirectTo: 'resenas', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];