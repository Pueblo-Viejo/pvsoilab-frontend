import { Routes } from '@angular/router';
import { AppLayoutComponent } from './shared/layout/app-layout/app-layout.component';
import { SignInComponent } from './pages/auth-pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/auth-pages/sign-up/sign-up.component';
import { authChildGuard, guestGuard } from './shared/guards/auth.guard';
import { LegacyHubComponent } from './pages/legacy-hub/legacy-hub.component';
import { RequisitionsMenuComponent } from './pages/requisitions/requisitions-menu/requisitions-menu.component';
import { NextSampleNumberComponent } from './pages/requisitions/next-sample-number/next-sample-number.component';
import { RegisteredSamplesComponent } from './pages/requisitions/registered-samples/registered-samples.component';
import { NewRequisitionComponent } from './pages/requisitions/new-requisition/new-requisition.component';
import { TrackingMenuComponent } from './pages/tracking/tracking-menu/tracking-menu.component';
import { PrioritiesComponent } from './pages/tracking/priorities/priorities.component';

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
      {
        path: 'requisitions',
        component: RequisitionsMenuComponent,
        title: 'PV Soil Lab | Requisiciones',
      },
      {
        path: 'requisitions/next-number',
        component: NextSampleNumberComponent,
        title: 'PV Soil Lab | Numero siguiente',
      },
      {
        path: 'requisitions/new',
        component: NewRequisitionComponent,
        title: 'PV Soil Lab | Nueva requisicion',
      },
      {
        path: 'requisitions/registered-samples',
        component: RegisteredSamplesComponent,
        title: 'PV Soil Lab | Muestras registradas',
      },
      {
        path: 'tracking',
        component: TrackingMenuComponent,
        title: 'PV Soil Lab | Seguimiento',
      },
      {
        path: 'tracking/priorities',
        component: PrioritiesComponent,
        title: 'PV Soil Lab | Prioridades',
      },
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
    title: 'PV Soil Lab | Sign In'
  },
  {
    path:'signup',
    component:SignUpComponent,
    canActivate: [guestGuard],
    title: 'PV Soil Lab | Sign Up'
  },
  // error pages
  {
    path:'**',
    redirectTo: '',
  },
];
