import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeesRoutingModule } from './employees-routing.module';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { TransferModalComponent } from './transfer-modal/transfer-modal.component';


@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        EmployeesRoutingModule
    ],
    declarations: [
        ListComponent,
        AddEditComponent,
        TransferModalComponent
    ]
})
export class EmployeesModule { }

