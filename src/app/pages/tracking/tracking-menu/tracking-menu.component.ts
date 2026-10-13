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
      title: 'Proceso de ensayos',
      description: 'Mueve muestras entre registrado, proceso, entrega y repeticion desde un solo tablero.',
      icon: 'M4 7h10M4 12h16M4 17h10M16 15l3 3-3 3',
      path: '/tracking/process',
      tag: 'Angular',
    },
    {
      title: 'Prioridades',
      description: 'Revisa muestras pendientes, prioridad por cliente y avance de ensayos.',
      icon: 'M4 6h16M4 12h10M4 18h7M17 11l3 3-3 3',
      path: '/tracking/priorities',
      tag: 'Angular',
    },
    {
      title: 'Control concreto',
      description: 'Controla las fechas de rotura de cilindros y cubos a 3, 7, 14 y 28 dias.',
      icon: 'M7 4.75h10M8.75 4.75v4.5L6 15.5a3 3 0 0 0 2.75 4.25h6.5A3 3 0 0 0 18 15.5l-2.75-6.25v-4.5M8 14h8',
      legacyPath: '/pages/control_ensayo_concreto.php',
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
