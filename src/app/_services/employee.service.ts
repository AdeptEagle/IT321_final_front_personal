import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize } from "rxjs/operators";
import { Employee } from '../_models/employee'
import { HttpClient } from "@angular/common/http";

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root'})
export class EmployeeService{
  private employeeSubject: BehaviorSubject<Employee>
  public department: Observable<Employee>
  
  constructor(private http: HttpClient){ }

  public get employeeValue(): Employee {
    return this.employeeSubject.value
  }

  create(params: any) {
    return this.http.post<Employee>(baseUrl, params);
  }
  
  getAll(){
    return this.http.get<Employee[]>(baseUrl).pipe(
      map(employees => {
        console.log('Raw employees data:', employees); // Debug log
        return employees;
      })
    );
  }

  getById(id: string){
    return this.http.get<Employee>(`${baseUrl}/${id}`)
  }

  update(id: string, params: any) {
    return this.http.put<Employee>(`${baseUrl}/${id}`, params);
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`);
  }
}