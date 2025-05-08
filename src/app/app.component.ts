import { Component } from '@angular/core';

import { AccountService } from './_services';
import { Account, Role } from './_models';

@Component({ 
    selector: 'app', 
    templateUrl: 'app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    Role = Role;
    account: Account | null = null;
    loading = false;

    constructor(private accountService: AccountService) {
        this.accountService.account.subscribe(x => this.account = x);
        this.accountService.loading.subscribe(x => this.loading = x);
    }
    
    logout() {
        this.accountService.logout();
    }
}