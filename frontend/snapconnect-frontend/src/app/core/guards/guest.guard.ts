import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Redirects already-authenticated users away from login/register pages */
export const guestGuard: CanActivateFn = () => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return true;
  }

  /* Redirect to role-appropriate dashboard */
  const role = auth.currentUser()?.role;
  if (role === 'ADMIN')   return router.createUrlTree(['/admin/dashboard']);
  if (role === 'CREATOR') return router.createUrlTree(['/creator/dashboard']);
  return router.createUrlTree(['/client/dashboard']);
};
