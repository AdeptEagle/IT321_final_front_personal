import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize } from 'rxjs/operators';

import { AlertService } from '../_services/alert.service';
import { Role } from '../_models/role';

// array in local storage for accounts
const accountsKey = 'accountsKey';
const storedAccounts = localStorage.getItem(accountsKey);
let accounts = storedAccounts ? JSON.parse(storedAccounts) : [];

const departmentKey = 'departments';
const storedDepartments = localStorage.getItem(departmentKey);
let departments = storedDepartments ? JSON.parse(storedDepartments) : [];

const employeeKey = 'employees';
const storedEmployees = localStorage.getItem(employeeKey);
let employees = storedEmployees ? JSON.parse(storedEmployees) : [];

// array in local storage for workflows
const workflowsKey = 'angular-19-verification-boilerplate-workflows';
const storedWorkflows = localStorage.getItem(workflowsKey);
let workflows: any[] = storedWorkflows ? JSON.parse(storedWorkflows) : [];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {

    constructor(private alertService: AlertService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;
        const alertService = this.alertService;

        return handleRoute();                                                                                                  

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getList(accounts, accountsKey)
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getById(accounts, accountsKey)
                case url.endsWith('/accounts') && method === 'POST':
                    return createAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateAccount();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteAccount();
                // departments
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment();
                case url.endsWith('/departments') && method === 'GET':
                    return getList(departments, departmentKey)
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'GET':
                // return getDepartmentById();
                    return getById(departments, departmentKey)
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                case url.endsWith('/employees') && method === 'POST':
                    return createEmployee();
                case url.endsWith('/employees') && method === 'GET':
                    return getList(employees, employeeKey);
                case url.match(/\/employees\/\d+$/) && method === 'GET':
                    return getById(employees, employeeKey);
                case url.match(/\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'PATCH':
                    return transferEmployee();
                // Workflow endpoints
                case url.match(/\/api\/workflows\/\d+$/) && method === 'GET':
                    const workflowUrlParts = url.split('/');
                    const workflowId = workflowUrlParts[workflowUrlParts.length - 1];
                    const workflow = workflows.find(x => x.id.toString() === workflowId);
                    if (workflow) {
                        return ok(workflow);
                    } else {
                        return error('Workflow not found');
                    }
                case url.endsWith('/api/workflows') && method === 'GET':
                    return ok(workflows);
                case url.match(/\/api\/workflows\/employee\/\d+$/) && method === 'GET':
                    const employeeUrlParts = url.split('/');
                    const employeeId = employeeUrlParts[employeeUrlParts.length - 1];
                    const employeeWorkflows = workflows.filter(x => x.employeeId.toString() === employeeId);
                    return ok(employeeWorkflows);
                case url.endsWith('/api/workflows') && method === 'POST':
                    const newWorkflow = body;
                    newWorkflow.id = workflows.length ? Math.max(...workflows.map(x => parseInt(x.id))) + 1 : 1;
                    newWorkflow.dateCreated = new Date().toISOString();
                    newWorkflow.dateUpdated = new Date().toISOString();
                    workflows.push(newWorkflow);
                    localStorage.setItem(workflowsKey, JSON.stringify(workflows));
                    return ok(newWorkflow);
                case url.match(/\/api\/workflows\/\d+$/) && method === 'PUT':
                    const updateUrlParts = url.split('/');
                    const updateId = updateUrlParts[updateUrlParts.length - 1];
                    const params = body;
                    const workflowToUpdate = workflows.find(x => x.id.toString() === updateId);
                    if (!workflowToUpdate) {
                        return error('Workflow not found');
                    }
                    Object.assign(workflowToUpdate, params);
                    workflowToUpdate.dateUpdated = new Date().toISOString();
                    localStorage.setItem(workflowsKey, JSON.stringify(workflows));
                    return ok(workflowToUpdate);
                case url.match(/\/api\/workflows\/\d+$/) && method === 'DELETE':
                    const deleteUrlParts = url.split('/');
                    const deleteId = deleteUrlParts[deleteUrlParts.length - 1];
                    const workflowToDelete = workflows.find(x => x.id.toString() === deleteId);
                    if (!workflowToDelete) {
                        return error('Workflow not found');
                    }
                    workflows = workflows.filter(x => x.id.toString() !== deleteId);
                    localStorage.setItem(workflowsKey, JSON.stringify(workflows));
                    return ok();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { email, password } = body;
            const emailExist = accounts.find(x => x.email === email)
            if(!emailExist) return error('email doesnt exist')

            const account = accounts.find(x => x.email === email && x.password === password);
            if (!account) return error('password is incorrect');

            const isActive = accounts.find(x => x.email === email && x.password === password && x.isActive)
            if(!isActive) return error('Account is inActive. Please contact system Administrator!') 

            const isVerified = accounts.find(x => x.email === email && x.password === password && x.isVerified)
            if(!isVerified){
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4> 
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
                return error('Email is not verified')
            } 

            // const account = accounts.find(x => x.email === email && x.password === password && x.isVerified);
            // if(!account) return error('hell nah')

            // add refresh token to account
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                // ...basicAccountDetails(account),
                ...basicDetails(accountsKey, account),
                jwtToken: generateJwtToken(account)
            });
        }

        function refreshToken() {
            const refreshToken = getRefreshToken();
            
            if (!refreshToken) return unauthorized();

            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            if (!account) return unauthorized();

            // replace old refresh token with a new one and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            account.refreshTokens.push(generateRefreshToken());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok({
                // ...basicAccountDetails(account),
                ...basicDetails(accountsKey, account),
                jwtToken: generateJwtToken(account)
            });

        }

        function revokeToken() {
            if (!isAuthenticated()) return unauthorized();
            
            const refreshToken = getRefreshToken();
            const account = accounts.find(x => x.refreshTokens.includes(refreshToken));
            
            // revoke token and save
            account.refreshTokens = account.refreshTokens.filter(x => x !== refreshToken);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function register() {
            const account = body;

            if (accounts.find(x => x.email === account.email)) {
                // display email already registered "email" in alert
                setTimeout(() => {
                    alertService.info(`
                        <h4>Email Already Registered</h4>
                        <p>Your email ${account.email} is already registered.</p>
                        <p>If you don't know your password please visit the <a href="${location.origin}/account/forgot-password">forgot password</a> page.</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);

                // always return ok() response to prevent email enumeration
                return ok();
            }


            // assign account id and a few other properties then save
            account.id = newId(accounts);
            if (account.id === 1) {
                // first registered account is an admin
                account.role = Role.Admin;
                account.isVerified = true
            } else {
                account.role = Role.User;
                account.isVerified = false
            }
            account.isActive = true
            account.dateCreated = new Date().toISOString();
            account.verificationToken = new Date().getTime().toString();
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display verification email in alert

            if(account.id === 1){
                setTimeout(() => {
                    alertService.info(`
                        <h4>First user login</h4>
                        <p>you can login directly as first user where role is admin and account is verified</p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }
            else{
                setTimeout(() => {
                    const verifyUrl = `${location.origin}/account/verify-email?token=${account.verificationToken}`;
                    alertService.info(`
                        <h4>Verification Email</h4>
                        <p>Thanks for registering!</p>
                        <p>Please click the below link to verify your email address:</p>
                        <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                        <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                    `, { autoClose: false });
                }, 1000);
            }

            return ok();
        }
        
        function verifyEmail() {
            const { token } = body;
            const account = accounts.find(x => !!x.verificationToken && x.verificationToken === token);
            
            if (!account) return error('Verification failed');
            
            // set is verified flag to true if token is valid
            account.isVerified = true;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function forgotPassword() {
            const { email } = body;
            const account = accounts.find(x => x.email === email);
            
            // always return ok() response to prevent email enumeration
            if (!account) return ok();
            
            // create reset token that expires after 24 hours
            account.resetToken = new Date().getTime().toString();
            account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000).toISOString();
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // display password reset email in alert
            setTimeout(() => {
                const resetUrl = `${location.origin}/account/reset-password?token=${account.resetToken}`;
                alertService.info(`
                    <h4>Reset Password Email</h4>
                    <p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <div><strong>NOTE:</strong> The fake backend displayed this "email" so you can test without an api. A real backend would send a real email.</div>
                `, { autoClose: false });
            }, 1000);

            return ok();
        }
        
        function validateResetToken() {
            const { token } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            return ok();
        }

        function resetPassword() {
            const { token, password } = body;
            const account = accounts.find(x =>
                !!x.resetToken && x.resetToken === token &&
                new Date() < new Date(x.resetTokenExpires)
            );
            
            if (!account) return error('Invalid token');
            
            // update password and remove reset token
            account.password = password;
            account.isVerified = true;
            delete account.resetToken;
            delete account.resetTokenExpires;
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function getList(list, key){
            if (!isAuthenticated()) return unauthorized();
            return ok(list.map(x => basicDetails(key, x)));
        }

        function createAccount() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const account = body;
            if (accounts.find(x => x.email === account.email)) {
                console.log('email already registered')
                return error(`Email ${account.email} is already registered`);
            }

            // assign account id and a few other properties then save
            account.id = newId(accounts);
            account.dateCreated = new Date().toISOString();
            account.isVerified = true;
            account.refreshTokens = [];
            delete account.confirmPassword;
            accounts.push(account);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            return ok();
        }

        function updateAccount() {
            if (!isAuthenticated()) return unauthorized();

            let params = body;
            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can update own profile and admin accounts can update all profiles
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // only update password if included
            if (!params.password) {
                delete params.password;
            }
            // don't save confirm password
            delete params.confirmPassword;

            // update and save account
            Object.assign(account, params);
            localStorage.setItem(accountsKey, JSON.stringify(accounts));

            // return ok(basicAccountDetails(account));
            return ok(basicDetails(accountsKey, account));
        }

        function deleteAccount() {
            if (!isAuthenticated()) return unauthorized();

            let account = accounts.find(x => x.id === idFromUrl());

            // user accounts can delete own account and admin accounts can delete any account
            if (account.id !== currentAccount().id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            // delete account then save
            accounts = accounts.filter(x => x.id !== idFromUrl());
            localStorage.setItem(accountsKey, JSON.stringify(accounts));
            return ok();
        }

        function deleteDepartment(){
            if (!isAuthenticated()) return unauthorized();

            if (!isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            departments = departments.filter(x => x.id !== idFromUrl())
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            return ok()
        }
        
        // helper functions

        function ok(body?) {
            return of(new HttpResponse({ status: 200, body }))
                .pipe(delay(500)); // delay observable to simulate server api call
        }

        function error(message) {
            return throwError({ error: { message } })
                .pipe(materialize(), delay(500), dematerialize()); 
                // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648);
        }

        function unauthorized() {
            return throwError({ status: 401, error: { message: 'Unauthorized' } })
                .pipe(materialize(), delay(500), dematerialize());
        }

        function basicDetails(key, list){
            if(key === 'accountsKey'){
                const { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive } = list;
                return { id, title, firstName, lastName, email, role, dateCreated, isVerified, isActive };
            }
            else if(key === 'departments'){
                const { id, name, description } = list;
                return { id, name, description };
            }
            else if(key === 'employees'){
                const { id, employeeId, position, userId, departmentId, hireDate, isActive } = list;
                const account = accounts.find(x => x.id.toString() === userId);
                const department = departments.find(x => x.id.toString() === departmentId);
                return { 
                    id, 
                    employeeId,
                    position, 
                    userId, 
                    departmentId, 
                    hireDate,
                    isActive,
                    account: account ? basicDetails('accountsKey', account) : null,
                    department: department ? basicDetails('departments', department) : null
                };
            }
        }

        function isAuthenticated() {
            return !!currentAccount();
        }

        function isAuthorized(role) {
            const account = currentAccount();
            if (!account) return false;
            return account.role === role;
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function newId(list) {
            return list.length ? Math.max(...list.map(x => x.id)) + 1 : 1;
        }

        function currentAccount() {
            // check if jwt token is in auth header
            const authHeader = headers.get('Authorization');
            if (!authHeader || !authHeader.startsWith('Bearer fake-jwt-token')) return;

            // check if token is expired
            const jwtToken = JSON.parse(atob(authHeader.split('.')[1]));
            const tokenExpired = Date.now() > (jwtToken.exp * 1000);
            if (tokenExpired) return;

            const account = accounts.find(x => x.id === jwtToken.id);
            return account;
        }           

        function generateJwtToken(account) {
            // create token that expires in 15 minutes
            const tokenPayload = { 
                exp: Math.round(new Date(Date.now() + 15*60*1000).getTime() / 1000),
                // exp: 1,
                id: account.id
            }
            return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
        }

        function generateRefreshToken() {
            const token = new Date().getTime().toString();

            // add token cookie that expires in 7 days
            const expires = new Date(Date.now() + 7*24*60*60*1000).toUTCString();
            document.cookie = `fakeRefreshToken=${token}; expires=${expires}; path=/`;
            
            return token;
        }

        function getRefreshToken() {
            // get refresh token from cookie
            return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
        }

        // department functions
        function createDepartment(){
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const department = body;

            if(departments.find(x => x.name === department.name)){
                return error('name already registered. pag pili ug lain bithc')
            }

            department.id = newId(departments)
            departments.push(department)
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            return ok()
        }

        function updateDepartment(){
            if (!isAuthenticated()) return unauthorized();
            let params = body
            let department = departments.find(x => x.id === idFromUrl())

            Object.assign(department, params)
            localStorage.setItem(departmentKey, JSON.stringify(departments))
            console.log(`updating department`)
            return ok(basicDetails(departmentKey, department))
        }

        function getById(listType, key){
            if (!isAuthenticated()) return unauthorized();
            
            const id = idFromUrl();
            let list = listType.find(x => x.id.toString() === id.toString());
            if (!list) return error('Item not found');

            const currentUser = currentAccount();
            if (key === 'accountsKey' && currentUser && list.id !== currentUser.id && !isAuthorized(Role.Admin)) {
                return unauthorized();
            }

            return ok(basicDetails(key, list))
        }

        // employee functions
        function createEmployee() {
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const employee = body;
            
            // Check if user exists
            const user = accounts.find(x => x.id.toString() === employee.userId);
            if (!user) {
                return error('User not found');
            }
            
            // Check if user already has an employee record
            if (employees.find(x => x.userId === employee.userId)) {
                return error('User already has an employee record');
            }

            // Check if department exists
            const department = departments.find(x => x.id.toString() === employee.departmentId);
            if (!department) {
                return error('Department not found');
            }

            // Create new employee
            employee.id = newId(employees).toString();
            employee.isActive = true;
            employees.push(employee);
            localStorage.setItem(employeeKey, JSON.stringify(employees));

            // Return the created employee with account and department info
            return ok(basicDetails('employees', employee));
        }

        function updateEmployee() {
            if (!isAuthenticated()) return unauthorized();
            if (!isAuthorized(Role.Admin)) return unauthorized();

            let params = body;
            const id = idFromUrl().toString();
            let employee = employees.find(x => x.id === id);
            if (!employee) return error('Employee not found');

            Object.assign(employee, params);
            localStorage.setItem(employeeKey, JSON.stringify(employees));
            return ok(basicDetails(employeeKey, employee));
        }

        function deleteEmployee() {
            if (!isAuthenticated()) return unauthorized();
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const employeeId = idFromUrl().toString(); // Ensure ID is a string for comparison
            console.log('Deleting employee with ID:', employeeId); // Debug log

            const initialLength = employees.length;
            employees = employees.filter(x => x.id !== employeeId);

            if (employees.length === initialLength) {
                console.error('Employee not found or already deleted:', employeeId); // Debug log
                return error('Employee not found');
            }

            console.log('Updated employees list after deletion:', employees); // Debug log

            localStorage.setItem(employeeKey, JSON.stringify(employees));
            return ok();
        }

        function transferEmployee() {
            if (!isAuthenticated()) return unauthorized();
            if (!isAuthorized(Role.Admin)) return unauthorized();

            const employeeId = idFromUrl().toString();
            const { departmentId } = body;

            // Find the employee
            const employee = employees.find(x => x.id.toString() === employeeId);
            if (!employee) {
                return error('Employee not found');
            }

            // Validate the new department
            const department = departments.find(x => x.id.toString() === departmentId);
            if (!department) {
                return error('Invalid department ID');
            }

            // Update the employee's department
            employee.departmentId = departmentId;
            localStorage.setItem(employeeKey, JSON.stringify(employees));

            return ok(basicDetails('employees', employee));
        }
    }
}

export let fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};