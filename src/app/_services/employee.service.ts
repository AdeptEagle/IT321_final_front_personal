import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from "rxjs";
import { map, finalize, catchError } from "rxjs/operators";
import { Employee } from '../_models/employee'
import { HttpClient } from "@angular/common/http";
import { AlertService } from './alert.service';

const baseUrl = `${environment.apiUrl}/employees`;

@Injectable({ providedIn: 'root'})
export class EmployeeService{
  private employeeSubject: BehaviorSubject<Employee | null> = new BehaviorSubject<Employee | null>(null);
  public employee: Observable<Employee | null> = this.employeeSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private alertService: AlertService
  ) { }

  public get employeeValue(): Employee | null {
    return this.employeeSubject.value;
  }

  create(params: any) {
    return this.http.post<Employee>(baseUrl, params).pipe(
      map(employee => {
        this.employeeSubject.next(employee);
        return employee;
      })
    );
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
    return this.http.get<Employee>(`${baseUrl}/${id}`).pipe(
      map(employee => {
        this.employeeSubject.next(employee);
        return employee;
      })
    );
  }

  update(id: string, params: any) {
    return this.http.put<Employee>(`${baseUrl}/${id}`, params).pipe(
      map(employee => {
        this.employeeSubject.next(employee);
        return employee;
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      finalize(() => {
        if (this.employeeValue?.id === id) {
          this.employeeSubject.next(null);
        }
      })
    );
  }

  transferDepartment(employeeId: string, newDepartmentId: string) {
    console.log('Transfer request:', { employeeId, newDepartmentId });
    
    // Create a simple update object with just the department ID
    const updateData = {
      departmentId: newDepartmentId
    };
    
    console.log('Update data:', updateData);
    
    return this.http.patch<Employee>(`${baseUrl}/${employeeId}`, updateData).pipe(
      map(employee => {
        console.log('Transfer successful:', employee);
        this.employeeSubject.next(employee);
        this.alertService.success('Employee successfully transferred to new department', { keepAfterRouteChange: true });
        return employee;
      }),
      catchError(error => {
        console.error('Transfer error details:', error);
        if (error.status === 404) {
          throw new Error('Employee not found');
        } else if (error.status === 400) {
          throw new Error('Invalid department ID');
        } else if (error.status === 401) {
          throw new Error('Unauthorized - Please log in again');
        } else if (error.status === 403) {
          throw new Error('Access denied - Admin privileges required');
        } else {
          console.error('Full error object:', error);
          throw new Error(error.error?.message || 'Failed to transfer employee. Please try again.');
        }
      })
    );
  }
}