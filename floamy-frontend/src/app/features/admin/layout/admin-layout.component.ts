import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LogoComponent } from '../../../shared/components/logo/logo.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, LogoComponent],
  styles: [`
    .sidebar-scroll::-webkit-scrollbar {
      width: 5px;
    }
    .sidebar-scroll::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb {
      background: rgba(109, 160, 191, 0.25);
      border-radius: 9999px;
    }
    .sidebar-scroll::-webkit-scrollbar-thumb:hover {
      background: rgba(109, 160, 191, 0.45);
    }
  `],
  template: `
    <div class="min-h-screen flex bg-[#f7f3e9] text-[#011640]">
      <!-- Backdrop móvil -->
      <div *ngIf="sidebarOpen()"
           (click)="sidebarOpen.set(false)"
           class="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-xs lg:hidden"></div>

      <!-- Sidebar -->
      <aside [class]="sidebarOpen()
               ? 'fixed inset-y-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-[#011640] via-[#041b4b] to-[#011132] text-white border-r border-white/10 flex flex-col justify-between transition-transform duration-200 translate-x-0 lg:sticky lg:top-0 lg:translate-x-0 shrink-0 select-none'
               : 'fixed inset-y-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-[#011640] via-[#041b4b] to-[#011132] text-white border-r border-white/10 flex flex-col justify-between transition-transform duration-200 -translate-x-full lg:sticky lg:top-0 lg:translate-x-0 shrink-0 select-none'">

        <!-- Cabecera fija: Logo y sucursal -->
        <div class="px-4 pt-5 pb-4 border-b border-white/10 shrink-0">
          <div class="flex items-center justify-between px-1 mb-4">
            <a [routerLink]="auth.getDefaultAdminRoute()" style="text-decoration:none;">
              <app-logo [light]="true" />
            </a>
            <button type="button"
                    (click)="sidebarOpen.set(false)"
                    class="lg:hidden text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition">
              ✕
            </button>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-2xl bg-white/[0.06] border border-white/10 shadow-inner">
            <span class="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7dd3fc] to-[#568eb2] text-[#011640] font-extrabold text-xs grid place-items-center shadow-sm shrink-0">
              FC
            </span>
            <div class="leading-tight min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <strong class="block text-xs font-bold text-white truncate">Floamy Centro</strong>
                <span class="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/25 shrink-0" title="Sucursal activa"></span>
              </div>
              <small class="text-[11px] text-[#aac8e0] truncate block">Sucursal principal</small>
            </div>
          </div>
        </div>

        <!-- Navegación con scroll interno -->
        <nav class="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-5 text-xs">

          <!-- GENERAL -->
          <div *ngIf="hasAny(['dashboard', 'pos', 'orders', 'cash_register'])" class="space-y-1">
            <div class="flex items-center gap-2 px-3 mb-1.5">
              <span class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6da0bf]">General</span>
              <span class="h-px flex-1 bg-white/10"></span>
            </div>

            <a *ngIf="auth.hasPermission('dashboard')"
               routerLink="/admin/resumen"
               routerLinkActive
               #rlaResumen="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaResumen.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaResumen.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaResumen.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              <span class="truncate">Resumen</span>
            </a>

            <a *ngIf="auth.hasPermission('pos')"
               routerLink="/admin/pos"
               routerLinkActive
               #rlaPos="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaPos.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaPos.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaPos.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5h18v12H3V5zm4 15h10M9 9h6m-6 4h3"/>
              </svg>
              <span class="truncate">Punto de venta</span>
            </a>

            <a *ngIf="auth.hasPermission('orders')"
               routerLink="/admin/pedidos"
               routerLinkActive
               #rlaPedidos="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaPedidos.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaPedidos.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaPedidos.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
              </svg>
              <span class="truncate">Pedidos</span>
            </a>

            <a *ngIf="auth.hasPermission('cash_register')"
               routerLink="/admin/corte-caja"
               routerLinkActive
               #rlaCaja="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaCaja.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaCaja.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaCaja.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2m9-4a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="truncate">Corte de caja</span>
            </a>
          </div>

          <!-- CATÁLOGO -->
          <div *ngIf="hasAny(['products', 'catalog_options'])" class="space-y-1">
            <div class="flex items-center gap-2 px-3 mb-1.5">
              <span class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6da0bf]">Catálogo</span>
              <span class="h-px flex-1 bg-white/10"></span>
            </div>

            <a *ngIf="auth.hasPermission('products')"
               routerLink="/admin/productos"
               routerLinkActive
               #rlaProductos="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaProductos.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaProductos.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaProductos.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 11a4 4 0 118 0m-8 0h8m-8 0l4 10 4-10"/>
              </svg>
              <span class="truncate">Productos</span>
            </a>

            <a *ngIf="auth.hasPermission('catalog_options')"
               routerLink="/admin/tamanos"
               routerLinkActive
               #rlaTamanos="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaTamanos.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaTamanos.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaTamanos.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 8h12l-1 12H7L6 8zm3-4h6l1 4H8l1-4z"/>
              </svg>
              <span class="truncate">Tamaños</span>
            </a>

            <a *ngIf="auth.hasPermission('catalog_options')"
               routerLink="/admin/toppings"
               routerLinkActive
               #rlaToppings="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaToppings.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaToppings.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaToppings.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
              </svg>
              <span class="truncate">Toppings</span>
            </a>
          </div>

          <!-- OPERACIÓN -->
          <div *ngIf="hasAny(['inventory', 'movements', 'suppliers'])" class="space-y-1">
            <div class="flex items-center gap-2 px-3 mb-1.5">
              <span class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6da0bf]">Operación</span>
              <span class="h-px flex-1 bg-white/10"></span>
            </div>

            <a *ngIf="auth.hasPermission('inventory')"
               routerLink="/admin/inventario"
               routerLinkActive
               #rlaInventario="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaInventario.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaInventario.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaInventario.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
              <span class="truncate">Inventario</span>
            </a>

            <a *ngIf="auth.hasPermission('suppliers')"
               routerLink="/admin/compras"
               routerLinkActive
               #rlaCompras="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaCompras.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaCompras.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaCompras.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              <span class="truncate">Compras a proveedores</span>
            </a>

            <a *ngIf="auth.hasPermission('movements')"
               routerLink="/admin/movimientos"
               routerLinkActive
               #rlaMovimientos="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaMovimientos.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaMovimientos.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaMovimientos.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
              </svg>
              <span class="truncate">Movimientos</span>
            </a>

            <a *ngIf="auth.hasPermission('suppliers')"
               routerLink="/admin/proveedores"
               routerLinkActive
               #rlaProveedores="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaProveedores.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaProveedores.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaProveedores.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
              </svg>
              <span class="truncate">Proveedores</span>
            </a>
          </div>

          <!-- PERSONAS -->
          <div *ngIf="hasAny(['clients', 'users', 'roles'])" class="space-y-1">
            <div class="flex items-center gap-2 px-3 mb-1.5">
              <span class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6da0bf]">Personas</span>
              <span class="h-px flex-1 bg-white/10"></span>
            </div>

            <a *ngIf="auth.hasPermission('clients')"
               routerLink="/admin/clientes"
               routerLinkActive
               #rlaClientes="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaClientes.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaClientes.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaClientes.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span class="truncate">Clientes</span>
            </a>

            <a *ngIf="auth.hasPermission('users')"
               routerLink="/admin/usuarios"
               routerLinkActive
               #rlaUsuarios="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaUsuarios.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaUsuarios.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaUsuarios.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="truncate">Usuarios</span>
            </a>

            <a *ngIf="auth.hasPermission('roles')"
               routerLink="/admin/roles"
               routerLinkActive
               #rlaRoles="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaRoles.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaRoles.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaRoles.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span class="truncate">Roles y permisos</span>
            </a>
          </div>

          <!-- EXPERIENCIA -->
          <div *ngIf="auth.hasPermission('reviews')" class="space-y-1">
            <div class="flex items-center gap-2 px-3 mb-1.5">
              <span class="text-[10px] font-bold tracking-[0.14em] uppercase text-[#6da0bf]">Experiencia</span>
              <span class="h-px flex-1 bg-white/10"></span>
            </div>

            <a routerLink="/admin/resenas"
               routerLinkActive
               #rlaResenas="routerLinkActive"
               (click)="sidebarOpen.set(false)"
               [class]="rlaResenas.isActive
                 ? 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#6da0bf]/20 border border-[#6da0bf]/35 text-white font-semibold shadow-xs transition-all'
                 : 'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl border border-transparent text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all'"
               style="text-decoration:none;">
              <span *ngIf="rlaResenas.isActive" class="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#7dd3fc]"></span>
              <svg [class]="rlaResenas.isActive ? 'w-[18px] h-[18px] text-[#7dd3fc] shrink-0' : 'w-[18px] h-[18px] text-slate-400 group-hover:text-[#6da0bf] transition-colors shrink-0'"
                   fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              <span class="truncate">Reseñas</span>
            </a>
          </div>
        </nav>

        <!-- Pie fijo del sidebar -->
        <div class="p-3.5 border-t border-white/10 bg-black/20 shrink-0">
          <div class="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/[0.05] border border-white/10">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-9 h-9 rounded-xl bg-[#dff0f7] text-[#011640] font-extrabold text-xs grid place-items-center shrink-0">
                {{ userInitial() }}
              </span>
              <div class="truncate leading-tight">
                <strong class="block text-xs font-semibold text-white truncate">
                  {{ auth.currentUser()?.nombre || 'Equipo Floamy' }}
                </strong>
                <small class="text-[11px] text-[#aac8e0] truncate block">
                  {{ auth.currentUser()?.rol || 'Staff' }}
                </small>
              </div>
            </div>

            <button type="button"
                    (click)="logout()"
                    title="Cerrar sesión"
                    class="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-200 bg-red-500/15 hover:bg-red-500/30 border border-red-400/20 rounded-xl transition shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>

      <!-- Contenido principal -->
      <div class="flex-1 flex flex-col min-w-0">
        <header class="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div class="flex items-center gap-3">
            <button type="button"
                    (click)="sidebarOpen.set(true)"
                    class="lg:hidden p-2 rounded-lg text-[#011640] hover:bg-slate-100">
              ☰
            </button>
            <span class="text-xs text-slate-500">
              Panel administrativo › <strong class="text-[#011640]">Floamy</strong>
            </span>
          </div>

          <div class="flex items-center gap-2.5">
            <a routerLink="/"
               class="text-xs font-semibold text-[#6da0bf] hover:text-[#011640] transition"
               style="text-decoration:none;">
              Ver tienda ↗
            </a>
            <span class="px-3 py-1 text-xs font-semibold text-[#011640] bg-[#f7f3e9] border border-slate-200 rounded-xl">
              {{ auth.currentUser()?.rol || 'Administrador' }}
            </span>
          </div>
        </header>

        <main class="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  sidebarOpen = signal(false);

  userInitial = computed(() => {
    const name = this.auth.currentUser()?.nombre || 'A';
    return name[0].toUpperCase();
  });

  hasAny(keys: string[]): boolean {
    return keys.some((k) => this.auth.hasPermission(k));
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}