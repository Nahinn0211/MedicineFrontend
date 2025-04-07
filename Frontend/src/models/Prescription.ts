import { BaseEntity } from "./BaseEntity";
import { DoctorProfile } from "./DoctorProfile";
import { Medicine } from "./Medicine";
import { PatientProfile } from "./PatientProfile";

export interface Prescription extends BaseEntity{
    doctorId?: number;
    patientId?: number;
    medicineId?: number;
    dosage?: string;
    doctor?: DoctorProfile;
    patient?: PatientProfile;
    medicine?: Medicine;
}