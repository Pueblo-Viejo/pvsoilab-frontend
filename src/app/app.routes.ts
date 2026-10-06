import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { authChildGuard, guestGuard } from './shared/guards/auth.guard';
import { LegacyHubComponent } from './pages/legacy-hub/legacy-hub.component';

export const routes: Routes = [
  {
    path:'',
    component:AppLayoutComponent,
    canActivateChild: [authChildGuard],
    children:[
      {
        path: '',
        component: LegacyHubComponent,
        pathMatch: 'full',
        title: 'PV Soil Lab | Legacy System',
      },
      { path: 'calendar', redirectTo: '', pathMatch: 'full' },
      { path: 'profile', redirectTo: '', pathMatch: 'full' },
      { path: 'form-elements', redirectTo: '', pathMatch: 'full' },
      { path: 'basic-tables', redirectTo: '', pathMatch: 'full' },
      { path: 'blank', redirectTo: '', pathMatch: 'full' },
      { path: 'legacy', redirectTo: '', pathMatch: 'full' },
      { path: 'invoice', redirectTo: '', pathMatch: 'full' },
      { path: 'line-chart', redirectTo: '', pathMatch: 'full' },
      { path: 'bar-chart', redirectTo: '', pathMatch: 'full' },
      { path: 'alerts', redirectTo: '', pathMatch: 'full' },
      { path: 'avatars', redirectTo: '', pathMatch: 'full' },
      { path: 'badge', redirectTo: '', pathMatch: 'full' },
      { path: 'buttons', redirectTo: '', pathMatch: 'full' },
      { path: 'images', redirectTo: '', pathMatch: 'full' },
      { path: 'videos', redirectTo: '', pathMatch: 'full' },
    ]
  },
  // auth pages
  {
    path:'signin',
    component:SignInComponent,
    canActivate: [guestGuard],
    title:'Angular Sign In Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  {
    path:'signup',
    component:SignUpComponent,
    canActivate: [guestGuard],
    title:'Angular Sign Up Dashboard | TailAdmin - Angular Admin Dashboard Template'
  },
  // error pages
  {
    path:'**',
    redirectTo: '',
  },
];
