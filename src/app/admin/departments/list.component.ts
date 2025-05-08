import { Component } from "@angular/core";
import { Account } from "@app/_models";
import { DepartmentService, EmployeeService } from '@app/_services'
import { first } from "rxjs/operators";

@Component({ templateUrl: 'list.component.html'})
export class ListComponent{
  departments: any[]
  employeeCounts: { [key: string]: number } = {};

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService
  ){ }

  ngOnInit(){
    // Get all departments
    this.departmentService.getAll()
      .pipe(first())
      .subscribe(departments => {
        this.departments = departments;
        // Get all employees to count by department
        this.employeeService.getAll()
          .pipe(first())
          .subscribe(employees => {
            // Count employees per department
            this.employeeCounts = employees.reduce((acc, employee) => {
              const deptId = employee.departmentId;
              acc[deptId] = (acc[deptId] || 0) + 1;
              return acc;
            }, {});
          });
      });
  }

  getEmployeeCount(departmentId: string): number {
    return this.employeeCounts[departmentId] || 0;
  }

  deleteDepartment(id: string){
    const department = this.departments.find(x => x.id === id)
    department.isDeleting = true

    this.departmentService.delete(id)
      .pipe(first())
      .subscribe(() => {
        this.departments = this.departments.filter(x => x.id !== id)
      })
  }
}