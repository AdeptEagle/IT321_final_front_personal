import { Component, Input, OnInit } from '@angular/core';
import { WorkflowService } from '@app/_services/workflow.service';
import { Workflow } from '@app/_models/workflow';
import { AlertService } from '@app/_services/alert.service';
import { WorkflowStatus } from '@app/_models/workflow-type.enum';

@Component({
    selector: 'app-workflow-list',
    template: `
        <div class="workflow-list">
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4>Workflows</h4>
                <button class="btn btn-sm btn-success" (click)="showAddForm()">Add Workflow</button>
            </div>

            <div *ngIf="showForm" class="mb-4">
                <app-workflow-form
                    [employeeId]="employeeId"
                    [workflow]="selectedWorkflow"
                    (saved)="onWorkflowSaved($event)"
                    (cancelled)="hideForm()">
                </app-workflow-form>
            </div>

            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Details</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let workflow of workflows">
                            <td>{{workflow.type}}</td>
                            <td>{{workflow.details}}</td>
                            <td>
                                <span class="badge" [ngClass]="{
                                    'badge-warning': workflow.status === 'Pending',
                                    'badge-info': workflow.status === 'In Progress',
                                    'badge-success': workflow.status === 'Approved' || workflow.status === 'Completed',
                                    'badge-danger': workflow.status === 'Rejected'
                                }">
                                    {{workflow.status}}
                                </span>
                            </td>
                            <td>{{workflow.dateCreated | date:'short'}}</td>
                            <td>
                                <button class="btn btn-sm btn-primary" (click)="editWorkflow(workflow)">Edit</button>
                                <button class="btn btn-sm btn-danger" (click)="deleteWorkflow(workflow.id)">Delete</button>
                            </td>
                        </tr>
                        <tr *ngIf="!workflows?.length">
                            <td colspan="5" class="text-center">No workflows found</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `,
    styles: [`
        .workflow-list {
            padding: 1rem;
            background: #f8f9fa;
            border-radius: 4px;
            margin-top: 1rem;
        }
        .table {
            margin-bottom: 1rem;
        }
        .badge {
            padding: 0.5em 0.75em;
        }
    `]
})
export class WorkflowListComponent implements OnInit {
    @Input() employeeId: string;
    workflows: Workflow[] = [];
    showForm = false;
    selectedWorkflow: Workflow;

    constructor(
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadWorkflows();
    }

    loadWorkflows() {
        this.workflowService.getByEmployeeId(this.employeeId)
            .subscribe({
                next: (workflows) => {
                    this.workflows = workflows;
                },
                error: (error) => {
                    this.alertService.error('Error loading workflows');
                    console.error('Error loading workflows:', error);
                }
            });
    }

    showAddForm() {
        this.selectedWorkflow = null;
        this.showForm = true;
    }

    editWorkflow(workflow: Workflow) {
        this.selectedWorkflow = workflow;
        this.showForm = true;
    }

    hideForm() {
        this.showForm = false;
        this.selectedWorkflow = null;
    }

    onWorkflowSaved(workflow: Workflow) {
        this.loadWorkflows();
        this.hideForm();
    }

    deleteWorkflow(id: string) {
        if (confirm('Are you sure you want to delete this workflow?')) {
            this.workflowService.delete(id)
                .subscribe({
                    next: () => {
                        this.workflows = this.workflows.filter(x => x.id !== id);
                        this.alertService.success('Workflow deleted successfully');
                    },
                    error: (error) => {
                        this.alertService.error('Error deleting workflow');
                        console.error('Error deleting workflow:', error);
                    }
                });
        }
    }
} 