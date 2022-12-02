import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Rest4Service } from '../shared/rest4.service';
import { Range } from './range';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RangeValue } from './rangeValue';
import { Filter } from '../breadcrumb/filter';

@Injectable({
  providedIn: 'root'
})
export class RangeService extends Rest4Service<Range> {

  constructor(private http: HttpClient) {
    super('datasets', 'classes', 'facets', 'ranges', http);
  }

  getValues(did: string, cid: string, fid: string, rid: string, filters: Filter[]): Observable<RangeValue[]> {
    let params = Filter.toQuery(filters);
    return this.http.get<RangeValue[]>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets/${fid}/ranges/${rid}/values`,
      {params: params});
  }

  getValue(did: string, cid: string, fid: string, rid: string, value: string, filters: Filter[]): Observable<RangeValue> {
    let params = Filter.toQuery(filters);
    params = params.append('value', value);
    return this.http.get<RangeValue>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets/${fid}/ranges/${rid}`,
      {params: params});
  }

  getValuesContaining(did: string, cid: string, fid: string, rid: string, filters: Filter[],
                      top: number, containing: string, lang: string): Observable<RangeValue[]> {
    let params = Filter.toQuery(filters);
    params = params.append('top', top.toString());
    params = params.append('containing', containing);
    params = params.append('lang', lang);
    return this.http.get<RangeValue[]>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets/${fid}/ranges/${rid}/valuesContaining`,
      {params: params});
  }

  getMinMax(did: string, cid: string, fid: string, rid: string, filters: Filter[]): Observable<Range> {
    let params = Filter.toQuery(filters);
    return this.http.get<Range>(
      `${environment.API}/datasets/${did}/classes/${cid}/facets/${fid}/ranges/${rid}/minmax`,
      {params: params});
  }
}
