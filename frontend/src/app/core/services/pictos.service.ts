import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from './api.service'; // este arquivo já existe no seu projeto

export interface Picto {
  id: number;
  label?: string;
  synset?: string;
  categories?: string[];
  image: { png?: string; svg?: string };
  reason?: string[];
}

export interface RankedResponse {
  source: string;
  input: string;
  intent: string;
  chosen: Picto[];
  alternatives: Picto[];
  license: { name: string; attribution: string };
}

@Injectable({ providedIn: 'root' })
export class PictosService {
  private api = inject(ApiService);

  /** Retorna apenas os pictos ranqueados (chosen) */
  searchChosen(q: string): Observable<Picto[]> {
    return this.api.get<RankedResponse>('/pictos/search', { q }).pipe(
      map((res) => res?.chosen ?? [])
    );
  }

  /** (Opcional) resposta completa, inclusive alternatives */
  searchFull(q: string): Observable<RankedResponse> {
    return this.api.get<RankedResponse>('/pictos/search', { q });
  }
}
