import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';
import { PageBreadcrumbComponent } from '../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AuthService } from '../../shared/services/auth.service';

type LegacyOption = {
  title: string;
  description: string;
  path: string;
};

type LegacyGroup = {
  title: string;
  options: LegacyOption[];
};

@Component({
  selector: 'app-legacy-hub',
  imports: [PageBreadcrumbComponent],
  templateUrl: './legacy-hub.component.html',
  styles: ``,
})
export class LegacyHubComponent {
  private readonly legacyUrlBase = environment.legacyUrl;

  constructor(private authService: AuthService) {}

  readonly groups: LegacyGroup[] = [
    {
      title: 'Available menus',
      options: [
        { title: 'Requisicion', description: 'Entrada y consulta de muestras recibidas.', path: '/components/menu_requisicion.php' },
        { title: 'Seguimiento', description: 'Control operativo, prioridades y planificacion.', path: '/components/menu_seguimiento.php' },
        { title: 'Ensayos de laboratorio', description: 'Hojas de trabajo y formularios tecnicos.', path: '/components/menu_hojasdetrabajos.php' },
        { title: 'Reportes', description: 'Reporteria, revisiones y resumenes.', path: '/components/menu_reportes.php' },
        { title: 'Inventario', description: 'Muestras, equipos, herramientas y articulos.', path: '/components/menu_inventarios.php' },
        { title: 'Configuracion', description: 'Usuarios, grupos y perfil.', path: '/components/menu_configuracion.php' },
      ],
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
