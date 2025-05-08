import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { WorkflowService } from '@app/_services/workflow.service';
import { EmployeeService } from '@app/_services/employee.service';
import { AlertService } from '@app/_services/alert.service';
import { Workflow } from '@app/_models/workflow';
import { Employee } from '@app/_models/employee';

@Component({
    selector: 'app-workflow-add-edit',
    templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
    form!: FormGroup;
    id: string;
    isAddMode: boolean;
    loading = false;
    submitted = false;
    employees: Employee[] = [];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private workflowService: WorkflowService,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        this.isAddMode = !this.id;

        this.form = this.formBuilder.group({
            type: ['', Validators.required],
            details: ['', Validators.required],
            status: ['', Validators.required],
            employeeId: ['', Validators.required]
        });

        if (!this.isAddMode) {
            this.workflowService.getById(this.id)
                .pipe(first())
                .subscribe({
                    next: (workflow) => {
                        this.form.patchValue(workflow);
                    },
                    error: (error) => {
                        this.alertService.error('Error loading workflow');
                        console.error('Error loading workflow:', error);
                    }
                });
        }

        // Load employees for dropdown
        this.employeeService.getAll()
            .pipe(first())
            .subscribe({
                next: (employees) => {
                    this.employees = employees;
                },
                error: (error) => {
                    this.alertService.error('Error loading employees');
                    console.error('Error loading employees:', error);
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

        this.loading = true;
        if (this.isAddMode) {
            this.createWorkflow();
        } else {
            this.updateWorkflow();
        }
    }

    private createWorkflow() {
        this.workflowService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow created successfully');
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.alertService.error('Error creating workflow');
                    console.error('Error creating workflow:', error);
                    this.loading = false;
                }
            });
    }

    private updateWorkflow() {
        this.workflowService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Workflow updated successfully');
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.alertService.error('Error updating workflow');
                    console.error('Error updating workflow:', error);
                    this.loading = false;
                }
            });
    }
} 