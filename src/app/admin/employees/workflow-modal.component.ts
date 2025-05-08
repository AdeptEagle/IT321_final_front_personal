import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { WorkflowService } from '@app/_services/workflow.service';
import { Workflow } from '@app/_models/workflow';
import { AlertService } from '@app/_services/alert.service';
import { WorkflowStatus } from '@app/_models/workflow-type.enum';

@Component({
    selector: 'app-workflow-modal',
    template: `
        <div class="modal-backdrop" (click)="onClose()">
            <div class="modal-content" (click)="$event.stopPropagation()">
                <div class="modal-header">
                    <h3>Employee Workflows</h3>
                    <button type="button" class="close" (click)="onClose()">&times;</button>
                </div>
                <div class="modal-body">
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
            </div>
        </div>
    `,
    styles: [`
        .modal-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background: white;
            padding: 20px;
            border-radius: 4px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }
        .close {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
        }
        .table {
            margin-bottom: 1rem;
        }
        .badge {
            padding: 0.5em 0.75em;
        }
    `]
})
export class WorkflowModalComponent implements OnInit {
    @Input() employeeId: string;
    @Output() close = new EventEmitter<void>();

    workflows: Workflow[] = [];
    showForm = false;
    selectedWorkflow: Workflow;

    constructor(
        private workflowService: WorkflowService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        console.log('WorkflowModalComponent initialized with employeeId:', this.employeeId);
        if (!this.employeeId) {
            console.error('No employeeId provided to WorkflowModalComponent');
            return;
        }
        this.loadWorkflows();
    }

    loadWorkflows() {
        console.log('Loading workflows for employeeId:', this.employeeId);
        if (!this.employeeId) {
            console.error('Cannot load workflows: No employeeId provided');
            return;
        }
        this.workflowService.getByEmployeeId(this.employeeId)
            .subscribe({
                next: (workflows) => {
                    console.log('Workflows loaded:', workflows);
                    this.workflows = workflows;
                },
                error: (error) => {
                    console.error('Error loading workflows:', error);
                    this.alertService.error('Error loading workflows');
                }
            });
    }

    showAddForm() {
        console.log('Showing add form');
        this.selectedWorkflow = null;
        this.showForm = true;
    }

    editWorkflow(workflow: Workflow) {
        console.log('Editing workflow:', workflow);
        this.selectedWorkflow = workflow;
        this.showForm = true;
    }

    hideForm() {
        console.log('Hiding form');
        this.showForm = false;
        this.selectedWorkflow = null;
    }

    onWorkflowSaved(workflow: Workflow) {
        console.log('Workflow saved:', workflow);
        this.loadWorkflows();
        this.hideForm();
    }

    deleteWorkflow(id: string) {
        console.log('Deleting workflow:', id);
        if (confirm('Are you sure you want to delete this workflow?')) {
            this.workflowService.delete(id)
                .subscribe({
                    next: () => {
                        console.log('Workflow deleted successfully');
                        this.workflows = this.workflows.filter(x => x.id !== id);
                        this.alertService.success('Workflow deleted successfully');
                    },
                    error: (error) => {
                        console.error('Error deleting workflow:', error);
                        this.alertService.error('Error deleting workflow');
                    }
                });
        }
    }

    onClose() {
        console.log('Closing modal');
        this.close.emit();
    }
} 