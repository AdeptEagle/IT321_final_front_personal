import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, switchMap } from 'rxjs/operators';
import { EmployeeService } from '@app/_services/employee.service';
import { DepartmentService } from '@app/_services/department.service';
import { AlertService } from '@app/_services/alert.service';
import { Employee } from '@app/_models/employee';
import { Department } from '@app/_models/department';

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.css']
})
export class TransferModalComponent implements OnInit {
  @Input() employee: Employee;
  @Output() close = new EventEmitter<void>();
  @Output() transferComplete = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  submitted = false;
  departments: Department[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
    if (!this.employee || !this.employee.id) {
      console.error('Invalid employee data:', this.employee);
      this.alertService.error('Employee data is missing');
      this.close.emit();
      return;
    }

    this.form = this.formBuilder.group({
      departmentId: [this.employee.departmentId || '', Validators.required]
    });

    // Load departments
    this.departmentService.getAll()
      .pipe(first())
      .subscribe({
        next: (departments) => {
          if (!departments || departments.length === 0) {
            this.alertService.error('No departments available');
            return;
          }
          this.departments = departments;
        },
        error: (error) => {
          console.error('Error loading departments:', error);
          this.alertService.error('Error loading departments');
        }
      });
  }

  // convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    // reset alerts on submit
    this.alertService.clear();

    // stop here if form is invalid
    if (this.form.invalid) {
      return;
    }

    if (!this.employee || !this.employee.id) {
      console.error('Invalid employee data:', this.employee);
      this.alertService.error('Employee data is missing');
      return;
    }

    const newDepartmentId = this.f.departmentId.value;
    if (!newDepartmentId) {
      this.alertService.error('Please select a department');
      return;
    }

    // Don't proceed if the department hasn't changed
    if (newDepartmentId === this.employee.departmentId) {
      this.alertService.error('Employee is already in this department');
      return;
    }

    this.loading = true;
    this.employeeService.transferDepartment(
      this.employee.id,
      newDepartmentId
    )
      .pipe(
        first(),
        switchMap(response => {
          console.log('Transfer successful:', response);
          return this.employeeService.getById(this.employee.id);
        })
      )
      .subscribe({
        next: (updatedEmployee) => {
          console.log('Updated employee data:', updatedEmployee);
          this.alertService.success('Employee transferred successfully');
          this.transferComplete.emit();
          this.close.emit();
        },
        error: (error) => {
          console.error('Transfer error:', error);
          this.alertService.error(error?.message || 'Error transferring employee');
          this.loading = false;
        }
      });
  }

  onClose() {
    this.close.emit();
  }
} 