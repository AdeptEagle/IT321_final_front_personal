import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize, catchError } from "rxjs/operators";
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

  transferDepartment(employeeId: string, newDepartmentId: string) {
    console.log('Transfer request:', { employeeId, newDepartmentId });
    
    // Create a simple update object with just the department ID
    const updateData = {
      departmentId: newDepartmentId
    };
    
    console.log('Update data:', updateData);
    
    return this.http.patch<Employee>(`${baseUrl}/${employeeId}`, updateData).pipe(
      catchError(error => {
        console.error('Transfer error details:', error);
        if (error.status === 404) {
          throw new Error('Employee not found');
        } else if (error.status === 400) {
          throw new Error('Invalid department ID');
        } else {
          console.error('Full error object:', error);
          throw new Error(error.error?.message || 'Failed to transfer employee. Please try again.');
        }
      })
    );
  }
}