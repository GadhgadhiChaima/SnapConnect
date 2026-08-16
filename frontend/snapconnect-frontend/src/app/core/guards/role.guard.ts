import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Role-based guard factory.
 * Usage: canActivate: [authGuard, roleGuard('CLIENT')]
 */
export function roleGuard(requiredRole: UserRole): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    const user   = auth.currentUser();

    if (user && user.role === requiredRole) {
      return true;
    }

    return router.createUrlTree(['/forbidden']);
  };
}
