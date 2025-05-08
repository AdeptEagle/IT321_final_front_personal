import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '@environments/environment';
import { Workflow } from '@app/_models/workflow';

const baseUrl = `${environment.apiUrl}/api/workflows`;

@Injectable({ providedIn: 'root' })
export class WorkflowService {
    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<Workflow[]>(baseUrl);
    }

    getByEmployeeId(employeeId: string) {
        return this.http.get<Workflow[]>(`${baseUrl}/employee/${employeeId}`);
    }

    getById(id: string) {
        return this.http.get<Workflow>(`${baseUrl}/${id}`);
    }

    create(params: any) {
        return this.http.post<Workflow>(baseUrl, params);
    }

    update(id: string, params: any) {
        return this.http.put<Workflow>(`${baseUrl}/${id}`, params);
    }

    delete(id: string) {
        return this.http.delete(`${baseUrl}/${id}`);
    }
} 