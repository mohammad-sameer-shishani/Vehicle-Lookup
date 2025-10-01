import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient, HttpParams } from '@angular/common/http';
import { PaginatedResult } from '../../types/pagination';
import { Car, Make, VehicleType } from '../../types/vehicle';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleServices {
  private url=environment.apiUrl;
  private http=inject(HttpClient);

  getAllMakes(pageNumber: number = 1, pageSize: number = 10, search?: string) {
  let params = new HttpParams()
    .set('pageNumber', pageNumber)
    .set('pageSize', pageSize);

  if (search && search.trim()) {
    params = params.set('search', search.trim()); // <-- change key to your backend’s expected name
  }

  return this.http.get<PaginatedResult<Make>>(this.url, { params });
}


  getAllMakesForSearch() {
    return this.http.get<Make[]>(this.url+'/getAllMakesForSearch');
  }

  getModelsForMakeIdYear(makeId: number, year: number) {
    return this.http.get<Car[]>(`${this.url}/${makeId}/models?year=${year}`);
  }


  getVehicleTypesForMakeId(makeId: number) {  
    return this.http.get<VehicleType[]>(
      // `http://localhost:8081/api/Makes/${encodeURIComponent(String(makeId))}/types`
      `http://localhost:8081/api/Makes/${makeId}/types`
    );
  }
}
