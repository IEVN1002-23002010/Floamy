import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const permissionGuard = (permissionKey: string): CanActivateFn => {
  return (_, state) => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasPermission(permissionKey)) {
      return true;
    }

    const fallback = auth.getDefaultAdminRoute();
    if (fallback !== state.url && fallback !== '/') {
      return router.createUrlTree([fallback]);
    }
    return router.createUrlTree(['/']);
  };
};

export const roleGuard = (allowedRoles: Role[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();
    if (user && allowedRoles.includes(user.rol)) {
      return true;
    }
    return router.createUrlTree([auth.getDefaultAdminRoute()]);
  };
};