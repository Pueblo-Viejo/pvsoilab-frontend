import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { AuthService } from '../../../shared/services/auth.service';
import { KanbanItem, KanbanStatus, TrackingService } from '../../../shared/services/tracking.service';

type KanbanColumn = {
  status: KanbanStatus;
  label: string;
  apiStatus: string;
  accent: string;
};

@Component({
  selector: 'app-sample-process',
  imports: [FormsModule, PageBreadcrumbComponent],
  templateUrl: './sample-process.component.html',
})
export class SampleProcessComponent {
  private readonly trackingService = inject(TrackingService);
  private readonly authService = inject(AuthService);

  readonly columns: KanbanColumn[] = [
    { status: 'registered', label: 'Registrado', apiStatus: 'Registrado', accent: 'bg-blue-light-500' },
    { status: 'process', label: 'Proceso', apiStatus: 'Proceso', accent: 'bg-warning-500' },
    { status: 'delivery', label: 'Entrega', apiStatus: 'Entrega', accent: 'bg-brand-500' },
    { status: 'repeat', label: 'Repeticion', apiStatus: 'Repeticion', accent: 'bg-error-500' },
  ];

  filters = {
    q: '',
    test: '',
  };

  readonly loading = signal(false);
  readonly moving = signal(false);
  readonly movingIds = signal<Set<string>>(new Set());
  readonly error = signal('');
  readonly board = signal<Record<KanbanStatus, KanbanItem[]>>(this.emptyBoard());
  readonly counts = signal<Record<KanbanStatus, number>>(this.emptyCounts());
  readonly selectedRegistered = signal<Set<string>>(new Set());
  readonly testTypes = computed(() => {
    const types = new Set<string>();
    for (const status of this.columns.map((column) => column.status)) {
      for (const item of this.board()[status] || []) {
        if (item.Test_Type) types.add(item.Test_Type);
      }
    }
    return [...types].sort();
  });
  readonly canBulkRegistered = computed(() => this.authService.user()?.username?.toLowerCase() === 'santana');

  moveModal = {
    open: false,
    item: null as KanbanItem | null,
    to: 'process' as KanbanStatus,
    technicians: '',
    note: '',
  };

  labelModal = {
    open: false,
    item: null as KanbanItem | null,
    value: '',
  };

