import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = (environment.apiBaseUrl || '').replace(/\/+$/, '');

  private url(path: string) {
    return `${this.base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  getPictos(q: string) {
    return this.http.get(this.url('/pictos/search'), { params: { q } });
  }

  get<T>(path: string, params?: Record<string, string | number>) {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => httpParams = httpParams.set(k, String(v)));
    }
    return this.http.get<T>(this.url(path), { params: httpParams });
  }

  post<T>(path: string, body: any) {
    return this.http.post<T>(this.url(path), body);
  }
}
