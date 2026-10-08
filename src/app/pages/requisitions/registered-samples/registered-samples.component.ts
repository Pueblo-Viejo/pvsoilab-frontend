import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import {
  CreateRequisitionPayload,
  RegisteredSamplePackage,
  RequisitionNumberService,
  RequisitionSamplePayload,
} from '../../../shared/services/requisition-number.service';

type TestTypeOption = {
  value: string;
  label: string;
};

@Component({
  selector: 'app-registered-samples',
  imports: [FormsModule, PageBreadcrumbComponent, RouterLink],
  templateUrl: './registered-samples.component.html',
})
export class RegisteredSamplesComponent {
  private readonly requisitionNumberService = inject(RequisitionNumberService);

  query = '';
  months = 3;

  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly packages = signal<RegisteredSamplePackage[]>([]);
  readonly selectedPackage = signal<RegisteredSamplePackage | null>(null);
  readonly editingPackage = signal<RegisteredSamplePackage | null>(null);
  readonly saving = signal(false);
  readonly deletingPackageId = signal('');
  readonly packageCount = computed(() => this.packages().length);

  readonly clients = ['TSF LLagal', 'TSF Naranjo', 'PV Project', 'Remix', 'Capital Project', 'MRM', 'Geotecnia', 'Hidrogeologia'];
  readonly structures = ['LLD', 'ERD', 'SD1', 'SD2', 'SD3', 'LBOR', 'Site Investigation', 'Stockpiles', 'Quarry', 'Diorite', 'Source Investigation', 'Miscelaneus', 'Diversion Berm 1', 'Diversion Berm 2', 'Diversion Berm 3', 'Diversion Channel 1', 'Diversion Channel 2', 'Diversion Channel 3'];
  readonly materialTypes = ['Soil', 'Rock', 'Crudo', 'RF', 'IRF', 'FRF', 'UTF', 'TRF', 'FF', 'CF', 'LPF', 'RS', 'EMF', 'GF', 'UFF', 'EF', 'PQ', 'Common', 'Arena silica', 'SF', 'RDF', 'Riprap'];
  readonly sampleTypes = ['Grab', 'Bag', 'Sacks', 'Bulk', 'Truck', 'Rock', 'Shelby', 'Lexan', 'Mazier', 'Ring'];
  readonly testTypes: TestTypeOption[] = [
    { value: 'MC', label: 'Contenido de Humedad (MC)' },
    { value: 'AL', label: 'Limite De Atterberg (AL)' },
    { value: 'GS', label: 'Granulometria por Tamizado (GS)' },
    { value: 'SP', label: 'Proctor Estandar (SP)' },
    { value: 'SG', label: 'Gravedad Especifica (SG)' },
    { value: 'AR', label: 'Reactividad Acida (AR)' },
    { value: 'SCT', label: 'Castillo de Arena (SCT)' },
    { value: 'LAA', label: 'Abrasion de Los Angeles (LAA)' },
    { value: 'SND', label: 'Sanidad (SND)' },
    { value: 'Consolidation', label: 'Consolidacion' },
    { value: 'UCS', label: 'Compresion Simple (UCS)' },
    { value: 'PLT', label: 'Carga Puntual (PLT)' },
    { value: 'BTS', label: 'Traccion Simple (BTS)' },
    { value: 'HY', label: 'Hidrometro (HY)' },
    { value: 'DHY', label: 'Doble Hidrometro (DHY)' },
    { value: 'PH', label: 'Pinhole (PH)' },
    { value: 'Permeability', label: 'Permeabilidad' },
    { value: 'SHAPE', label: 'Formas de Particulas (SHAPE)' },
    { value: 'DENSIDAD-VIBRATORIO', label: 'Densidad Vibratorio' },
    { value: 'DENSITY', label: 'Densidad' },
    { value: 'CRUMBS', label: 'Crumbs' },
    { value: 'Actividad', label: 'Actividad' },
    { value: 'Envio', label: 'Envio' },
  ];

