export class Alert {
    id: string;
    type: AlertType;
    message: string;
    autoClose: boolean;
    keepAfterRouteChange: boolean;
    fade: boolean;

    constructor(init?:Partial<Alert>) {
        Object.assign(this, init);
        this.autoClose = true;
        this.fade = true;
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning
}