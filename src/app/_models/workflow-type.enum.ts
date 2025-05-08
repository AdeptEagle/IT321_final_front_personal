export enum WorkflowType {
    ONBOARDING = 'Onboarding',
    DEPARTMENT_TRANSFER = 'Department Transfer',
    LEAVE_REQUEST = 'Leave Request',
    OVERTIME_REQUEST = 'Overtime Request',
    EXPENSE_CLAIM = 'Expense Claim',
    TRAINING_REQUEST = 'Training Request',
    EQUIPMENT_REQUEST = 'Equipment Request'
}

export enum WorkflowStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
    COMPLETED = 'Completed'
} 