  editForm = {
    project_name: '',
    client: '',
    project_number: '',
    structure: '',
    sample_date: '',
    truck_count: '',
    sample_by: '',
  };

  editSamples: RequisitionSamplePayload[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.success.set('');

    this.requisitionNumberService.getRegisteredSamples({
      months: Math.max(1, Number(this.months) || 3),
      query: this.query,
    }).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudieron cargar las muestras registradas.');
          this.packages.set([]);
          return;
        }

        this.packages.set(response.items || []);
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

  openDetails(item: RegisteredSamplePackage): void {
    this.selectedPackage.set(item);
  }

  closeDetails(): void {
    this.selectedPackage.set(null);
  }

  openEdit(item: RegisteredSamplePackage): void {
    this.closeDetails();
    this.editingPackage.set(item);
    this.editForm = {
      project_name: item.project_name || '',
      client: item.client || '',
      project_number: item.project_number || '',
      structure: item.structure || '',
      sample_date: item.sample_date || '',
      truck_count: item.truck_count || '',
      sample_by: item.sample_by || '',
    };
    this.editSamples = item.samples.map((sample) => ({
      id: sample.id,
      sample_id: sample.sample_id || '',
      sample_number: sample.sample_number || '',
      area: sample.area || '',
      source: sample.source || '',
      material_type: sample.material_type || '',
      sample_type: sample.sample_type || '',
      depth_from: sample.depth_from || '',
      depth_to: sample.depth_to || '',
      north: sample.north || '',
      east: sample.east || '',
      elev: sample.elev || '',
      comment: sample.comment || '',
      tests: [...(sample.requested_tests || [])],
    }));
  }

  closeEdit(): void {
    if (this.saving()) {
      return;
    }
    this.editingPackage.set(null);
    this.editSamples = [];
  }

  toggleTest(sample: RequisitionSamplePayload, test: string, checked: boolean): void {
    sample.tests = checked
      ? Array.from(new Set([...sample.tests, test]))
      : sample.tests.filter((item) => item !== test);
  }

  hasTest(sample: RequisitionSamplePayload, test: string): boolean {
    return sample.tests.includes(test);
  }

  saveEdit(): void {
    const item = this.editingPackage();
    if (!item) {
      return;
    }

    const validationError = this.validateEdit();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    const payload: CreateRequisitionPayload = {
      ...this.editForm,
      samples: this.editSamples,
    };

    this.saving.set(true);
    this.error.set('');
    this.success.set('');
    this.requisitionNumberService.updateRequisition(item.package_id, payload).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo actualizar la requisicion.');
          return;
        }

        this.success.set(response.message || 'Requisicion actualizada correctamente.');
        this.closeEdit();
        this.load();
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  deletePackage(item: RegisteredSamplePackage): void {
    const confirmed = window.confirm(`Eliminar el paquete ${item.package_id}? Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.deletingPackageId.set(item.package_id);
    this.error.set('');
    this.success.set('');
    this.requisitionNumberService.deleteRequisition(item.package_id).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo eliminar la requisicion.');
          return;
        }

        this.success.set(response.message || 'Requisicion eliminada correctamente.');
        this.closeDetails();
        this.closeEdit();
        this.load();
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
        this.deletingPackageId.set('');
      },
      complete: () => {
        this.deletingPackageId.set('');
      },
    });
  }

  testBadgeClass(): string {
    return 'bg-gray-100 text-gray-600 dark:bg-white/[0.06] dark:text-gray-300';
  }

  private validateEdit(): string {
    if (!this.editForm.sample_date || !this.editForm.sample_by) {
      return 'Completa fecha de coleccion y muestreado por.';
    }

    for (const [index, sample] of this.editSamples.entries()) {
      if (!sample.sample_id || !sample.sample_number || !sample.material_type || !sample.sample_type) {
        return `Completa los campos requeridos de la muestra ${index + 1}.`;
      }

      if (!sample.tests.length) {
        return `Selecciona al menos un ensayo para la muestra ${index + 1}.`;
      }
    }

    return '';
  }
}
