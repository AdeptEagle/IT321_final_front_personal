import { Injectable } from "@angular/core";
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { map, finalize, catchError, switchMap } from "rxjs/operators";
import { Employee } from '../_models/employee'
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
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

  private handleError(error: HttpErrorResponse) {
    this.alertService.error('An error occurred', { autoClose: false });
    return throwError('An error occurred');
  }

  public get employeeValue(): Employee | null {
    return this.employeeSubject.value;
  }

  create(params: any) {
    return this.http.post<Employee>(baseUrl, params).pipe(
      map(employee => {
        this.employeeSubject.next(employee);
        this.alertService.success('Employee created successfully', { autoClose: false });
        return employee;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }
  
  getAll() {
    return this.http.get<Employee[]>(baseUrl).pipe(
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  getById(id: string) {
    return this.http.get<Employee>(`${baseUrl}/${id}`).pipe(
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  update(id: string, params: any) {
    return this.http.put<Employee>(`${baseUrl}/${id}`, params).pipe(
      map(employee => {
        this.employeeSubject.next(employee);
        this.alertService.success('Employee updated successfully', { autoClose: false });
        return employee;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${baseUrl}/${id}`).pipe(
      map(() => {
        this.alertService.success('Employee deleted successfully', { autoClose: false });
        return true;
      }),
      catchError(error => {
        return this.handleError(error);
      })
    );
  }

  transferDepartment(employeeId: string, newDepartmentId: string) {
    // First get the current employee data
    return this.getById(employeeId).pipe(
      switchMap(currentEmployee => {
        // Create update data with current employee data plus new department
        const updateData = {
          ...currentEmployee,
          departmentId: newDepartmentId
        };
        
        // Use PUT to update the employee
        return this.update(employeeId, updateData);
      })
    );
  }
}