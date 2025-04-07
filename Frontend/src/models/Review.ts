import { BaseEntity } from "./BaseEntity";
import { DoctorProfile } from "./DoctorProfile";
import { Medicine } from "./Medicine";
import { User } from "./User";

export interface Review extends BaseEntity{
    userId?: number;
    rating?: number;
    comment?: string;
    doctorId?: number;
    medicineId?: number;
    doctor?: DoctorProfile;
    medicine?: Medicine;
    user?: User;
}