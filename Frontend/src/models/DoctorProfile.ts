import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

export interface DoctorProfile extends BaseEntity{
    experience?: string;
    specialization?: string;
    workplace?: string;
    accountBalance?: number;
    userId?: number;
    user?: User
}