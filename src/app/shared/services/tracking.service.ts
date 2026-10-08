import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type PriorityTest = {
  label: string;
  norm: string;
  done: boolean;
};

export type PriorityItem = {
  sample_date: string;
  client: string;
  structure: string;
  sample_id: string;
  sample_number: string;
  priority: 'Alta' | 'Media' | 'Normal' | string;
  tests: PriorityTest[];
  requested: number;
  done: number;
  progress: number;
  comment: string;
};

export type PrioritiesResponse = {
  ok: boolean;
  clients: string[];
  summary: {
    samples: number;
    requested: number;
    done: number;
    pending: number;
    progress: number;
    priority_counts: Record<string, number>;
    client_counts: Record<string, number>;
  };
  items: PriorityItem[];
  error?: string;
};

export type PriorityFilters = {
  from?: string;
  to?: string;
  client?: string;
  priority?: string;
  q?: string;
};

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private readonly http = inject(HttpClient);
  private readonly prioritiesEndpoint = `${environment.apiUrl}/priorities.php`;

  getPriorities(filters: PriorityFilters = {}): Observable<PrioritiesResponse> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      const cleanValue = String(value ?? '').trim();
      if (cleanValue) {
        params = params.set(key, cleanValue);
      }
    }

    return this.http.get<PrioritiesResponse>(this.prioritiesEndpoint, {
      params,
      withCredentials: true,
    });
  }
}
