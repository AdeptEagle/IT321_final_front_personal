import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ 
    selector: 'app', 
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit, OnDestroy {
    Role = Role;
    account: Account | null = null;
    loading = false;
    private subscriptions: Subscription[] = [];

    constructor(private accountService: AccountService) {}

    ngOnInit() {
        // Subscribe to account changes
        this.subscriptions.push(
            this.accountService.account.subscribe(x => {
                console.log('Account state changed:', x);
                this.account = x;
            })
        );

        // Subscribe to loading state
        this.subscriptions.push(
            this.accountService.loading.subscribe(x => {
                console.log('Loading state changed:', x);
                this.loading = x;
            })
        );
    }

    ngOnDestroy() {
        // Unsubscribe from all subscriptions
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
    
    logout() {
        this.accountService.logout();
    }
}