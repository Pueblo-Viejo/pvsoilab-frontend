import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import {
  NextSampleNumberResponse,
  RequisitionNumberService,
} from '../../../shared/services/requisition-number.service';

@Component({
  selector: 'app-next-sample-number',
  imports: [FormsModule, PageBreadcrumbComponent],
  templateUrl: './next-sample-number.component.html',
})
export class NextSampleNumberComponent {
  private readonly requisitionNumberService = inject(RequisitionNumberService);

  readonly prefixes = [
    'PVDJ-AGG',
    'PVDJ-AGG-INV',
    'PVDJ-AGG-DIO',
    'LBOR',
    'PVDJ-MISC',
    'LLD-258',
    'SD3-258',
    'SD2-258',
    'SD1-258',
  ];

  selectedPrefix = '';
  manualPrefix = '';
  pad = 4;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly result = signal<NextSampleNumberResponse | null>(null);

  syncManualPrefix(): void {
    this.manualPrefix = this.selectedPrefix;
  }

  consult(): void {
    const prefix = this.manualPrefix.trim() || this.selectedPrefix.trim();
    const pad = Math.max(1, Number(this.pad) || 4);

    if (!prefix) {
      this.error.set('Selecciona o escribe un prefijo.');
      this.result.set(null);
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.result.set(null);

    this.requisitionNumberService.getNextSampleNumber(prefix, pad).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo consultar el consecutivo.');
          return;
        }

        this.result.set(response);
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
        this.loading.set(false);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}
