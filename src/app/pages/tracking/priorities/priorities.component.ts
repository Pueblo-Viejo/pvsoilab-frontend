import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageBreadcrumbComponent } from '../../../shared/components/common/page-breadcrumb/page-breadcrumb.component';
import { PriorityItem, TrackingService } from '../../../shared/services/tracking.service';

@Component({
  selector: 'app-priorities',
  imports: [FormsModule, PageBreadcrumbComponent],
  templateUrl: './priorities.component.html',
})
export class PrioritiesComponent {
  private readonly trackingService = inject(TrackingService);

  filters = {
    from: this.formatDate(this.addDays(new Date(), -90)),
    to: this.formatDate(new Date()),
    client: '',
    priority: '',
    q: '',
  };

  readonly loading = signal(false);
  readonly error = signal('');
  readonly clients = signal<string[]>([]);
  readonly items = signal<PriorityItem[]>([]);
  readonly summary = signal({
    samples: 0,
    requested: 0,
    done: 0,
    pending: 0,
    progress: 0,
    priority_counts: {} as Record<string, number>,
    client_counts: {} as Record<string, number>,
  });
  readonly topClients = computed(() => Object.entries(this.summary().client_counts || {}).slice(0, 6));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');

    this.trackingService.getPriorities(this.filters).subscribe({
      next: (response) => {
        if (!response.ok) {
          this.error.set(response.error || 'No se pudieron cargar las prioridades.');
          this.items.set([]);
          return;
        }

        this.clients.set(response.clients || []);
        this.summary.set(response.summary);
        this.items.set(response.items || []);
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

  priorityClass(priority: string): string {
    const normalized = priority.toLowerCase();
    if (normalized === 'alta') return 'bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300';
    if (normalized === 'media') return 'bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300';
    return 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300';
  }

  testClass(done: boolean): string {
    return done
      ? 'border-success-200 bg-success-50 text-success-700 dark:border-success-500/30 dark:bg-success-500/10 dark:text-success-300'
      : 'border-error-200 bg-error-50 text-error-700 dark:border-error-500/30 dark:bg-error-500/10 dark:text-error-300';
  }

  private addDays(date: Date, days: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + days);
    return copy;
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
