import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'snapconnect_token';

/** Attaches the JWT Bearer token to all outgoing API requests */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    return next(cloned);
  }

  return next(req);
};
