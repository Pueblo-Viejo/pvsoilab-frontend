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

export type KanbanStatus = 'registered' | 'process' | 'delivery' | 'repeat';

export type KanbanItem = {
  id: string;
  Sample_ID: string;
  Sample_Number: string;
  Test_Type: string;
  Since?: string;
  Updated_By?: string;
  Technicians?: string[];
  Tech_Initials?: string[];
  Sub_Stage?: string;
};

export type KanbanResponse = {
  ok: boolean;
  data: Record<string, KanbanItem[]>;
  counts?: Record<string, number>;
  error?: string;
};

export type KanbanMovePayload = {
  id: string;
  to: string;
  technicians: string[];
  note: string;
};

export type KanbanSubStagePayload = {
  id: string;
  Sample_ID: string;
  Sample_Number: string;
  Test_Type: string;
  sub_stage: string;
};

export type KanbanActionResponse = {
  ok: boolean;
  error?: string;
};

@Injectable({
  providedIn: 'root',
})
export class TrackingService {
  private readonly http = inject(HttpClient);
  private readonly prioritiesEndpoint = `${environment.apiUrl}/priorities.php`;
  private readonly kanbanListEndpoint = `${environment.apiUrl}/kanban_list.php`;
  private readonly kanbanMoveEndpoint = `${environment.apiUrl}/kanban_move.php`;
  private readonly kanbanSubStageEndpoint = `${environment.apiUrl}/kanban_substage.php`;

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

  getKanban(filters: { q?: string; test?: string; limit?: number } = {}): Observable<KanbanResponse> {
    let params = new HttpParams();

    for (const [key, value] of Object.entries(filters)) {
      const cleanValue = String(value ?? '').trim();
      if (cleanValue) {
        params = params.set(key, cleanValue);
      }
    }

    return this.http.get<KanbanResponse>(this.kanbanListEndpoint, {
      params,
      withCredentials: true,
    });
  }

  moveKanbanItem(payload: KanbanMovePayload): Observable<KanbanActionResponse> {
    return this.http.post<KanbanActionResponse>(this.kanbanMoveEndpoint, payload, {
      withCredentials: true,
    });
  }

  updateKanbanSubStage(payload: KanbanSubStagePayload): Observable<KanbanActionResponse> {
    return this.http.post<KanbanActionResponse>(this.kanbanSubStageEndpoint, payload, {
      withCredentials: true,
    });
  }
}
