import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiEndpoints } from '../../../environments/api-endpoints';
import { AvIconCategory } from '../../pages/ui-demo/old-control/icon-ui/icon-metadata.model';

@Injectable({
  providedIn: 'root',
})
export class IconDataService {
  private http = inject(HttpClient);

  // Кашируем запрос, так как иконки меняются редко
  private icons$ = this.http.get<AvIconCategory[]>(ApiEndpoints.ICONS.BASE).pipe(shareReplay(1));

  getIcons(): Observable<AvIconCategory[]> {
    return this.icons$;
  }

  getIconsCount(): Observable<number> {
    return this.http.get<number>(ApiEndpoints.ICONS.COUNT);
  }
}
