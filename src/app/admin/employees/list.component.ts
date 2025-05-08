import { Component, OnInit } from "@angular/core";
import { DatePipe } from '@angular/common';
import { EmployeeService } from '@app/_services'
import { first } from "rxjs/operators";
import { Router } from '@angular/router';
import { AlertService } from '@app/_services';
import { Employee } from '@app/_models';

@Component({ templateUrl: 'list.component.html', providers: [DatePipe]})
export class ListComponent implements OnInit {
  employees: Employee[] = [];
  isDeleting = false;

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ){ }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.employeeService.getAll()
      .pipe(first())  
      .subscribe({
        next: (employees) => {
          console.log('Loaded employees:', employees); // Debug log
          this.employees = employees;
        },
        error: (error) => {
          console.error('Error loading employees:', error); // Debug log
        }
      });
  }

  deleteEmployee(id: string) {
    const employee = this.employees.find(x => x.id === id);
    if (!employee) return;
    
    this.isDeleting = true;
    this.employeeService.delete(id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.employees = this.employees.filter(x => x.id !== id);
          this.alertService.success('Employee deleted successfully');
        },
        error: error => {
          this.alertService.error(error);
          this.isDeleting = false;
        }
      });
  }
} 