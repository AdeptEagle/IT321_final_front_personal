import { Employee } from '@app/_models';
import { WorkflowType, WorkflowStatus } from './workflow-type.enum';

export interface Workflow {
    id: string;
    type: WorkflowType;
    details: string;
    status: WorkflowStatus;
    employeeId: string;
    dateCreated: string;
    dateUpdated: string;
    employee?: Employee;
    comments?: WorkflowComment[];
    attachments?: WorkflowAttachment[];
    approverId?: string;
    approverName?: string;
    approvalDate?: string;
    rejectionReason?: string;
}

export interface WorkflowComment {
    id: string;
    workflowId: string;
    userId: string;
    userName: string;
    comment: string;
    dateCreated: string;
}

export interface WorkflowAttachment {
    id: string;
    workflowId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadDate: string;
    uploadedBy: string;
} 