  bulk = {
    to: 'process' as KanbanStatus,
    technicians: '',
    note: '',
  };

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.trackingService.getKanban({
      q: this.filters.q,
      test: this.filters.test,
      limit: this.filters.q ? 500 : this.canBulkRegistered() ? 1000 : 150,
    }).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo cargar el seguimiento.');
          this.board.set(this.emptyBoard());
          this.counts.set(this.emptyCounts());
          return;
        }

        this.board.set(this.normalizeBoard(response.data || {}));
        this.counts.set(this.normalizeCounts(response.counts || {}));
        this.syncSelectionWithBoard();
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  countLabel(status: KanbanStatus): string {
    const visible = this.board()[status]?.length || 0;
    const total = this.counts()[status] ?? visible;
    return total > visible ? `${visible}/${total}` : String(total);
  }

  displayStatus(status: KanbanStatus): string {
    return this.columns.find((column) => column.status === status)?.label || status;
  }

  workedBy(item: KanbanItem): string {
    const initials = Array.isArray(item.Tech_Initials) ? item.Tech_Initials.filter(Boolean) : [];
    return initials.length ? initials.join(' · ') : item.Updated_By || '-';
  }

  techniciansTitle(item: KanbanItem): string {
    return Array.isArray(item.Technicians) ? item.Technicians.join(', ') : '';
  }

  onDragStart(event: DragEvent, item: KanbanItem): void {
    event.dataTransfer?.setData('text/plain', item.id);
    event.dataTransfer?.setData('application/x-kanban-status', this.findStatus(item.id) || '');
    event.dataTransfer!.effectAllowed = 'move';
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, to: KanbanStatus): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain') || '';
    const item = this.findItem(id);
    if (!item) return;
    this.openMoveModal(item, to);
  }

  openMoveModal(item: KanbanItem, to: KanbanStatus): void {
    this.moveModal = {
      open: true,
      item,
      to,
      technicians: '',
      note: '',
    };
  }

  closeMoveModal(): void {
    this.moveModal.open = false;
    this.moveModal.item = null;
  }

  confirmMove(): void {
    const item = this.moveModal.item;
    if (!item) return;

    const from = this.findStatus(item.id);
    const to = this.moveModal.to;
    const previousBoard = this.board();
    const previousCounts = this.counts();

    if (from) {
      this.moveItemLocally(item.id, from, to);
    }

    this.markMoving(item.id, true);
    this.error.set('');
    this.closeMoveModal();

    this.trackingService.moveKanbanItem({
      id: item.id,
      to: this.apiStatus(to),
      technicians: this.splitList(this.moveModal.technicians),
      note: this.moveModal.note.trim(),
    }).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo mover la muestra.');
          this.board.set(previousBoard);
          this.counts.set(previousCounts);
          return;
        }
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
        this.board.set(previousBoard);
        this.counts.set(previousCounts);
      },
      complete: () => {
        this.markMoving(item.id, false);
      },
    });
  }

  openLabelModal(item: KanbanItem): void {
    this.labelModal = {
      open: true,
      item,
      value: item.Sub_Stage || '',
    };
  }

  closeLabelModal(): void {
    this.labelModal.open = false;
    this.labelModal.item = null;
  }

  saveLabel(value = this.labelModal.value): void {
    const item = this.labelModal.item;
    if (!item) return;

    this.trackingService.updateKanbanSubStage({
      id: item.id,
      Sample_ID: item.Sample_ID || '',
      Sample_Number: item.Sample_Number || '',
      Test_Type: item.Test_Type || '',
      sub_stage: value.trim(),
    }).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudo guardar la etiqueta.');
          return;
        }
        this.closeLabelModal();
        this.load();
      },
      error: (error) => {
        this.error.set(error?.error?.error || error?.message || 'No se pudo conectar con el API.');
      },
    });
  }

  toggleRegistered(id: string, checked: boolean): void {
    const next = new Set(this.selectedRegistered());
    checked ? next.add(id) : next.delete(id);
    this.selectedRegistered.set(next);
  }

  selectVisibleRegistered(): void {
    this.selectedRegistered.set(new Set((this.board().registered || []).map((item) => item.id)));
  }

  clearRegisteredSelection(): void {
    this.selectedRegistered.set(new Set());
  }

  isRegisteredSelected(id: string): boolean {
    return this.selectedRegistered().has(id);
  }

  moveSelectedRegistered(): void {
    const ids = [...this.selectedRegistered()];
    if (!ids.length || this.moving()) return;

    const technicians = this.splitList(this.bulk.technicians);
    const note = this.bulk.note.trim() ? `Movimiento masivo: ${this.bulk.note.trim()}` : 'Movimiento masivo desde Registrado';
    const previousBoard = this.board();
    const previousCounts = this.counts();
    this.moving.set(true);
    this.error.set('');

    ids.forEach((id) => {
      this.markMoving(id, true);
      this.moveItemLocally(id, 'registered', this.bulk.to);
    });

    const moveNext = (index: number) => {
      if (index >= ids.length) {
        this.moving.set(false);
        this.clearRegisteredSelection();
        ids.forEach((id) => this.markMoving(id, false));
        return;
      }

      this.trackingService.moveKanbanItem({ id: ids[index], to: this.apiStatus(this.bulk.to), technicians, note }).subscribe({
        next: (response) => {
          if (!response.ok) {
            this.error.set(response.error || `No se pudo mover una muestra (${ids[index]}).`);
            this.board.set(previousBoard);
            this.counts.set(previousCounts);
          }
          moveNext(index + 1);
        },
        error: (error) => {
          this.error.set(error?.error?.error || error?.message || `No se pudo mover una muestra (${ids[index]}).`);
          this.board.set(previousBoard);
          this.counts.set(previousCounts);
          moveNext(index + 1);
        },
      });
    };

    moveNext(0);
  }

  exportExcel(): void {
    const params = new URLSearchParams();
    if (this.filters.q.trim()) params.set('q', this.filters.q.trim());
    if (this.filters.test.trim()) params.set('test', this.filters.test.trim());

    const query = params.toString();
    window.open(`${environment.legacyUrl}/pages/sumary/export_workflow_excel.php${query ? `?${query}` : ''}`, '_blank');
  }

  private emptyBoard(): Record<KanbanStatus, KanbanItem[]> {
    return {
      registered: [],
      process: [],
      delivery: [],
      repeat: [],
    };
  }

  private emptyCounts(): Record<KanbanStatus, number> {
    return {
      registered: 0,
      process: 0,
      delivery: 0,
      repeat: 0,
    };
  }

  private findItem(id: string): KanbanItem | null {
    for (const status of this.columns.map((column) => column.status)) {
      const item = this.board()[status]?.find((candidate) => candidate.id === id);
      if (item) return item;
    }
    return null;
  }

  private findStatus(id: string): KanbanStatus | null {
    for (const status of this.columns.map((column) => column.status)) {
      if (this.board()[status]?.some((item) => item.id === id)) return status;
    }
    return null;
  }

  private splitList(value: string): string[] {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  private syncSelectionWithBoard(): void {
    const visible = new Set((this.board().registered || []).map((item) => item.id));
    this.selectedRegistered.set(new Set([...this.selectedRegistered()].filter((id) => visible.has(id))));
  }

  isMoving(id: string): boolean {
    return this.movingIds().has(id);
  }

  private markMoving(id: string, moving: boolean): void {
    const next = new Set(this.movingIds());
    moving ? next.add(id) : next.delete(id);
    this.movingIds.set(next);
  }

  private moveItemLocally(id: string, from: KanbanStatus, to: KanbanStatus): void {
    if (from === to) return;

    const current = this.board();
    const movingItem = current[from].find((item) => item.id === id);
    if (!movingItem) return;

    this.board.set({
      ...current,
      [from]: current[from].filter((item) => item.id !== id),
      [to]: [movingItem, ...current[to]],
    });

    const counts = this.counts();
    this.counts.set({
      ...counts,
      [from]: Math.max(0, (counts[from] || 0) - 1),
      [to]: (counts[to] || 0) + 1,
    });

    if (from === 'registered') {
      const next = new Set(this.selectedRegistered());
      next.delete(id);
      this.selectedRegistered.set(next);
    }
  }

  private apiStatus(status: KanbanStatus): string {
    return this.columns.find((column) => column.status === status)?.apiStatus || status;
  }

  private normalizeBoard(raw: Record<string, KanbanItem[]>): Record<KanbanStatus, KanbanItem[]> {
    const board = this.emptyBoard();
    for (const [status, items] of Object.entries(raw)) {
      const key = this.normalizeStatus(status);
      if (key) board[key].push(...(items || []));
    }
    return board;
  }

  private normalizeCounts(raw: Record<string, number>): Record<KanbanStatus, number> {
    const counts = this.emptyCounts();
    for (const [status, count] of Object.entries(raw)) {
      const key = this.normalizeStatus(status);
      if (key) counts[key] += Number(count || 0);
    }
    return counts;
  }

  private normalizeStatus(status: string): KanbanStatus | null {
    const clean = status
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    if (clean === 'registrado') return 'registered';
    if (clean === 'proceso' || clean === 'preparacion' || clean.includes('preparaci')) return 'process';
    if (clean === 'entrega') return 'delivery';
    if (clean === 'repeticion' || clean.includes('repetici')) return 'repeat';
    return null;
  }
}
