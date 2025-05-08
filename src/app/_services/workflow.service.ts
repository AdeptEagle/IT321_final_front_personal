import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Workflow } from '@app/_models/workflow';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    private baseUrl = `${environment.apiUrl}/api/workflows`;

    constructor(private http: HttpClient) { }

    getAll(): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(this.baseUrl)
            .pipe(
                map(response => this.mapWorkflows(response))
            );
    }

    getByEmployeeId(employeeId: string): Observable<Workflow[]> {
        return this.http.get<Workflow[]>(`${this.baseUrl}/employee/${employeeId}`)
            .pipe(
                map(response => this.mapWorkflows(response))
            );
    }

    getById(id: string): Observable<Workflow> {
        return this.http.get<Workflow>(`${this.baseUrl}/${id}`)
            .pipe(
                map(response => this.mapWorkflow(response))
            );
    }

    create(params: any): Observable<Workflow> {
        return this.http.post<Workflow>(this.baseUrl, params)
            .pipe(
                map(response => this.mapWorkflow(response))
            );
    }

    update(id: string, params: any): Observable<Workflow> {
        return this.http.put<Workflow>(`${this.baseUrl}/${id}`, params)
            .pipe(
                map(response => this.mapWorkflow(response))
            );
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

    // Helper methods to ensure consistent data structure
    private mapWorkflows(workflows: any[]): Workflow[] {
        return workflows.map(w => this.mapWorkflow(w));
    }

    private mapWorkflow(workflow: any): Workflow {
        return {
            id: workflow.id?.toString(),
            type: workflow.type,
            details: workflow.details,
            status: workflow.status,
            employeeId: workflow.employeeId?.toString(),
            dateCreated: workflow.dateCreated,
            dateUpdated: workflow.dateUpdated,
            employee: workflow.employee,
            comments: workflow.comments?.map(c => ({
                id: c.id?.toString(),
                workflowId: c.workflowId?.toString(),
                userId: c.userId?.toString(),
                userName: c.userName,
                comment: c.comment,
                dateCreated: c.dateCreated
            })),
            attachments: workflow.attachments?.map(a => ({
                id: a.id?.toString(),
                workflowId: a.workflowId?.toString(),
                fileName: a.fileName,
                fileType: a.fileType,
                fileSize: a.fileSize,
                uploadDate: a.uploadDate,
                uploadedBy: a.uploadedBy
            })),
            approverId: workflow.approverId?.toString(),
            approverName: workflow.approverName,
            approvalDate: workflow.approvalDate,
            rejectionReason: workflow.rejectionReason
        };
    }
} 