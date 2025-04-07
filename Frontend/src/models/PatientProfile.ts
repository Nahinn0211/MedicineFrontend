import { BaseEntity } from "./BaseEntity";
import { User } from "./User";

export interface PatientProfile extends BaseEntity{
    userId?: number;
    bloodType?: string;
    medicalHistory?: string;
    allergies?: string;
    accountBalance?: string;
    user?: User
}