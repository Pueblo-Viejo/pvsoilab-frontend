import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AuthService } from '../../../shared/services/auth.service';

type RequisitionOption = {
  title: string;
  description: string;
  icon: string;
  path?: string;
  legacyPath?: string;
  tag: string;
};

@Component({
  selector: 'app-requisitions-menu',
  imports: [CommonModule, PageBreadcrumbComponent, RouterLink],
  templateUrl: './requisitions-menu.component.html',
})
export class RequisitionsMenuComponent {
  private readonly legacyUrlBase = environment.legacyUrl;

  constructor(private authService: AuthService) {}

  readonly options: RequisitionOption[] = [
    {
      title: 'Numero de muestra siguiente',
      description: 'Consulta el proximo consecutivo disponible por prefijo.',
      icon: 'M5 12h14M12 5l7 7-7 7',
      path: '/requisitions/next-number',
      tag: 'Angular',
    },
    {
      title: 'Nueva requisicion',
      description: 'Registra muestras y ensayos solicitados al laboratorio.',
      icon: 'M12 5v14M5 12h14',
      path: '/requisitions/new',
      tag: 'Angular',
    },
    {
      title: 'Muestras registradas',
      description: 'Consulta el listado general de requisiciones existentes.',
      icon: 'M8 7h8M8 12h8M8 17h5',
      path: '/requisitions/registered-samples',
      tag: 'Angular',
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
