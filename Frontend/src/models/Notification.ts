import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

export interface Notification extends BaseEntity{
    userId?: number;
    message?: string;
    user: User
}