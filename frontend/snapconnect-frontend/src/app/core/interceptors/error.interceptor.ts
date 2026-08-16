import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/** Handles HTTP errors globally — 401, 403, 404, 5xx */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      switch (err.status) {
        case 401:
          localStorage.removeItem('snapconnect_token');
          localStorage.removeItem('snapconnect_user');
          router.navigate(['/auth/login']);
          break;
        case 403:
          router.navigate(['/forbidden']);
          break;
        case 404:
          /* let components handle their own 404 — only redirect for non-API */
          break;
      }
      return throwError(() => err);
    })
  );
};
