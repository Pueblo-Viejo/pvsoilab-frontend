import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();
  if (user) {
    return true;
  }

  return authService.me().pipe(
    map((sessionUser) => {
      if (sessionUser) {
        return true;
      }

      return router.createUrlTree(['/signin']);
    })
  );
};

export const authChildGuard: CanActivateChildFn = (route, state) => authGuard(route, state);

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.user();
  if (user) {
    return router.createUrlTree(['/']);
  }

  return authService.me().pipe(
    map((sessionUser) => (sessionUser ? router.createUrlTree(['/']) : true))
  );
};
