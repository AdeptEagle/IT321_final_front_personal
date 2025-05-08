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
  showTransferModal = false;
  selectedEmployee: Employee;
  showWorkflowModal = false;

  constructor(
    private router: Router,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ){ }

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    console.log('Fetching updated employee list...'); // Debug log
    this.employeeService.getAll()
      .pipe(first())  
      .subscribe({
        next: (employees) => {
          console.log('Updated employees list:', employees); // Debug log
          this.employees = employees;
        },
        error: (error) => {
          console.error('Error fetching employees:', error); // Debug log
          this.alertService.error('Error fetching employees');
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
          this.isDeleting = false;
        },
        error: error => {
          this.alertService.error(error?.message || 'Error deleting employee');
          this.isDeleting = false;
        }
      });
  }

  openTransferModal(employee: Employee) {
    if (!employee || !employee.id) {
      this.alertService.error('Invalid employee data');
      return;
    }
    this.selectedEmployee = { ...employee }; // Create a copy of the employee object
    this.showTransferModal = true;
  }

  closeTransferModal() {
    this.showTransferModal = false;
    this.selectedEmployee = null;
  }

  onTransferComplete() {
    this.loadEmployees(); // Reload the list to show updated department
    this.closeTransferModal();
  }

  openWorkflowModal(employee: Employee) {
    console.log('Opening workflow modal for employee:', employee); // Debug log
    if (!employee || !employee.id) {
      console.error('Invalid employee data:', employee); // Debug log
      this.alertService.error('Invalid employee data');
      return;
    }
    console.log('Setting selected employee:', employee); // Debug log
    this.selectedEmployee = employee;
    console.log('Setting showWorkflowModal to true'); // Debug log
    this.showWorkflowModal = true;
    console.log('Modal state:', { showWorkflowModal: this.showWorkflowModal, selectedEmployee: this.selectedEmployee }); // Debug log
  }

  closeWorkflowModal() {
    this.showWorkflowModal = false;
    this.selectedEmployee = null;
  }
}