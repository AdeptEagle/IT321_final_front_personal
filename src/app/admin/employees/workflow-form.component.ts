import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WorkflowService } from '@app/_services/workflow.service';
import { AlertService } from '@app/_services/alert.service';
import { Workflow, WorkflowComment } from '@app/_models/workflow';
import { WorkflowType, WorkflowStatus } from '@app/_models/workflow-type.enum';
import { AccountService } from '@app/_services/account.service';

@Component({
    selector: 'app-workflow-form',
    template: `
        <div class="workflow-form">
            <h4>{{isEditMode ? 'Edit' : 'Create'}} Workflow</h4>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="form-group">
                    <label for="type">Type</label>
                    <select formControlName="type" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.type.errors }">
                        <option value="">Select Type</option>
                        <option *ngFor="let type of workflowTypes" [value]="type">{{type}}</option>
                    </select>
                    <div *ngIf="submitted && f.type.errors" class="invalid-feedback">
                        <div *ngIf="f.type.errors.required">Type is required</div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="details">Details</label>
                    <textarea formControlName="details" class="form-control" rows="3" [ngClass]="{ 'is-invalid': submitted && f.details.errors }"></textarea>
                    <div *ngIf="submitted && f.details.errors" class="invalid-feedback">
                        <div *ngIf="f.details.errors.required">Details are required</div>
                    </div>
                </div>

                <div class="form-group" *ngIf="isEditMode">
                    <label for="status">Status</label>
                    <select formControlName="status" class="form-control" [ngClass]="{ 'is-invalid': submitted && f.status.errors }">
                        <option *ngFor="let status of workflowStatuses" [value]="status">{{status}}</option>
                    </select>
                </div>

                <div class="form-group" *ngIf="isEditMode">
                    <label for="comment">Add Comment</label>
                    <textarea formControlName="comment" class="form-control" rows="2"></textarea>
                </div>

                <div class="form-group">
                    <button [disabled]="loading" class="btn btn-primary">
                        <span *ngIf="loading" class="spinner-border spinner-border-sm mr-1"></span>
                        {{isEditMode ? 'Update' : 'Create'}}
                    </button>
                    <button type="button" class="btn btn-link" (click)="onCancel()">Cancel</button>
                </div>
            </form>

            <div *ngIf="workflow?.comments?.length" class="mt-4">
                <h5>Comments</h5>
                <div class="comment-list">
                    <div *ngFor="let comment of workflow.comments" class="comment">
                        <div class="comment-header">
                            <strong>{{comment.userName}}</strong>
                            <small class="text-muted">{{comment.dateCreated | date:'short'}}</small>
                        </div>
                        <div class="comment-body">{{comment.comment}}</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .workflow-form {
            padding: 1rem;
            background: #fff;
            border-radius: 4px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .form-group {
            margin-bottom: 1rem;
        }
        .comment-list {
            max-height: 300px;
            overflow-y: auto;
        }
        .comment {
            padding: 0.5rem;
            border-bottom: 1px solid #eee;
        }
        .comment-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.25rem;
        }
        .comment-body {
            color: #666;
        }
    `]
})
export class WorkflowFormComponent implements OnInit {
    @Input() employeeId: string;
    @Input() workflow: Workflow;
    @Output() saved = new EventEmitter<Workflow>();
    @Output() cancelled = new EventEmitter<void>();

    form: FormGroup;
    loading = false;
    submitted = false;
    isEditMode = false;
    workflowTypes = Object.values(WorkflowType);
    workflowStatuses = Object.values(WorkflowStatus);

    constructor(
        private formBuilder: FormBuilder,
        private workflowService: WorkflowService,
        private alertService: AlertService,
        private accountService: AccountService
    ) { }

    ngOnInit() {
        console.log('WorkflowFormComponent initialized:', { employeeId: this.employeeId, workflow: this.workflow });
        if (!this.employeeId) {
            console.error('No employeeId provided to WorkflowFormComponent');
            return;
        }
        this.isEditMode = !!this.workflow;
        console.log('Form mode:', this.isEditMode ? 'Edit' : 'Create');
        this.form = this.formBuilder.group({
            type: ['', Validators.required],
            details: ['', Validators.required],
            status: [this.isEditMode ? this.workflow.status : WorkflowStatus.PENDING],
            comment: ['']
        });

        if (this.isEditMode) {
            console.log('Patching form with workflow data:', this.workflow);
            this.form.patchValue({
                type: this.workflow.type,
                details: this.workflow.details,
                status: this.workflow.status
            });
        }
    }

    get f() { return this.form.controls; }

    onSubmit() {
        console.log('Form submitted:', this.form.value);
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            console.log('Form is invalid:', this.form.errors);
            return;
        }

        this.loading = true;
        const workflowData = {
            ...this.form.value,
            employeeId: this.employeeId,
            dateUpdated: new Date().toISOString()
        };
        console.log('Submitting workflow data:', workflowData);

        if (this.isEditMode) {
            this.updateWorkflow(workflowData);
        } else {
            workflowData.dateCreated = new Date().toISOString();
            this.createWorkflow(workflowData);
        }
    }

    private createWorkflow(workflowData: any) {
        console.log('Creating workflow:', workflowData);
        this.workflowService.create(workflowData)
            .subscribe({
                next: (workflow) => {
                    console.log('Workflow created successfully:', workflow);
                    this.alertService.success('Workflow created successfully');
                    this.saved.emit(workflow);
                },
                error: (error) => {
                    console.error('Error creating workflow:', error);
                    this.alertService.error(error?.error?.message || 'Error creating workflow');
                    this.loading = false;
                }
            });
    }

    private updateWorkflow(workflowData: any) {
        console.log('Updating workflow:', workflowData);
        const comment = this.form.value.comment;
        if (comment) {
            console.log('Adding comment:', comment);
            this.addComment(comment);
        }

        this.workflowService.update(this.workflow.id, workflowData)
            .subscribe({
                next: (workflow) => {
                    console.log('Workflow updated successfully:', workflow);
                    this.alertService.success('Workflow updated successfully');
                    this.saved.emit(workflow);
                },
                error: (error) => {
                    console.error('Error updating workflow:', error);
                    this.alertService.error(error?.error?.message || 'Error updating workflow');
                    this.loading = false;
                }
            });
    }

    private addComment(comment: string) {
        console.log('Adding comment to workflow:', comment);
        const currentUser = this.accountService.accountValue;
        const workflowComment: WorkflowComment = {
            id: new Date().getTime().toString(),
            workflowId: this.workflow.id,
            userId: currentUser.id,
            userName: `${currentUser.firstName} ${currentUser.lastName}`,
            comment: comment,
            dateCreated: new Date().toISOString()
        };
        console.log('Created workflow comment:', workflowComment);

        if (!this.workflow.comments) {
            this.workflow.comments = [];
        }
        this.workflow.comments.push(workflowComment);
    }

    onCancel() {
        console.log('Form cancelled');
        this.cancelled.emit();
    }
} 