import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Pictogram {
  id: number;
  term: string;
  image: string;
  context?: string;
}

@Injectable({ providedIn: 'root' })
export class PictosService {
  private api = inject(ApiService);

  search(q: string): Observable<Pictogram[]> {
    return this.api.get<Pictogram[]>('/pictos/search', { q });
  }
}
