import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { permissionGuard } from './core/guards/role.guard';
import { StorefrontLayoutComponent } from './features/storefront/layout/storefront-layout.component';
import { HomeComponent } from './features/storefront/home/home.component';
import { CatalogComponent } from './features/storefront/catalog/catalog.component';
import { CheckoutComponent } from './features/storefront/checkout/checkout.component';
import { AdminLoginComponent } from './features/auth/admin-login/admin-login.component';
import { AdminLayoutComponent } from './features/admin/layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { CouponsComponent } from './features/admin/coupons/coupons.component';
import { MarketingComponent } from './features/admin/marketing/marketing.component';
import { PosComponent } from './features/admin/pos/pos.component';
import { OrdersComponent } from './features/admin/orders/orders.component';
import { CashRegisterComponent } from './features/admin/cash-register/cash-register.component';
import { ProductsComponent } from './features/admin/products/products.component';
import { PresentationsComponent } from './features/admin/presentations/presentations.component';
import { ToppingsComponent } from './features/admin/toppings/toppings.component';
import { InventoryComponent } from './features/admin/inventory/inventory.component';
import { PurchaseOrdersComponent } from './features/admin/purchase-orders/purchase-orders.component';
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
  const isClient = (user?.rol || '').trim().toLowerCase() === 'cliente';
  return user && !isClient ? true : router.createUrlTree(['/login']);
};

const adminHomeRedirectGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return router.createUrlTree([auth.getDefaultAdminRoute()]);
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
      { path: '', canActivate: [adminHomeRedirectGuard], children: [] },
      { path: 'resumen', component: DashboardComponent, canActivate: [permissionGuard('dashboard')] },
      { path: 'cupones', component: CouponsComponent, canActivate: [permissionGuard('coupons')] },
      { path: 'marketing', component: MarketingComponent, canActivate: [permissionGuard('marketing')] },
      { path: 'pos', component: PosComponent, canActivate: [permissionGuard('pos')] },
      { path: 'pedidos', component: OrdersComponent, canActivate: [permissionGuard('orders')] },
      { path: 'corte-caja', component: CashRegisterComponent, canActivate: [permissionGuard('cash_register')] },
      { path: 'productos', component: ProductsComponent, canActivate: [permissionGuard('products')] },
      { path: 'tamanos', component: PresentationsComponent, canActivate: [permissionGuard('catalog_options')] },
      { path: 'toppings', component: ToppingsComponent, canActivate: [permissionGuard('catalog_options')] },
      { path: 'inventario', component: InventoryComponent, canActivate: [permissionGuard('inventory')] },
      { path: 'compras', component: PurchaseOrdersComponent, canActivate: [permissionGuard('purchases')] },
      { path: 'movimientos', component: MovementsComponent, canActivate: [permissionGuard('movements')] },
      { path: 'proveedores', component: SuppliersComponent, canActivate: [permissionGuard('suppliers')] },
      { path: 'clientes', component: ClientsComponent, canActivate: [permissionGuard('clients')] },
      { path: 'usuarios', component: UsersComponent, canActivate: [permissionGuard('users')] },
      { path: 'roles', component: RolesComponent, canActivate: [permissionGuard('roles')] },
      { path: 'resenas', component: ReviewsComponent, canActivate: [permissionGuard('reviews')] },
      { path: 'reseñas', redirectTo: 'resenas', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '' }
];