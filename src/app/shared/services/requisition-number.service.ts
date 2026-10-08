import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type NextSampleNumberResponse = {
  ok: boolean;
  base: string;
  resolved: string;
  result: {
    last_found: {
      value?: string;
      suffix?: number;
      pad_len?: number;
    };
    next: {
      use_code: string;
      next_suffix: number;
      next_padded: string;
    };
  };
  error?: string;
};

export type RegisteredSample = {
  id: string;
  sample_id: string;
  sample_number: string;
  area: string;
  source: string;
  material_type: string;
  sample_type: string;
  depth_from: string;
  depth_to: string;
  north: string;
  east: string;
  elev: string;
  comment: string;
  requested_count: number;
  requested_tests: string[];
};

export type RegisteredSamplePackage = {
  package_id: string;
  project_name: string;
  client: string;
  project_number: string;
  structure: string;
  truck_count: string;
  sample_id: string;
  sample_numbers: string[];
  requested_count: number;
  comment: string;
  sample_by: string;
  sample_date: string;
  registered_date: string;
  samples: RegisteredSample[];
};

export type RegisteredSamplesResponse = {
  ok: boolean;
  count: number;
  items: RegisteredSamplePackage[];
  error?: string;
};

export type RequisitionSamplePayload = {
  id?: string;
  sample_id: string;
  sample_number: string;
  area: string;
  source: string;
  material_type: string;
  sample_type: string;
  depth_from: string;
  depth_to: string;
  north: string;
  east: string;
  elev: string;
  comment: string;
  tests: string[];
};

export type CreateRequisitionPayload = {
  project_name: string;
  client: string;
  project_number: string;
  structure: string;
  sample_date: string;
  truck_count: string;
  sample_by: string;
  samples: RequisitionSamplePayload[];
};

export type CreateRequisitionResponse = {
  ok: boolean;
  message?: string;
  package_id?: string;
  created?: number;
  updated?: number;
  deleted?: number;
  error?: string;
};

@Injectable({
  providedIn: 'root',
})
export class RequisitionNumberService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = `${environment.apiUrl}/samples_today_and_next.php`;
  private readonly registeredEndpoint = `${environment.apiUrl}/registered_requisitions.php`;
  private readonly requisitionsEndpoint = `${environment.apiUrl}/requisitions.php`;

  getNextSampleNumber(prefix: string, pad = 4): Observable<NextSampleNumberResponse> {
    const params = new HttpParams()
      .set('action', 'next')
      .set('prefix', prefix)
      .set('pad', String(pad));

    return this.http.get<NextSampleNumberResponse>(this.endpoint, {
      params,
      withCredentials: true,
    });
  }

  getRegisteredSamples(options: { months?: number; query?: string } = {}): Observable<RegisteredSamplesResponse> {
    let params = new HttpParams().set('months', String(options.months ?? 3));

    const query = options.query?.trim();
    if (query) {
      params = params.set('q', query);
    }

    return this.http.get<RegisteredSamplesResponse>(this.registeredEndpoint, {
      params,
      withCredentials: true,
    });
  }

  createRequisition(payload: CreateRequisitionPayload): Observable<CreateRequisitionResponse> {
    return this.http.post<CreateRequisitionResponse>(this.requisitionsEndpoint, payload, {
      withCredentials: true,
    });
  }

  updateRequisition(packageId: string, payload: CreateRequisitionPayload): Observable<CreateRequisitionResponse> {
    return this.http.put<CreateRequisitionResponse>(this.requisitionsEndpoint, {
      ...payload,
      package_id: packageId,
    }, {
      withCredentials: true,
    });
  }

  deleteRequisition(packageId: string): Observable<CreateRequisitionResponse> {
    return this.http.delete<CreateRequisitionResponse>(this.requisitionsEndpoint, {
      body: { package_id: packageId },
      withCredentials: true,
    });
  }
}
