import { BaseEntity } from "./BaseEntity";
import { DoctorProfile } from "./DoctorProfile";
import { Service } from "./Service";

export interface DoctorService extends BaseEntity{
    serviceId?: number;
    doctorId?: number;
    service?: Service;
    doctor?: DoctorProfile;
}