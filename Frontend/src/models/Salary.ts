import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

export interface Salary extends BaseEntity{
    userId?: number;
    bankCode?: string;
    bankName?: string;
    price?: number;
    status?: PaymentStatus;
    user?: User
}