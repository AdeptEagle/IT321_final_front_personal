import { Employee } from '@app/_models';

export class Workflow {
    id: string;
    type: string;        // Type of workflow (e.g., Leave Request, Overtime, etc.)
    details: string;     // Detailed description of the workflow
    status: string;      // Status (Pending, Approved, Rejected, etc.)
    employeeId: string;  // Reference to the employee
    dateCreated: string;
    dateUpdated: string;
    employee?: Employee; // Optional employee details
} 