import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AuthService } from '../../../shared/services/auth.service';

type TrackingOption = {
  title: string;
  description: string;
  icon: string;
  path?: string;
  legacyPath?: string;
  tag: string;
};

@Component({
  selector: 'app-tracking-menu',
  imports: [CommonModule, PageBreadcrumbComponent, RouterLink],
  templateUrl: './tracking-menu.component.html',
})
export class TrackingMenuComponent {
  private readonly legacyUrlBase = environment.legacyUrl;

  constructor(private authService: AuthService) {}

  readonly options: TrackingOption[] = [
    {
      title: 'Prioridades',
      description: 'Revisa muestras pendientes, prioridad por cliente y avance de ensayos.',
      icon: 'M4 6h16M4 12h10M4 18h7M17 11l3 3-3 3',
      path: '/tracking/priorities',
      tag: 'Angular',
    },
    {
      title: 'Preparacion',
      description: 'Gestiona ensayos enviados a preparacion desde el flujo legacy.',
      icon: 'M12 5v14M5 12h14',
      legacyPath: '/pages/test-preparation.php',
      tag: 'Legacy',
    },
    {
      title: 'Realizacion',
      description: 'Da seguimiento a ensayos en realizacion.',
      icon: 'M5 12h4l2 7 4-14 2 7h2',
      legacyPath: '/pages/test-realization.php',
      tag: 'Legacy',
    },
    {
      title: 'Entrega',
      description: 'Consulta o registra entregas de ensayos terminados.',
      icon: 'M6 7h12v10H6zM8 7V5h8v2M9 12l2 2 4-4',
      legacyPath: '/pages/test-delivery.php',
      tag: 'Legacy',
    },
    {
      title: 'Revision',
      description: 'Muestras pendientes de revision y control final.',
      icon: 'M7 7h10M7 12h10M7 17h6',
      legacyPath: '/pages/test-review.php',
      tag: 'Legacy',
    },
    {
      title: 'Repeticiones',
      description: 'Seguimiento de ensayos marcados para repetir.',
      icon: 'M17 7h-6a5 5 0 1 0 5 5M17 7v5h-5',
      legacyPath: '/pages/test-repeat.php',
      tag: 'Legacy',
    },
  ];

  legacyUrl(path: string): string {
    const token = this.authService.legacyToken();
    if (!token) {
      return `${this.legacyUrlBase}${path}`;
    }

    const redirect = encodeURIComponent(path);
    const encodedToken = encodeURIComponent(token);
    return `${this.legacyUrlBase}/api/auth.php?action=handoff&redirect=${redirect}&token=${encodedToken}`;
  }
}
