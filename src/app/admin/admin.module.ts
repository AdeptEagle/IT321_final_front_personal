import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { RouterModule } from '@angular/router';

import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';
import { EmployeeTransferComponent } from './employee-transfer/employee-transfer.component';
import { WorkflowListComponent } from './employees/workflow-list.component';
import { WorkflowFormComponent } from './employees/workflow-form.component';
import { WorkflowModalComponent } from './employees/workflow-modal.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AdminRoutingModule,
        RouterModule
    ],
    declarations: [
        SubNavComponent,
        LayoutComponent,
        OverviewComponent,
        EmployeeTransferComponent,
        WorkflowListComponent,
        WorkflowFormComponent,
        WorkflowModalComponent
    ]
})
export class AdminModule { }