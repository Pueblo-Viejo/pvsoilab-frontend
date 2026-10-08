import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  selector: 'app-new-requisition',
  imports: [FormsModule, PageBreadcrumbComponent, RouterLink],
  templateUrl: './new-requisition.component.html',
  styles: `
    .field-label {
      margin-bottom: 0.375rem;
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(55 65 81);
    }
    .field-input {
      height: 44px;
      width: 100%;
      border-radius: 0.5rem;
      border: 1px solid rgb(209 213 219);
      background: transparent;
      padding: 0.625rem 1rem;
      font-size: 0.875rem;
      color: rgb(31 41 55);
      outline: none;
    }
    textarea.field-input {
      height: auto;
      resize: vertical;
    }
    .field-input:focus {
      border-color: rgb(70 95 255);
      box-shadow: 0 0 0 3px rgba(70, 95, 255, 0.1);
    }
    .field-input::placeholder {
      color: rgb(156 163 175);
    }
    :host-context(.dark) .field-input {
      border-color: rgb(55 65 81);
      background: rgb(17 24 39);
      color: rgba(255, 255, 255, 0.9);
    }
    :host-context(.dark) .field-label {
      color: rgb(156 163 175);
    }
  `,
})
export class NewRequisitionComponent {
  private readonly requisitionService = inject(RequisitionNumberService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

  form = {
    project_name: '',
    client: '',
    project_number: '',
    structure: '',
    sample_date: '',
    truck_count: '',
    sample_by: '',
  };

  samples: RequisitionSamplePayload[] = [this.createEmptySample()];
  readonly loading = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly packageId = signal('');
  readonly editingPackageId = signal('');
  readonly activeSampleIndex = signal(0);
  readonly testsModalOpen = signal(false);
  readonly sampleCount = computed(() => this.samples.length);
  readonly selectedTestCount = computed(() => this.samples.reduce((total, sample) => total + sample.tests.length, 0));
  readonly activeSample = computed(() => this.samples[this.activeSampleIndex()] ?? this.samples[0]);

  ngOnInit(): void {
    const packageId = this.route.snapshot.queryParamMap.get('package_id')?.trim() || '';
    if (packageId) {
      this.loadForEdit(packageId);
    }
  }

  addSample(): void {
    this.samples = [...this.samples, this.createEmptySample()];
    this.activeSampleIndex.set(this.samples.length - 1);
  }

  removeSample(index: number): void {
    if (this.samples.length === 1) {
      return;
    }
    this.samples = this.samples.filter((_, sampleIndex) => sampleIndex !== index);
    this.activeSampleIndex.set(Math.max(0, Math.min(this.activeSampleIndex(), this.samples.length - 1)));
  }

  selectSample(index: number): void {
    this.activeSampleIndex.set(index);
  }

  openTestsModal(index: number): void {
    this.activeSampleIndex.set(index);
    this.testsModalOpen.set(true);
  }

  closeTestsModal(): void {
    this.testsModalOpen.set(false);
  }

  toggleTest(sample: RequisitionSamplePayload, test: string, checked: boolean): void {
    sample.tests = checked
      ? Array.from(new Set([...sample.tests, test]))
      : sample.tests.filter((item) => item !== test);
  }

  hasTest(sample: RequisitionSamplePayload, test: string): boolean {
    return sample.tests.includes(test);
  }

  save(): void {
    this.error.set('');
    this.success.set('');
    this.packageId.set('');

    const validationError = this.validate();
    if (validationError) {
      this.error.set(validationError);
      return;
    }

    const payload: CreateRequisitionPayload = {
      ...this.form,
      samples: this.samples,
    };

    const request = this.editingPackageId()
      ? this.requisitionService.updateRequisition(this.editingPackageId(), payload)
      : this.requisitionService.createRequisition(payload);

    this.loading.set(true);
    request.subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo guardar la requisicion.');
          return;
        }

        this.success.set(response.message || (this.editingPackageId() ? 'Requisicion actualizada correctamente.' : 'Requisicion guardada correctamente.'));
        this.packageId.set(response.package_id || this.editingPackageId() || '');
        if (!this.editingPackageId()) {
          this.resetForm();
        }
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

  deletePackage(): void {
    const packageId = this.editingPackageId();
    if (!packageId) {
      return;
    }

    const confirmed = window.confirm(`Eliminar el paquete ${packageId}? Esta accion no se puede deshacer.`);
    if (!confirmed) {
      return;
    }

    this.loading.set(true);
    this.error.set('');
    this.success.set('');
    this.requisitionService.deleteRequisition(packageId).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo eliminar la requisicion.');
          return;
        }

        this.success.set(response.message || 'Requisicion eliminada correctamente.');
        this.router.navigate(['/requisitions/registered-samples']);
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

  private loadForEdit(packageId: string): void {
    this.loading.set(true);
    this.error.set('');
    this.requisitionService.getRegisteredSamples({ months: 24, query: packageId }).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo cargar la requisicion.');
          return;
        }

        const item = (response.items || []).find((packageItem) => packageItem.package_id === packageId);
        if (!item) {
          this.error.set(`No se encontro el paquete ${packageId}.`);
          return;
        }

        this.applyEditPackage(item);
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

  private applyEditPackage(item: RegisteredSamplePackage): void {
    this.editingPackageId.set(item.package_id);
    this.packageId.set(item.package_id);
    this.form = {
      project_name: item.project_name || '',
      client: item.client || '',
      project_number: item.project_number || '',
      structure: item.structure || '',
      sample_date: item.sample_date || '',
      truck_count: item.truck_count || '',
      sample_by: item.sample_by || '',
    };
    this.samples = item.samples.map((sample) => ({
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
    this.activeSampleIndex.set(0);
  }

  private validate(): string {
    if (!this.form.sample_date || !this.form.sample_by) {
      return 'Completa fecha de coleccion y muestreado por.';
    }

    for (const [index, sample] of this.samples.entries()) {
      if (!sample.sample_id || !sample.sample_number || !sample.material_type || !sample.sample_type) {
        return `Completa los campos requeridos de la muestra ${index + 1}.`;
      }

      if (!sample.tests.length) {
        return `Selecciona al menos un ensayo para la muestra ${index + 1}.`;
      }
    }

    return '';
  }

  private resetForm(): void {
    this.form = {
      project_name: '',
      client: '',
      project_number: '',
      structure: '',
      sample_date: '',
      truck_count: '',
      sample_by: '',
    };
    this.samples = [this.createEmptySample()];
    this.editingPackageId.set('');
    this.activeSampleIndex.set(0);
  }

  private createEmptySample(): RequisitionSamplePayload {
    return {
      sample_id: '',
      sample_number: '',
      area: '',
      source: '',
      material_type: '',
      sample_type: '',
      depth_from: '',
      depth_to: '',
      north: '',
      east: '',
      elev: '',
      comment: '',
      tests: [],
    };
  }
}
